import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';

interface IdeaFormData {
  title: string;
  description: string;
  category: string;
}

export default function NewIdeaPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState<IdeaFormData>({
    title: '',
    description: '',
    category: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to submit an idea');
      return;
    }
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }
    
    if (!formData.category.trim()) {
      setError('Category is required');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // This would be an API call in production
      // const response = await fetch('/api/ideas', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     ...formData,
      //     userId: user.id
      //   })
      // });
      
      // if (!response.ok) {
      //   throw new Error('Failed to submit idea');
      // }
      
      // const data = await response.json();
      
      // Simulate successful submission
      setTimeout(() => {
        // Redirect to the ideas list page
        setLocation('/ideas');
      }, 1000);
    } catch (err) {
      console.error('Failed to submit idea:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit idea');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { value: '', label: 'Select a category' },
    { value: 'defi', label: 'DeFi (Decentralized Finance)' },
    { value: 'nft', label: 'NFTs & Digital Assets' },
    { value: 'dao', label: 'DAOs & Governance' },
    { value: 'identity', label: 'Identity & Authentication' },
    { value: 'infrastructure', label: 'Blockchain Infrastructure' },
    { value: 'gaming', label: 'Gaming & Metaverse' },
    { value: 'social', label: 'Social & Community' },
    { value: 'environment', label: 'Environment & Sustainability' },
    { value: 'other', label: 'Other' }
  ];

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
          <h1 className="text-2xl font-bold text-gray-900">Submit a New Idea</h1>
          <p className="mt-1 text-sm text-gray-500">
            Share your blockchain innovation with the community
          </p>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          {!user ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div>
                  <p className="text-sm text-yellow-700">
                    You need to <a href="/auth/login" className="font-medium text-yellow-700 underline">sign in</a> to submit an idea.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                  <div className="flex">
                    <div>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="title"
                    id="title"
                    required
                    className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="A concise title for your idea"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category *
                </label>
                <div className="mt-1">
                  <select
                    id="category"
                    name="category"
                    required
                    className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description *
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={8}
                    required
                    className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Describe your idea in detail. What problem does it solve? How does it work? What makes it innovative?"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  You can use line breaks to format your description. Be as detailed as possible.
                </p>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setLocation('/ideas')}
                  className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Idea'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 