import { useQuery } from '@tanstack/react-query';
import { formatDate } from '@/lib/utils';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { truncateAddress } from '@/lib/utils';
import { Transaction } from '@shared/schema';
import { useAuth } from '@/contexts/AuthContext';

export default function TokenActivity() {
  const { user } = useAuth();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['/api/transactions'],
    enabled: !!user,
  });

  // Spark token contract address
  const contractAddress = '0x216490C8E6b33b4d8A2390dADcf9f433E30da60F';

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <CardTitle className="text-sm font-semibold text-gray-700 mb-3">Token Activity</CardTitle>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center">
                <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                <div className="ml-3 flex-1">
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {transactions?.slice(0, 4).map((transaction: Transaction) => (
              <div key={transaction.id} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 ${
                    transaction.type === 'earn' ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                >
                  {transaction.type === 'earn' ? (
                    <ArrowDownRight className="h-4 w-4" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4" />
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">
                      {transaction.type === 'earn' ? 'You received' : 'You spent'}{' '}
                      {Math.abs(transaction.amount)} SPARK
                    </span>{' '}
                    {transaction.description}
                  </p>
                  <p className="text-xs text-gray-500">{formatDate(transaction.createdAt)}</p>
                </div>
              </div>
            ))}

            {(!transactions || transactions.length === 0) && (
              <p className="text-sm text-gray-500 text-center py-2">No recent transactions</p>
            )}
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-semibold text-gray-500">CONTRACT</h4>
            <a
              href={`https://etherscan.io/token/${contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary-500 hover:text-primary-600 flex items-center"
            >
              View on Explorer
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
          <div className="mt-1 bg-gray-100 rounded-md p-2 text-xs font-mono text-gray-700 break-all">
            {truncateAddress(contractAddress)}
          </div>
        </div>

        {transactions && transactions.length > 0 && (
          <div className="mt-4">
            <a
              href="#"
              className="block text-center text-sm text-primary-500 hover:text-primary-600"
            >
              View All Transactions
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
