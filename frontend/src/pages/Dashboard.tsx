import React, { useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Shield,
  Activity,
  Lock,
  Eye,
  EyeOff,
  BarChart3,
  PieChart,
  LineChart,
  Filter,
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

// Mock data for charts
const mockLineChartData = [
  { month: 'Jan', value: 420 },
  { month: 'Feb', value: 380 },
  { month: 'Mar', value: 450 },
  { month: 'Apr', value: 520 },
  { month: 'May', value: 580 },
  { month: 'Jun', value: 620 },
  { month: 'Jul', value: 710 },
];

const mockPieChartData = [
  { name: 'Encrypted', value: 65, color: '#3b82f6' },
  { name: 'Anonymized', value: 25, color: '#8b5cf6' },
  { name: 'Raw', value: 10, color: '#ec4899' },
];

const mockBarChartData = [
  { day: 'Mon', queries: 120 },
  { day: 'Tue', queries: 180 },
  { day: 'Wed', queries: 240 },
  { day: 'Thu', queries: 190 },
  { day: 'Fri', queries: 220 },
  { day: 'Sat', queries: 90 },
  { day: 'Sun', queries: 70 },
];

// Simple chart components
const SimpleLineChart: React.FC<{ data: any[] }> = ({ data }) => {
  const max = Math.max(...data.map(d => d.value));
  const min = Math.min(...data.map(d => d.value));
  const normalize = (val: number) => 100 - ((val - min) / (max - min)) * 80;

  const points = data
    .map((d, i) => [(i / (data.length - 1)) * 100, normalize(d.value)])
    .map(([x, y]) => `${x},${y}`)
    .join(' ');

  return (
    <div className="w-full h-36 mt-4">
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

const SimpleBarChart: React.FC<{ data: any[] }> = ({ data }) => {
  const max = Math.max(...data.map(d => d.queries));

  return (
    <div className="w-full h-36 mt-4 flex items-end justify-between gap-1">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center">
          <div
            className="w-8 bg-gradient rounded-t-md"
            style={{ height: `${(d.queries / max) * 100}%` }}
          ></div>
          <span className="text-xs mt-1 text-muted-foreground">{d.day}</span>
        </div>
      ))}
    </div>
  );
};

const SimplePieChart: React.FC<{ data: any[] }> = ({ data }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let currentAngle = 0;

  return (
    <div className="w-full h-36 mt-4 flex justify-center">
      <svg width="100" height="100" viewBox="0 0 100 100">
        {data.map((d, i) => {
          const startAngle = currentAngle;
          const angle = (d.value / total) * 360;
          currentAngle += angle;
          const endAngle = currentAngle;

          const startRad = ((startAngle - 90) * Math.PI) / 180;
          const endRad = ((endAngle - 90) * Math.PI) / 180;

          const x1 = 50 + 40 * Math.cos(startRad);
          const y1 = 50 + 40 * Math.sin(startRad);
          const x2 = 50 + 40 * Math.cos(endRad);
          const y2 = 50 + 40 * Math.sin(endRad);

          const largeArc = angle > 180 ? 1 : 0;

          const pathData = [
            `M 50 50`,
            `L ${x1} ${y1}`,
            `A 40 40 0 ${largeArc} 1 ${x2} ${y2}`,
            `Z`,
          ].join(' ');

          return <path key={i} d={pathData} fill={d.color} />;
        })}
      </svg>
      <div className="ml-4 flex flex-col justify-center">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
            <span>
              {d.name}: {d.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Stat card component
interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  variant?: 'default' | 'glass' | 'gradient';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, variant = 'default' }) => {
  const isPositive = change >= 0;

  return (
    <Card variant={variant} hover>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center mt-1">
          <span
            className={cn(
              'text-xs font-medium flex items-center',
              isPositive ? 'text-green-500' : 'text-red-500'
            )}
          >
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(change)}%
          </span>
          <span className="text-xs text-muted-foreground ml-1">from last month</span>
        </div>
      </CardContent>
    </Card>
  );
};

const Dashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Your privacy-preserving analytics overview</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => setShowSensitiveData(!showSensitiveData)}
          >
            {showSensitiveData ? <EyeOff size={16} /> : <Eye size={16} />}
            {showSensitiveData ? 'Hide Sensitive Data' : 'Show Sensitive Data'}
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Filter size={16} />
            Filter
          </Button>
          <Button variant="gradient" size="sm">
            Generate Report
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={showSensitiveData ? '12,543' : '••,•••'}
          change={12.5}
          icon={<Users size={18} />}
        />
        <StatCard
          title="Privacy Score"
          value="94%"
          change={3.2}
          icon={<Shield size={18} />}
          variant="gradient"
        />
        <StatCard
          title="Active Queries"
          value={showSensitiveData ? '1,432' : '•,•••'}
          change={-5.1}
          icon={<Activity size={18} />}
        />
        <StatCard title="Data Protected" value="98.2%" change={1.8} icon={<Lock size={18} />} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card hover>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>User Growth</span>
              <LineChart size={18} className="text-muted-foreground" />
            </CardTitle>
            <CardDescription>Monthly active users</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleLineChart data={mockLineChartData} />
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground">
            <div className="w-full flex justify-between">
              <span>Jan</span>
              <span>Jul</span>
            </div>
          </CardFooter>
        </Card>

        <Card hover>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Data Classification</span>
              <PieChart size={18} className="text-muted-foreground" />
            </CardTitle>
            <CardDescription>By privacy level</CardDescription>
          </CardHeader>
          <CardContent>
            <SimplePieChart data={mockPieChartData} />
          </CardContent>
        </Card>

        <Card hover>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Query Volume</span>
              <BarChart3 size={18} className="text-muted-foreground" />
            </CardTitle>
            <CardDescription>Daily analytics queries</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={mockBarChartData} />
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest privacy-preserving analytics events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div
                key={i}
                className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {i % 2 === 0 ? <Shield size={18} /> : <Activity size={18} />}
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    {i % 2 === 0 ? 'Privacy policy updated' : 'Batch analytics processed'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {i % 2 === 0
                      ? 'New anonymization rules applied to user data'
                      : `${showSensitiveData ? '1,240' : '•,•••'} records processed with differential privacy`}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {i === 1 ? 'Just now' : `${i * 2}h ago`}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            View All Activity
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Dashboard;
