import { ethers } from 'ethers';
import SparkTokenABI from '@/contracts/abi/SparkToken.json';

// Types
export type Web3Status = 'disconnected' | 'connecting' | 'connected' | 'error';

interface Web3Service {
  status: Web3Status;
  account: string | null;
  error: string | null;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  tokenContract: ethers.Contract | null;
  connect: () => Promise<boolean>;
  disconnect: () => Promise<void>;
  getBalance: () => Promise<string>;
  transferTokens: (to: string, amount: string) => Promise<ethers.providers.TransactionResponse>;
  getExplorerUrl: () => string;
}

// Configuration
const NETWORK_ID = process.env.NEXT_PUBLIC_NETWORK_ID || '1'; // Default to Ethereum mainnet
const TOKEN_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS || '0x216490C8E6b33b4d8A2390dADcf9f433E30da60F';

// Explorer URLs by network ID
const EXPLORER_URLS: Record<string, string> = {
  '1': 'https://etherscan.io',
  '5': 'https://goerli.etherscan.io',
  '11155111': 'https://sepolia.etherscan.io',
  '137': 'https://polygonscan.com',
  '80001': 'https://mumbai.polygonscan.com',
};

// Implementation
class Web3ServiceImpl implements Web3Service {
  status: Web3Status = 'disconnected';
  account: string | null = null;
  error: string | null = null;
  provider: ethers.providers.Web3Provider | null = null;
  signer: ethers.Signer | null = null;
  tokenContract: ethers.Contract | null = null;

  constructor() {
    // Initialize if window.ethereum is available
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new ethers.providers.Web3Provider(window.ethereum);

      // Check if user is already connected
      this.checkConnection();
    }
  }

  private async checkConnection() {
    try {
      // Get connected accounts
      const accounts = await this.provider!.listAccounts();

      if (accounts.length > 0) {
        this.account = accounts[0];
        this.status = 'connected';
        this.signer = this.provider!.getSigner();
        this.initializeContracts();
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  }

  private initializeContracts() {
    if (!this.signer) {
      return;
    }

    this.tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, SparkTokenABI, this.signer);
  }

  async connect(): Promise<boolean> {
    if (!this.provider) {
      this.error = 'MetaMask or compatible wallet not found';
      this.status = 'error';
      return false;
    }

    try {
      this.status = 'connecting';

      // Request account access
      const accounts = await this.provider.send('eth_requestAccounts', []);

      if (accounts.length === 0) {
        this.error = 'No accounts found';
        this.status = 'error';
        return false;
      }

      this.account = accounts[0];
      this.status = 'connected';
      this.signer = this.provider.getSigner();
      this.initializeContracts();

      return true;
    } catch (error) {
      console.error('Connection error:', error);
      this.error = error instanceof Error ? error.message : 'Failed to connect';
      this.status = 'error';
      return false;
    }
  }

  async disconnect(): Promise<void> {
    this.account = null;
    this.signer = null;
    this.tokenContract = null;
    this.status = 'disconnected';
    this.error = null;
  }

  async getBalance(): Promise<string> {
    if (!this.tokenContract || !this.account) {
      throw new Error('Not connected to wallet or contract not initialized');
    }

    try {
      const balance = await this.tokenContract.balanceOf(this.account);
      return ethers.utils.formatUnits(balance, 18); // Assuming 18 decimals for the token
    } catch (error) {
      console.error('Error fetching balance:', error);
      throw error;
    }
  }

  async transferTokens(to: string, amount: string): Promise<ethers.providers.TransactionResponse> {
    if (!this.tokenContract) {
      throw new Error('Token contract not initialized');
    }

    if (!ethers.utils.isAddress(to)) {
      throw new Error('Invalid recipient address');
    }

    try {
      const parsedAmount = ethers.utils.parseUnits(amount, 18); // Assuming 18 decimals
      const tx = await this.tokenContract.transfer(to, parsedAmount);
      return tx;
    } catch (error) {
      console.error('Transfer error:', error);
      throw error;
    }
  }

  getExplorerUrl(): string {
    return EXPLORER_URLS[NETWORK_ID] || 'https://etherscan.io';
  }
}

// Singleton instance
export const web3Service = new Web3ServiceImpl();
