import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  LineChart,
  PieChart,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  ChevronDown,
  Layers,
  Sliders,
  Share2,
  Eye,
  EyeOff,
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
const mockTimeSeriesData = [
  { date: '2023-01-01', users: 1200, queries: 5400, privacyScore: 92 },
  { date: '2023-02-01', users: 1350, queries: 6100, privacyScore: 91 },
  { date: '2023-03-01', users: 1500, queries: 6800, privacyScore: 93 },
  { date: '2023-04-01', users: 1620, queries: 7200, privacyScore: 94 },
  { date: '2023-05-01', users: 1750, queries: 7900, privacyScore: 92 },
  { date: '2023-06-01', users: 1830, queries: 8300, privacyScore: 95 },
  { date: '2023-07-01', users: 2100, queries: 9200, privacyScore: 96 },
  { date: '2023-08-01', users: 2350, queries: 10100, privacyScore: 94 },
  { date: '2023-09-01', users: 2600, queries: 11300, privacyScore: 93 },
  { date: '2023-10-01', users: 2850, queries: 12500, privacyScore: 95 },
  { date: '2023-11-01', users: 3100, queries: 13800, privacyScore: 97 },
  { date: '2023-12-01', users: 3400, queries: 15200, privacyScore: 96 },
];

const mockDataBreakdown = [
  { category: 'Anonymized', value: 68, color: '#3b82f6' },
  { category: 'Encrypted', value: 22, color: '#8b5cf6' },
  { category: 'Differential Privacy', value: 8, color: '#ec4899' },
  { category: 'Raw', value: 2, color: '#f97316' },
];

const mockGeographicData = [
  { region: 'North America', users: 42, color: '#3b82f6' },
  { region: 'Europe', users: 31, color: '#8b5cf6' },
  { region: 'Asia', users: 18, color: '#ec4899' },
  { region: 'South America', users: 5, color: '#f97316' },
  { region: 'Africa', users: 3, color: '#10b981' },
  { region: 'Oceania', users: 1, color: '#6366f1' },
];

const mockQueryTypes = [
  { type: 'User Behavior', count: 42, growth: 12 },
  { type: 'Conversion', count: 28, growth: 8 },
  { type: 'Performance', count: 16, growth: -3 },
  { type: 'Error Tracking', count: 9, growth: 15 },
  { type: 'Feature Usage', count: 5, growth: 22 },
];

// Advanced chart components
const AdvancedLineChart: React.FC<{ data: any[]; metrics: string[]; showPrivacy?: boolean }> = ({
  data,
  metrics,
  showPrivacy = true,
}) => {
  // Calculate max values for scaling
  const maxValues: Record<string, number> = {};
  metrics.forEach(metric => {
    maxValues[metric] = Math.max(...data.map(d => d[metric]));
  });

  // Generate points for each metric
  const generatePoints = (metric: string) => {
    return data
      .map((d, i) => [(i / (data.length - 1)) * 100, 100 - (d[metric] / maxValues[metric]) * 80])
      .map(([x, y]) => `${x},${y}`)
      .join(' ');
  };

  // Generate colors for each metric
  const colors: Record<string, string> = {
    users: '#3b82f6',
    queries: '#8b5cf6',
    privacyScore: '#10b981',
  };

  return (
    <div className="w-full h-64 mt-4">
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Grid lines */}
        <g className="grid-lines">
          {[20, 40, 60, 80].map(y => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="0.5"
              strokeDasharray="1,1"
            />
          ))}
        </g>

        {/* Data lines */}
        {metrics.map(metric => {
          if (metric === 'privacyScore' && !showPrivacy) {
            return null;
          }
          return (
            <polyline
              key={metric}
              points={generatePoints(metric)}
              fill="none"
              stroke={colors[metric]}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}

        {/* Data points */}
        {metrics.map(metric => {
          if (metric === 'privacyScore' && !showPrivacy) {
            return null;
          }
          return data.map((d, i) => (
            <circle
              key={`${metric}-${i}`}
              cx={`${(i / (data.length - 1)) * 100}`}
              cy={`${100 - (d[metric] / maxValues[metric]) * 80}`}
              r="1.5"
              fill={colors[metric]}
            />
          ));
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        {metrics.map(metric => {
          if (metric === 'privacyScore' && !showPrivacy) {
            return null;
          }
          return (
            <div key={metric} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[metric] }}
              ></div>
              <span className="text-sm text-muted-foreground capitalize">
                {metric === 'privacyScore' ? 'Privacy Score' : metric}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AdvancedBarChart: React.FC<{ data: any[]; category: string; value: string }> = ({
  data,
  category,
  value,
}) => {
  const max = Math.max(...data.map(d => d[value]));

  return (
    <div className="w-full h-64 mt-4">
      <div className="flex h-[90%] items-end justify-between gap-2">
        {data.map((d, i) => (
          <div key={i} className="flex flex-col items-center group">
            <div className="relative">
              <div
                className="w-12 rounded-t-md transition-all duration-300 group-hover:opacity-80"
                style={{
                  height: `${(d[value] / max) * 100}%`,
                  backgroundColor: d.color || '#3b82f6',
                }}
              ></div>

              {/* Tooltip */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm border rounded-md px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                {d[category]}: {d[value].toLocaleString()}
              </div>
            </div>
            <span className="text-xs mt-2 text-muted-foreground truncate max-w-[80px]">
              {d[category]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdvancedPieChart: React.FC<{ data: any[]; category: string; value: string }> = ({
  data,
  category,
  value,
}) => {
  const total = data.reduce((sum, d) => sum + d[value], 0);
  let currentAngle = 0;

  return (
    <div className="w-full h-64 mt-4 flex justify-center items-center">
      <div className="relative w-48 h-48">
        <svg width="100%" height="100%" viewBox="0 0 100 100">
          {data.map((d, i) => {
            const startAngle = currentAngle;
            const angle = (d[value] / total) * 360;
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

            return (
              <path
                key={i}
                d={pathData}
                fill={d.color}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            );
          })}

          {/* Center circle for donut effect */}
          <circle cx="50" cy="50" r="25" fill="var(--card)" />

          {/* Center text */}
          <text
            x="50"
            y="50"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-xl font-bold fill-current"
          >
            {total}
          </text>
        </svg>

        {/* Hover indicators */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center">
            <span className="text-sm font-medium">Total</span>
          </div>
        </div>
      </div>

      <div className="ml-8">
        <h4 className="text-sm font-medium mb-2">Legend</h4>
        <div className="space-y-2">
          {data.map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
              <span className="text-sm">{d[category]}</span>
              <span className="text-sm text-muted-foreground ml-auto">{d[value]}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Table component for query types
const QueryTypesTable: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <div className="w-full mt-4 overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="py-2 px-4 text-left font-medium text-muted-foreground">Query Type</th>
            <th className="py-2 px-4 text-right font-medium text-muted-foreground">Count</th>
            <th className="py-2 px-4 text-right font-medium text-muted-foreground">Growth</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b hover:bg-muted/50 transition-colors">
              <td className="py-3 px-4">{row.type}</td>
              <td className="py-3 px-4 text-right">{row.count.toLocaleString()}</td>
              <td className="py-3 px-4 text-right">
                <span
                  className={cn(
                    'inline-flex items-center',
                    row.growth >= 0 ? 'text-green-500' : 'text-red-500'
                  )}
                >
                  {row.growth >= 0 ? '+' : ''}
                  {row.growth}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Filter dropdown component
interface FilterDropdownProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ label, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        className="flex items-center gap-2 px-3 py-1.5 rounded-md border bg-card hover:bg-muted/50 transition-colors text-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{label}:</span>
        <span className="font-medium">{value}</span>
        <ChevronDown
          size={14}
          className={cn('transition-transform', isOpen && 'transform rotate-180')}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-card border rounded-md shadow-lg z-10">
          <div className="py-1">
            {options.map(option => (
              <button
                key={option}
                className={cn(
                  'w-full text-left px-4 py-2 text-sm hover:bg-muted/50 transition-colors',
                  option === value && 'bg-primary/10 text-primary'
                )}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const AdvancedAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('Last 12 months');
  const [dataType, setDataType] = useState('All Data');
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate data loading
  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advanced Analytics</h1>
          <p className="text-muted-foreground">
            Detailed insights with privacy-preserving techniques
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterDropdown
            label="Time Range"
            options={['Last 7 days', 'Last 30 days', 'Last 12 months', 'All time']}
            value={timeRange}
            onChange={setTimeRange}
          />

          <FilterDropdown
            label="Data Type"
            options={['All Data', 'User Data', 'Query Data', 'Privacy Metrics']}
            value={dataType}
            onChange={setDataType}
          />

          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => setShowSensitiveData(!showSensitiveData)}
          >
            {showSensitiveData ? <EyeOff size={16} /> : <Eye size={16} />}
            {showSensitiveData ? 'Hide Sensitive' : 'Show Sensitive'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={refreshData}
            disabled={isLoading}
          >
            <RefreshCw size={16} className={cn(isLoading && 'animate-spin')} />
            Refresh
          </Button>

          <Button variant="gradient" size="sm" className="gap-1">
            <Download size={16} />
            Export
          </Button>
        </div>
      </div>

      {/* Main analytics grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Time series chart */}
        <Card className="lg:col-span-2" hover>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Analytics Over Time</span>
              <LineChart size={18} className="text-muted-foreground" />
            </CardTitle>
            <CardDescription>User growth, query volume, and privacy score trends</CardDescription>
          </CardHeader>
          <CardContent>
            <AdvancedLineChart
              data={mockTimeSeriesData}
              metrics={['users', 'queries', 'privacyScore']}
              showPrivacy={showSensitiveData}
            />
          </CardContent>
          <CardFooter className="flex justify-between text-sm text-muted-foreground">
            <span>Jan 2023</span>
            <span>Dec 2023</span>
          </CardFooter>
        </Card>

        {/* Data breakdown */}
        <Card hover>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Data Protection Breakdown</span>
              <PieChart size={18} className="text-muted-foreground" />
            </CardTitle>
            <CardDescription>How your data is protected by privacy techniques</CardDescription>
          </CardHeader>
          <CardContent>
            <AdvancedPieChart data={mockDataBreakdown} category="category" value="value" />
          </CardContent>
        </Card>

        {/* Geographic distribution */}
        <Card hover>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Geographic Distribution</span>
              <Layers size={18} className="text-muted-foreground" />
            </CardTitle>
            <CardDescription>User distribution by region</CardDescription>
          </CardHeader>
          <CardContent>
            <AdvancedBarChart data={mockGeographicData} category="region" value="users" />
          </CardContent>
        </Card>

        {/* Query types */}
        <Card className="lg:col-span-2" hover>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Query Types Analysis</span>
              <Sliders size={18} className="text-muted-foreground" />
            </CardTitle>
            <CardDescription>Breakdown of analytics queries by type and growth</CardDescription>
          </CardHeader>
          <CardContent>
            <QueryTypesTable data={mockQueryTypes} />
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="gap-1">
              <Share2 size={16} />
              Share Report
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Advanced metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Privacy Metrics</CardTitle>
          <CardDescription>
            Detailed metrics about your privacy-preserving analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Differential Privacy ε',
                value: '2.1',
                description: 'Lower is better. Measures the privacy guarantee strength.',
              },
              {
                title: 'k-Anonymity Factor',
                value: '12',
                description: 'Higher is better. Minimum group size for anonymized data.',
              },
              {
                title: 'Data Minimization Score',
                value: '94%',
                description: 'Higher is better. Measures how well unnecessary data is avoided.',
              },
              {
                title: 'Re-identification Risk',
                value: '0.02%',
                description: 'Lower is better. Probability of re-identifying individuals.',
              },
            ].map((metric, i) => (
              <div key={i} className="p-4 rounded-lg border bg-card/50">
                <h3 className="text-sm font-medium text-muted-foreground">{metric.title}</h3>
                <div className="text-3xl font-bold my-2">{metric.value}</div>
                <p className="text-xs text-muted-foreground">{metric.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedAnalytics;
