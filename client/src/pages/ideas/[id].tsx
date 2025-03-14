import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, ThumbsUp, MessageSquare, Share2, Edit, Trash2, AlertTriangle } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  userName: string;
}

interface Idea {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'submitted' | 'in_review' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  userId: string;
  userName: string;
  category: string;
  votes: number;
  comments: Comment[];
}

export default function IdeaDetailPage() {
  const [, params] = useRoute('/ideas/:id');
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    const fetchIdea = async () => {
      if (!params?.id) return;
      
      try {
        // This would be replaced with an actual API call
        // const response = await fetch(`/api/ideas/${params.id}`);
        // const data = await response.json();
        
        // Mock data for demonstration
        const mockIdea: Idea = {
          id: params.id,
          title: 'Decentralized Identity Verification',
          description: 'A blockchain-based system for secure identity verification without centralized authorities. This system would allow users to control their own identity data and share only what is necessary with service providers. The solution would use zero-knowledge proofs to verify claims without revealing the underlying data.\n\nKey features:\n- Self-sovereign identity management\n- Selective disclosure of attributes\n- Cryptographic verification\n- Immutable audit trail\n- Cross-platform compatibility',
          status: 'approved',
          createdAt: '2023-05-15T10:30:00Z',
          updatedAt: '2023-05-20T14:45:00Z',
          userId: '123',
          userName: 'Alex Johnson',
          category: 'Identity',
          votes: 42,
          comments: [
            {
              id: '101',
              content: "This is a great idea! I think it could really solve the identity theft problems we're seeing.",
              createdAt: '2023-05-16T08:20:00Z',
              userId: '456',
              userName: 'Sarah Chen'
            },
            {
              id: '102',
              content: 'Have you considered how this would work with existing KYC regulations?',
              createdAt: '2023-05-17T14:35:00Z',
              userId: '789',
              userName: 'Michael Rodriguez'
            }
          ]
        };
        
        setIdea(mockIdea);
        // Check if user has voted - would be an API call in production
        setHasVoted(false);
      } catch (err) {
        console.error('Failed to fetch idea:', err);
        setError('Failed to load the idea. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchIdea();
  }, [params?.id]);

  const handleVote = async () => {
    if (!idea || !user) return;
    
    try {
      // This would be an API call in production
      // await fetch(`/api/ideas/${idea.id}/vote`, { method: 'POST' });
      
      // Update local state
      setIdea({
        ...idea,
        votes: hasVoted ? idea.votes - 1 : idea.votes + 1
      });
      setHasVoted(!hasVoted);
    } catch (err) {
      console.error('Failed to vote:', err);
      // Show error message
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !idea || !user) return;
    
    setIsSubmittingComment(true);
    
    try {
      // This would be an API call in production
      // const response = await fetch(`/api/ideas/${idea.id}/comments`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ content: newComment })
      // });
      // const data = await response.json();
      
      // Mock response
      const newCommentObj: Comment = {
        id: `comment-${Date.now()}`,
        content: newComment,
        createdAt: new Date().toISOString(),
        userId: user.id,
        userName: user.name || 'Anonymous'
      };
      
      setIdea({
        ...idea,
        comments: [...idea.comments, newCommentObj]
      });
      setNewComment('');
    } catch (err) {
      console.error('Failed to submit comment:', err);
      // Show error message
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteIdea = async () => {
    if (!idea || !user || user.id !== idea.userId) return;
    
    if (window.confirm('Are you sure you want to delete this idea? This action cannot be undone.')) {
      try {
        // This would be an API call in production
        // await fetch(`/api/ideas/${idea.id}`, { method: 'DELETE' });
        
        // Redirect to ideas list
        setLocation('/ideas');
      } catch (err) {
        console.error('Failed to delete idea:', err);
        // Show error message
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading idea...</div>;
  }

  if (error || !idea) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Idea</h2>
        <p className="text-gray-600">{error || 'Idea not found'}</p>
        <button 
          onClick={() => setLocation('/ideas')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Ideas
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button 
        onClick={() => setLocation('/ideas')}
        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Ideas
      </button>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{idea.title}</h1>
              <div className="mt-1 flex items-center">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(idea.status)}`}>
                  {idea.status.replace('_', ' ')}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  {idea.category}
                </span>
              </div>
            </div>
            
            {user && user.id === idea.userId && (
              <div className="flex space-x-2">
                <button 
                  onClick={() => setLocation(`/ideas/edit/${idea.id}`)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </button>
                <button 
                  onClick={handleDeleteIdea}
                  className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </button>
              </div>
            )}
          </div>
          
          <div className="mt-2 text-sm text-gray-500">
            <p>Proposed by {idea.userName} on {formatDate(idea.createdAt)}</p>
            {idea.updatedAt !== idea.createdAt && (
              <p>Last updated on {formatDate(idea.updatedAt)}</p>
            )}
          </div>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="prose max-w-none">
            {idea.description.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4">{paragraph}</p>
            ))}
          </div>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-4 sm:px-6 flex justify-between items-center">
          <div className="flex space-x-4">
            <button 
              onClick={handleVote}
              className={`inline-flex items-center px-3 py-2 border ${hasVoted ? 'border-primary bg-primary-light text-primary' : 'border-gray-300 bg-white text-gray-700'} shadow-sm text-sm leading-4 font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              {hasVoted ? 'Voted' : 'Vote'} ({idea.votes})
            </button>
            <button 
              onClick={() => document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Comments ({idea.comments.length})
            </button>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                // Show toast notification
              }}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </button>
          </div>
        </div>
      </div>
      
      <div id="comments-section" className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Comments ({idea.comments.length})</h2>
        
        {user ? (
          <form onSubmit={handleSubmitComment} className="mb-6">
            <div>
              <label htmlFor="comment" className="sr-only">Add a comment</label>
              <textarea
                id="comment"
                name="comment"
                rows={3}
                className="shadow-sm block w-full focus:ring-primary focus:border-primary sm:text-sm border border-gray-300 rounded-md"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                required
              ></textarea>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={isSubmittingComment || !newComment.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                {isSubmittingComment ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <p className="text-gray-700">
              Please <a href="/auth/login" className="text-primary font-medium">sign in</a> to leave a comment.
            </p>
          </div>
        )}
        
        {idea.comments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {idea.comments.map((comment) => (
              <div key={comment.id} className="bg-white shadow overflow-hidden sm:rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="font-medium text-gray-900">{comment.userName}</div>
                  <div className="text-sm text-gray-500">{formatDate(comment.createdAt)}</div>
                </div>
                <div className="mt-2 text-gray-700">
                  {comment.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 