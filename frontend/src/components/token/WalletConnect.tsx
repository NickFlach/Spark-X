import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWeb3 } from '@/contexts/Web3Context';
import { truncateAddress } from '@/lib/utils';
import { Wallet } from 'lucide-react';

export default function WalletConnect() {
  const { status, account, balance, connect, disconnect } = useWeb3();

  const handleConnect = async () => {
    await connect();
  };

  const handleDisconnect = async () => {
    await disconnect();
  };

  return (
    <Card className="mb-6 border border-gray-200">
      <CardContent className="p-4">
        <div className="text-center py-4">
          <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Wallet className="h-8 w-8 text-primary-500" />
          </div>

          {status === 'connected' && account ? (
            <>
              <h3 className="text-base font-medium text-gray-900 mb-1">Wallet Connected</h3>
              <div className="bg-gray-100 rounded-md p-2 text-xs font-mono text-gray-700 break-all mb-2">
                {truncateAddress(account)}
              </div>

              {balance && (
                <div className="bg-green-50 rounded-md p-2 mb-4">
                  <span className="text-sm font-medium text-gray-700">Balance:</span>
                  <span className="ml-2 text-green-700 font-semibold">{balance} SPARK</span>
                </div>
              )}

              <Button variant="outline" className="w-full" onClick={handleDisconnect}>
                Disconnect Wallet
              </Button>
            </>
          ) : (
            <>
              <h3 className="text-base font-medium text-gray-900 mb-1">Connect Your Wallet</h3>
              <p className="text-sm text-gray-500 mb-4">
                Link your web3 wallet to manage your Spark tokens directly
              </p>

              <Button className="w-full" onClick={handleConnect} disabled={status === 'connecting'}>
                {status === 'connecting' ? 'Connecting...' : 'Connect Wallet'}
              </Button>

              <p className="mt-2 text-xs text-gray-500">
                Supports MetaMask, WalletConnect, and more
              </p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
