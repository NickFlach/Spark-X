import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { web3Service, Web3Status } from '@/lib/web3';
import { useToast } from '@/hooks/use-toast';

interface Web3ContextType {
  connect: () => Promise<boolean>;
  disconnect: () => Promise<void>;
  status: Web3Status;
  account: string | null;
  balance: string | null;
  error: string | null;
  explorerUrl: string;
  transferTokens: (to: string, amount: string) => Promise<void>;
}

// Create a default context value to avoid undefined errors
const defaultWeb3Context: Web3ContextType = {
  connect: async () => false,
  disconnect: async () => {},
  status: 'disconnected',
  account: null,
  balance: null,
  error: null,
  explorerUrl: '',
  transferTokens: async () => {
    throw new Error('Web3 context not initialized');
  },
};

const Web3Context = createContext<Web3ContextType>(defaultWeb3Context);

export function Web3Provider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Web3Status>(web3Service.status);
  const [account, setAccount] = useState<string | null>(web3Service.account);
  const [balance, setBalance] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(web3Service.error);
  const { toast } = useToast();

  const updateState = async () => {
    setStatus(web3Service.status);
    setAccount(web3Service.account);
    setError(web3Service.error);

    if (web3Service.status === 'connected' && web3Service.account) {
      try {
        const tokenBalance = await web3Service.getBalance();
        setBalance(tokenBalance);
      } catch (err) {
        console.error('Error fetching balance:', err);
        setBalance(null);
      }
    } else {
      setBalance(null);
    }
  };

  // Listen for account changes
  useEffect(() => {
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected
        disconnect();
      } else if (account !== accounts[0]) {
        // Account changed
        setAccount(accounts[0]);
        updateState();
      }
    };

    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [account]);

  const connect = async () => {
    try {
      const success = await web3Service.connect();
      await updateState();

      if (success) {
        toast({
          title: 'Wallet Connected',
          description: `Connected to ${web3Service.account}`,
        });
      }

      return success;
    } catch (err) {
      console.error('Connection error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);

      toast({
        variant: 'destructive',
        title: 'Connection Failed',
        description: errorMessage,
      });

      return false;
    }
  };

  const disconnect = async () => {
    await web3Service.disconnect();
    await updateState();

    toast({
      title: 'Wallet Disconnected',
      description: 'Your wallet has been disconnected.',
    });
  };

  const transferTokens = async (to: string, amount: string) => {
    try {
      const tx = await web3Service.transferTokens(to, amount);

      toast({
        title: 'Transfer Successful',
        description: `Transferred ${amount} tokens to ${to.substring(0, 6)}...`,
      });

      // Update balance after transfer
      const newBalance = await web3Service.getBalance();
      setBalance(newBalance);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transfer failed';

      toast({
        variant: 'destructive',
        title: 'Transfer Failed',
        description: errorMessage,
      });

      throw err;
    }
  };

  return (
    <Web3Context.Provider
      value={{
        connect,
        disconnect,
        status,
        account,
        balance,
        error,
        explorerUrl: web3Service.getExplorerUrl(),
        transferTokens,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  return useContext(Web3Context);
}
