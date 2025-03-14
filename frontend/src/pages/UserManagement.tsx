import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Shield,
  UserPlus,
  UserMinus,
  UserCheck,
  Clock,
  Lock,
  Unlock,
  ChevronDown,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';

// Mock user data
const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Administrator',
    status: 'Active',
    lastActive: '2023-12-01T14:32:21',
    dataAccess: 'Full',
    twoFactorEnabled: true,
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'Analyst',
    status: 'Active',
    lastActive: '2023-12-02T09:15:43',
    dataAccess: 'Anonymized',
    twoFactorEnabled: true,
  },
  {
    id: 3,
    name: 'Robert Johnson',
    email: 'robert.johnson@example.com',
    role: 'Viewer',
    status: 'Active',
    lastActive: '2023-11-28T16:45:12',
    dataAccess: 'Limited',
    twoFactorEnabled: false,
  },
  {
    id: 4,
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    role: 'Analyst',
    status: 'Inactive',
    lastActive: '2023-10-15T11:22:09',
    dataAccess: 'Anonymized',
    twoFactorEnabled: true,
  },
  {
    id: 5,
    name: 'Michael Wilson',
    email: 'michael.wilson@example.com',
    role: 'Administrator',
    status: 'Active',
    lastActive: '2023-12-01T17:05:33',
    dataAccess: 'Full',
    twoFactorEnabled: true,
  },
  {
    id: 6,
    name: 'Sarah Brown',
    email: 'sarah.brown@example.com',
    role: 'Viewer',
    status: 'Pending',
    lastActive: 'Never',
    dataAccess: 'None',
    twoFactorEnabled: false,
  },
  {
    id: 7,
    name: 'David Miller',
    email: 'david.miller@example.com',
    role: 'Analyst',
    status: 'Active',
    lastActive: '2023-11-30T13:12:45',
    dataAccess: 'Anonymized',
    twoFactorEnabled: false,
  },
];

// Mock role data
const mockRoles = [
  {
    id: 1,
    name: 'Administrator',
    description: 'Full access to all features and data',
    userCount: 2,
    permissions: [
      { name: 'View Analytics', granted: true },
      { name: 'Manage Users', granted: true },
      { name: 'Configure Privacy', granted: true },
      { name: 'Export Data', granted: true },
      { name: 'System Settings', granted: true },
    ],
  },
  {
    id: 2,
    name: 'Analyst',
    description: 'Can view and analyze anonymized data',
    userCount: 3,
    permissions: [
      { name: 'View Analytics', granted: true },
      { name: 'Manage Users', granted: false },
      { name: 'Configure Privacy', granted: false },
      { name: 'Export Data', granted: true },
      { name: 'System Settings', granted: false },
    ],
  },
  {
    id: 3,
    name: 'Viewer',
    description: 'Limited read-only access to dashboards',
    userCount: 2,
    permissions: [
      { name: 'View Analytics', granted: true },
      { name: 'Manage Users', granted: false },
      { name: 'Configure Privacy', granted: false },
      { name: 'Export Data', granted: false },
      { name: 'System Settings', granted: false },
    ],
  },
];

// User status badge component
interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let color = '';
  let icon = null;

  switch (status) {
    case 'Active':
      color = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      icon = <CheckCircle2 size={14} className="mr-1" />;
      break;
    case 'Inactive':
      color = 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400';
      icon = <XCircle size={14} className="mr-1" />;
      break;
    case 'Pending':
      color = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      icon = <AlertCircle size={14} className="mr-1" />;
      break;
    default:
      color = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        color
      )}
    >
      {icon}
      {status}
    </span>
  );
};

// User table component
interface UserTableProps {
  users: any[];
  onEditUser: (user: any) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, onEditUser }) => {
  return (
    <div className="w-full overflow-hidden rounded-lg border">
      <table className="w-full">
        <thead>
          <tr className="bg-muted/50">
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Name</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Email</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Role</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Status
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Data Access
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Last Active
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {users.map(user => (
            <tr key={user.id} className="hover:bg-muted/50 transition-colors">
              <td className="px-4 py-3 text-sm">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/60 to-primary flex items-center justify-center text-white font-medium">
                    {user.name
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">{user.name}</p>
                    {user.twoFactorEnabled && (
                      <span className="text-xs text-muted-foreground flex items-center mt-0.5">
                        <Shield size={10} className="mr-1" /> 2FA Enabled
                      </span>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-sm">{user.email}</td>
              <td className="px-4 py-3 text-sm">
                <span
                  className={cn(
                    'px-2 py-1 rounded-md text-xs font-medium',
                    user.role === 'Administrator'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                      : user.role === 'Analyst'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400'
                  )}
                >
                  {user.role}
                </span>
              </td>
              <td className="px-4 py-3 text-sm">
                <StatusBadge status={user.status} />
              </td>
              <td className="px-4 py-3 text-sm">
                <span
                  className={cn(
                    'px-2 py-1 rounded-md text-xs font-medium',
                    user.dataAccess === 'Full'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      : user.dataAccess === 'Anonymized'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : user.dataAccess === 'Limited'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400'
                  )}
                >
                  {user.dataAccess}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {user.lastActive === 'Never' ? (
                  'Never'
                ) : (
                  <span className="flex items-center">
                    <Clock size={14} className="mr-1" />
                    {new Date(user.lastActive).toLocaleDateString()}
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-sm">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditUser(user)}
                    title="Edit User"
                  >
                    <Eye size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" title="More Options">
                    <MoreHorizontal size={16} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Role card component
interface RoleCardProps {
  role: any;
  onEditRole: (role: any) => void;
}

const RoleCard: React.FC<RoleCardProps> = ({ role, onEditRole }) => {
  return (
    <Card hover>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{role.name}</span>
          <span className="text-sm font-normal text-muted-foreground">{role.userCount} users</span>
        </CardTitle>
        <CardDescription>{role.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <h4 className="text-sm font-medium mb-2">Permissions:</h4>
        <ul className="space-y-2">
          {role.permissions.map((permission: any, index: number) => (
            <li key={index} className="flex items-center justify-between text-sm">
              <span>{permission.name}</span>
              {permission.granted ? (
                <CheckCircle2 size={16} className="text-green-500" />
              ) : (
                <XCircle size={16} className="text-muted-foreground" />
              )}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full" onClick={() => onEditRole(role)}>
          Edit Role
        </Button>
      </CardFooter>
    </Card>
  );
};

// User management page component
const UserManagement: React.FC = () => {
  const [users, setUsers] = useState(mockUsers);
  const [roles, setRoles] = useState(mockRoles);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('users');

  // Filter users based on search query and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || user.status === statusFilter;
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  // Handle user edit
  const handleEditUser = (user: any) => {
    setSelectedUser(user);
  };

  // Handle role edit
  const handleEditRole = (role: any) => {
    setSelectedRole(role);
  };

  // Get unique statuses for filter
  const statuses = ['All', ...new Set(users.map(user => user.status))];

  // Get unique roles for filter
  const roleNames = ['All', ...new Set(users.map(user => user.role))];

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage users, roles, and permissions</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <UserPlus size={16} />
            Add User
          </Button>
          <Button variant="gradient" size="sm" className="gap-1">
            <Shield size={16} />
            Manage Roles
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          className={cn(
            'px-4 py-2 font-medium text-sm transition-colors relative',
            activeTab === 'users' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          )}
          onClick={() => setActiveTab('users')}
        >
          <div className="flex items-center gap-2">
            <Users size={16} />
            Users
          </div>
          {activeTab === 'users' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          className={cn(
            'px-4 py-2 font-medium text-sm transition-colors relative',
            activeTab === 'roles' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          )}
          onClick={() => setActiveTab('roles')}
        >
          <div className="flex items-center gap-2">
            <Shield size={16} />
            Roles & Permissions
          </div>
          {activeTab === 'roles' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      {/* Users tab content */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                size={18}
              />
              <input
                type="text"
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <div className="relative">
                <button
                  className="flex items-center gap-2 px-3 py-2 rounded-md border bg-background hover:bg-muted/50 transition-colors"
                  onClick={() => {}}
                >
                  <Filter size={16} />
                  Status: {statusFilter}
                  <ChevronDown size={14} />
                </button>

                {/* Status filter dropdown would go here */}
              </div>

              <div className="relative">
                <button
                  className="flex items-center gap-2 px-3 py-2 rounded-md border bg-background hover:bg-muted/50 transition-colors"
                  onClick={() => {}}
                >
                  <Shield size={16} />
                  Role: {roleFilter}
                  <ChevronDown size={14} />
                </button>

                {/* Role filter dropdown would go here */}
              </div>
            </div>
          </div>

          <Card>
            <CardHeader className="pb-0">
              <CardTitle>User List</CardTitle>
              <CardDescription>Manage user accounts and access levels</CardDescription>
            </CardHeader>
            <CardContent>
              <UserTable users={filteredUsers} onEditUser={handleEditUser} />
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {filteredUsers.length} of {users.length} users
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>

          {/* User activity card */}
          <Card>
            <CardHeader>
              <CardTitle>Recent User Activity</CardTitle>
              <CardDescription>Monitor recent logins and security events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    user: 'John Doe',
                    action: 'Logged in',
                    time: '2 hours ago',
                    details: 'From 192.168.1.1 using Chrome on Windows',
                  },
                  {
                    user: 'Jane Smith',
                    action: 'Changed privacy settings',
                    time: '5 hours ago',
                    details: 'Updated data retention policy',
                  },
                  {
                    user: 'Michael Wilson',
                    action: 'Added new user',
                    time: '1 day ago',
                    details: 'Added Sarah Brown with Viewer role',
                  },
                  {
                    user: 'Robert Johnson',
                    action: 'Exported data',
                    time: '2 days ago',
                    details: 'Downloaded anonymized user analytics',
                  },
                ].map((activity, i) => (
                  <div key={i} className="flex items-start pb-4 border-b last:border-0 last:pb-0">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                      {activity.user
                        .split(' ')
                        .map(n => n[0])
                        .join('')}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium">
                        <span className="font-semibold">{activity.user}</span> {activity.action}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.details}</p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center">
                        <Clock size={12} className="mr-1" />
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Roles tab content */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Role Management</h2>
            <Button size="sm" className="gap-1">
              <Shield size={16} />
              Create New Role
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map(role => (
              <RoleCard key={role.id} role={role} onEditRole={handleEditRole} />
            ))}
          </div>

          {/* Permission matrix */}
          <Card>
            <CardHeader>
              <CardTitle>Permission Matrix</CardTitle>
              <CardDescription>Overview of permissions across different roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-4 text-left font-medium text-muted-foreground">
                        Permission
                      </th>
                      {roles.map(role => (
                        <th
                          key={role.id}
                          className="py-3 px-4 text-center font-medium text-muted-foreground"
                        >
                          {role.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      'View Analytics',
                      'Manage Users',
                      'Configure Privacy',
                      'Export Data',
                      'System Settings',
                    ].map((permission, i) => (
                      <tr key={i} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">{permission}</td>
                        {roles.map(role => {
                          const hasPermission = role.permissions.find(
                            (p: any) => p.name === permission
                          )?.granted;
                          return (
                            <td key={role.id} className="py-3 px-4 text-center">
                              {hasPermission ? (
                                <CheckCircle2 size={18} className="text-green-500 mx-auto" />
                              ) : (
                                <XCircle size={18} className="text-muted-foreground mx-auto" />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Privacy levels */}
          <Card>
            <CardHeader>
              <CardTitle>Data Access Levels</CardTitle>
              <CardDescription>Configure what data each role can access</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  {
                    level: 'Full Access',
                    description:
                      'Complete access to all data, including personally identifiable information',
                    icon: <Unlock size={20} className="text-red-500" />,
                    roles: ['Administrator'],
                    warning: 'High privacy risk - restrict to essential personnel only',
                  },
                  {
                    level: 'Anonymized Access',
                    description: 'Access to data with personal identifiers removed or obscured',
                    icon: <Shield size={20} className="text-green-500" />,
                    roles: ['Analyst'],
                    warning: null,
                  },
                  {
                    level: 'Limited Access',
                    description: 'Access to aggregated data and summary statistics only',
                    icon: <Lock size={20} className="text-blue-500" />,
                    roles: ['Viewer'],
                    warning: null,
                  },
                ].map((level, i) => (
                  <div key={i} className="flex items-start border-b last:border-0 pb-6 last:pb-0">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      {level.icon}
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="font-medium">{level.level}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{level.description}</p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {level.roles.map((role, j) => (
                          <span
                            key={j}
                            className="px-2 py-1 bg-muted rounded-md text-xs font-medium"
                          >
                            {role}
                          </span>
                        ))}
                      </div>

                      {level.warning && (
                        <div className="mt-3 text-xs text-amber-600 dark:text-amber-400 flex items-center">
                          <AlertCircle size={12} className="mr-1" />
                          {level.warning}
                        </div>
                      )}
                    </div>
                    <div>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
