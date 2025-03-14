import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  Key,
  RefreshCw,
  AlertTriangle,
  Check,
  Info,
  ChevronRight,
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

// Toggle switch component
interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  label: string;
  description?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, label, description }) => {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <h4 className="text-sm font-medium">{label}</h4>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background',
          checked ? 'bg-gradient' : 'bg-muted'
        )}
      >
        <span
          className={cn(
            'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform',
            checked ? 'translate-x-5' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  );
};

// Slider component
interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  label: string;
  description?: string;
}

const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  description,
}) => {
  return (
    <div className="py-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h4 className="text-sm font-medium">{label}</h4>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        <span className="text-sm font-medium">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
      />
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  );
};

// Privacy level indicator
interface PrivacyLevelProps {
  level: number; // 0-100
}

const PrivacyLevel: React.FC<PrivacyLevelProps> = ({ level }) => {
  let color = 'bg-red-500';
  let label = 'Weak';
  let icon = <AlertTriangle className="w-4 h-4" />;

  if (level >= 80) {
    color = 'bg-green-500';
    label = 'Strong';
    icon = <Check className="w-4 h-4" />;
  } else if (level >= 50) {
    color = 'bg-yellow-500';
    label = 'Moderate';
    icon = <Info className="w-4 h-4" />;
  }

  return (
    <div className="flex flex-col items-center">
      <div className="w-full h-3 bg-muted rounded-full overflow-hidden mb-2">
        <div
          className={`h-full ${color} transition-all duration-500 ease-out`}
          style={{ width: `${level}%` }}
        />
      </div>
      <div className="flex items-center gap-1 text-sm">
        <span
          className={cn(
            'flex items-center gap-1',
            level >= 80 ? 'text-green-500' : level >= 50 ? 'text-yellow-500' : 'text-red-500'
          )}
        >
          {icon}
          {label}
        </span>
        <span className="text-muted-foreground">Privacy Protection</span>
      </div>
    </div>
  );
};

const Privacy: React.FC = () => {
  // Privacy settings state
  const [settings, setSettings] = useState({
    anonymizeData: true,
    encryptStorage: true,
    limitDataRetention: true,
    blockThirdPartyTracking: true,
    minimizeDataCollection: false,
    privacyLevel: 75,
    noiseLevel: 30,
    kAnonymity: 5,
  });

  // Update a single setting
  const updateSetting = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // Calculate overall privacy score based on settings
  const calculatePrivacyScore = () => {
    let score = 0;

    if (settings.anonymizeData) {
      score += 20;
    }
    if (settings.encryptStorage) {
      score += 20;
    }
    if (settings.limitDataRetention) {
      score += 15;
    }
    if (settings.blockThirdPartyTracking) {
      score += 15;
    }
    if (settings.minimizeDataCollection) {
      score += 10;
    }

    score += (settings.noiseLevel / 100) * 10;
    score += (settings.kAnonymity / 10) * 10;

    return Math.min(100, score);
  };

  const privacyScore = calculatePrivacyScore();

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Privacy Settings</h1>
        <p className="text-muted-foreground">
          Configure your privacy-preserving analytics preferences
        </p>
      </div>

      {/* Privacy Score Card */}
      <Card variant="glass" className="bg-gradient">
        <CardHeader>
          <CardTitle className="text-white">Privacy Protection Score</CardTitle>
          <CardDescription className="text-white/80">
            Your current privacy protection level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="10"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="white"
                  strokeWidth="10"
                  strokeDasharray={`${(2 * Math.PI * 45 * privacyScore) / 100} ${2 * Math.PI * 45 * (1 - privacyScore / 100)}`}
                  strokeDashoffset={2 * Math.PI * 45 * 0.25}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-white">{privacyScore}</span>
                <span className="text-white/80 text-sm">out of 100</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t border-white/10 flex justify-between">
          <Button variant="glass" className="gap-1">
            <RefreshCw size={16} />
            Recalculate
          </Button>
          <Button variant="glass" className="gap-1">
            <Shield size={16} />
            Optimize
          </Button>
        </CardFooter>
      </Card>

      {/* Privacy Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card hover>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Basic Privacy Settings
            </CardTitle>
            <CardDescription>Configure fundamental privacy protections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 border-t pt-4">
            <ToggleSwitch
              checked={settings.anonymizeData}
              onChange={() => updateSetting('anonymizeData', !settings.anonymizeData)}
              label="Anonymize Data"
              description="Remove personally identifiable information from analytics"
            />
            <ToggleSwitch
              checked={settings.encryptStorage}
              onChange={() => updateSetting('encryptStorage', !settings.encryptStorage)}
              label="Encrypt Storage"
              description="Encrypt all stored analytics data"
            />
            <ToggleSwitch
              checked={settings.limitDataRetention}
              onChange={() => updateSetting('limitDataRetention', !settings.limitDataRetention)}
              label="Limit Data Retention"
              description="Automatically delete data after 30 days"
            />
            <ToggleSwitch
              checked={settings.blockThirdPartyTracking}
              onChange={() =>
                updateSetting('blockThirdPartyTracking', !settings.blockThirdPartyTracking)
              }
              label="Block Third-Party Tracking"
              description="Prevent external services from accessing analytics"
            />
            <ToggleSwitch
              checked={settings.minimizeDataCollection}
              onChange={() =>
                updateSetting('minimizeDataCollection', !settings.minimizeDataCollection)
              }
              label="Minimize Data Collection"
              description="Collect only essential analytics data"
            />
          </CardContent>
        </Card>

        <Card hover>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Advanced Privacy Controls
            </CardTitle>
            <CardDescription>Fine-tune your privacy protection mechanisms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 border-t pt-4">
            <Slider
              value={settings.privacyLevel}
              onChange={value => updateSetting('privacyLevel', value)}
              min={0}
              max={100}
              label="Privacy Protection Level"
              description="Overall privacy protection strength"
            />
            <PrivacyLevel level={settings.privacyLevel} />

            <Slider
              value={settings.noiseLevel}
              onChange={value => updateSetting('noiseLevel', value)}
              min={0}
              max={100}
              label="Differential Privacy Noise"
              description="Amount of noise added to protect individual data points"
            />

            <Slider
              value={settings.kAnonymity}
              onChange={value => updateSetting('kAnonymity', value)}
              min={1}
              max={10}
              label="k-Anonymity Factor"
              description="Minimum group size for anonymized data"
            />
          </CardContent>
        </Card>
      </div>

      {/* Privacy Presets */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy Presets</CardTitle>
          <CardDescription>Quick configurations for different privacy needs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            {
              name: 'Maximum Privacy',
              description: 'Strongest privacy protections with some functionality limitations',
              icon: <Lock />,
            },
            {
              name: 'Balanced',
              description: 'Good privacy protection with minimal impact on functionality',
              icon: <Shield />,
            },
            {
              name: 'Compliance-Focused',
              description: 'Meets regulatory requirements like GDPR and CCPA',
              icon: <Check />,
            },
            { name: 'Custom', description: 'Your current customized settings', icon: <Key /> },
          ].map((preset, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => {
                /* Apply preset */
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {preset.icon}
                </div>
                <div>
                  <h4 className="font-medium">{preset.name}</h4>
                  <p className="text-sm text-muted-foreground">{preset.description}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          ))}
        </CardContent>
        <CardFooter className="border-t pt-4 flex justify-between">
          <Button variant="outline">Reset to Default</Button>
          <Button variant="gradient">Save Settings</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Privacy;
