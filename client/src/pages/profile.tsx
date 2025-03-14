import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWeb3 } from '@/contexts/Web3Context';
import { Edit, Save, X, Copy, ExternalLink } from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  bio: string;
  avatarUrl: string;
  walletAddress: string;
  joinedDate: string;
  ideasSubmitted: number;
  ideasApproved: number;
}

export default function ProfilePage() {
  const { user, updateUserProfile, logout } = useAuth();
  const { connectWallet, walletAddress, disconnectWallet } = useWeb3();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // This would be an API call in production
        // const response = await fetch(`/api/users/${user.id}/profile`);
        // const data = await response.json();
        
        // Mock data for demonstration
        const mockProfile: UserProfile = {
          name: user.name || 'Anonymous User',
          email: user.email || 'user@example.com',
          bio: 'Blockchain enthusiast and developer with a passion for decentralized applications.',
          avatarUrl: user.avatarUrl || 'https://via.placeholder.com/150',
          walletAddress: walletAddress || '',
          joinedDate: new Date(user.createdAt || Date.now()).toISOString(),
          ideasSubmitted: 5,
          ideasApproved: 2
        };
        
        setProfile(mockProfile);
        setFormData({
          name: mockProfile.name,
          bio: mockProfile.bio
        });
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, walletAddress]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !profile) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      // This would be an API call in production
      // await updateUserProfile({
      //   name: formData.name,
      //   bio: formData.bio
      // });
      
      // Update local state
      setProfile({
        ...profile,
        name: formData.name,
        bio: formData.bio
      });
      
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyWalletAddress = () => {
    if (profile?.walletAddress) {
      navigator.clipboard.writeText(profile.walletAddress);
      // Show toast notification
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading profile...</div>;
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Available</h1>
          <p className="text-gray-600 mb-6">Please sign in to view your profile.</p>
          <a 
            href="/auth/login"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your personal information and wallet connection
            </p>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </button>
          ) : (
            <button
              onClick={() => {
                setIsEditing(false);
                if (profile) {
                  setFormData({
                    name: profile.name,
                    bio: profile.bio
                  });
                }
              }}
              className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
          )}
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-6 my-4">
            <div className="flex">
              <div>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="border-t border-gray-200">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="px-4 py-5 sm:px-6 space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  Bio
                </label>
                <div className="mt-1">
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    value={formData.bio}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Brief description for your profile.
                </p>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : profile ? (
            <div className="px-4 py-5 sm:px-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Full name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{profile.name}</dd>
                </div>
                
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Email address</dt>
                  <dd className="mt-1 text-sm text-gray-900">{profile.email}</dd>
                </div>
                
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Member since</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(profile.joinedDate)}</dd>
                </div>
                
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Ideas</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {profile.ideasSubmitted} submitted, {profile.ideasApproved} approved
                  </dd>
                </div>
                
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Bio</dt>
                  <dd className="mt-1 text-sm text-gray-900">{profile.bio}</dd>
                </div>
                
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Wallet</dt>
                  <dd className="mt-1 text-sm">
                    {profile.walletAddress ? (
                      <div className="flex items-center">
                        <span className="text-gray-900 mr-2">{truncateAddress(profile.walletAddress)}</span>
                        <button 
                          onClick={handleCopyWalletAddress}
                          className="text-gray-400 hover:text-gray-500"
                          title="Copy address"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <a 
                          href={`https://etherscan.io/address/${profile.walletAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-gray-400 hover:text-gray-500"
                          title="View on Etherscan"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <button
                          onClick={disconnectWallet}
                          className="ml-4 text-sm text-red-600 hover:text-red-500"
                        >
                          Disconnect
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={connectWallet}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      >
                        Connect Wallet
                      </button>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          ) : null}
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <button
            onClick={logout}
            className="text-sm font-medium text-red-600 hover:text-red-500"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
} 