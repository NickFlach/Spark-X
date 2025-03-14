import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Search, Filter, ArrowUpDown } from 'lucide-react';
import { Link } from 'wouter';

interface Idea {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'submitted' | 'in_review' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  userId: string;
  category: string;
  votes: number;
}

export default function IdeasPage() {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        // This would be replaced with an actual API call
        const response = await fetch('/api/ideas');
        const data = await response.json();
        setIdeas(data);
      } catch (error) {
        console.error('Failed to fetch ideas:', error);
        // For demo purposes, set some mock data
        setIdeas([
          {
            id: '1',
            title: 'Decentralized Identity Verification',
            description: 'A blockchain-based system for secure identity verification without centralized authorities.',
            status: 'approved',
            createdAt: '2023-05-15T10:30:00Z',
            updatedAt: '2023-05-20T14:45:00Z',
            userId: '123',
            category: 'Identity',
            votes: 42
          },
          {
            id: '2',
            title: 'Smart Contract Insurance',
            description: 'Insurance products for smart contract failures and vulnerabilities.',
            status: 'in_review',
            createdAt: '2023-06-01T09:15:00Z',
            updatedAt: '2023-06-05T11:20:00Z',
            userId: '456',
            category: 'Finance',
            votes: 28
          },
          {
            id: '3',
            title: 'Tokenized Carbon Credits',
            description: 'Blockchain-based marketplace for trading carbon credits as tokens.',
            status: 'submitted',
            createdAt: '2023-06-10T16:45:00Z',
            updatedAt: '2023-06-10T16:45:00Z',
            userId: user?.id || '789',
            category: 'Environment',
            votes: 15
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIdeas();
  }, [user]);

  const filteredIdeas = ideas
    .filter(idea => {
      // Apply search filter
      if (searchTerm && !idea.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !idea.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Apply status filter
      if (filter !== 'all' && idea.status !== filter) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Apply sorting
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'most_votes':
          return b.votes - a.votes;
        case 'least_votes':
          return a.votes - b.votes;
        default:
          return 0;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'in_review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading ideas...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Ideas Marketplace</h1>
        <Link href="/ideas/new">
          <a className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            <Plus className="h-5 w-5 mr-2" />
            New Idea
          </a>
        </Link>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search ideas..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <div className="relative inline-block text-left">
            <select
              className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="in_review">In Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          <div className="relative inline-block text-left">
            <select
              className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="most_votes">Most Votes</option>
              <option value="least_votes">Least Votes</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ArrowUpDown className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {filteredIdeas.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No ideas found matching your criteria.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredIdeas.map((idea) => (
              <li key={idea.id}>
                <Link href={`/ideas/${idea.id}`}>
                  <a className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <p className="text-lg font-medium text-primary truncate">{idea.title}</p>
                          <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(idea.status)}`}>
                            {idea.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {idea.votes} votes
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {idea.description.length > 150 
                              ? `${idea.description.substring(0, 150)}...` 
                              : idea.description}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            Created on {formatDate(idea.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 