
"use client";

import type { WifiNetwork } from '@/types/wifi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label } from 'recharts';
import { Wifi, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

interface SignalTrackerDisplayProps {
  trackedNetworkInfo: {
    network: WifiNetwork | null;
    history: Array<{ time: number; strength: number }>;
  };
}

export default function SignalTrackerDisplay({ trackedNetworkInfo }: SignalTrackerDisplayProps) {
  const { network, history } = trackedNetworkInfo;

  if (!network) {
    return null;
  }

  const getProgressColor = (strength: number): string => {
    if (strength > -60) return 'bg-green-500';
    if (strength > -70) return 'bg-yellow-500';
    if (strength > -80) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Map dBm to 0-100 for Progress component. Assume range -100dBm (worst) to -20dBm (best)
  const strengthToProgressValue = (strength: number): number => {
    const minDb = -100;
    const maxDb = -20;
    const value = Math.max(0, Math.min(100, ((strength - minDb) / (maxDb - minDb)) * 100));
    return value;
  };

  const progressValue = strengthToProgressValue(network.strength);

  return (
    <Card className="my-6 shadow-lg border-primary border-2">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <CardTitle className="text-2xl">Tracking: {network.ssid}</CardTitle>
        </div>
        <CardDescription>Live signal strength and history. Move around to see updates.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-muted-foreground">Current Signal</span>
            <span className={`text-lg font-bold ${network.strength > -70 ? 'text-green-600' : network.strength > -80 ? 'text-yellow-600' : 'text-red-600'}`}>
              {network.strength} dBm
            </span>
          </div>
          <Progress value={progressValue} className="h-4 [&>div]:transition-all [&>div]:duration-500" indicatorClassName={getProgressColor(network.strength)} />
        </div>

        {history.length > 1 && (
          <div>
            <h4 className="text-md font-semibold mb-2 text-foreground">Signal History (Last 30s)</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={history} margin={{ top: 5, right: 20, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
                <XAxis 
                  dataKey="time" 
                  tickFormatter={(unixTime) => format(new Date(unixTime), 'HH:mm:ss')}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  domain={[-100, -20]} 
                  reversed={false} // Higher dBm is better, so -20 at top
                  allowDataOverflow={true}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                >
                   <Label value="dBm" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))' }} fontSize={12}/>
                </YAxis>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                  labelFormatter={(label) => format(new Date(label as number), 'HH:mm:ss')}
                  formatter={(value: number) => [`${value} dBm`, "Strength"]}
                />
                <Line 
                  type="monotone" 
                  dataKey="strength" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2} 
                  dot={{ r: 2, fill: 'hsl(var(--primary))' }}
                  activeDot={{ r: 5 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Add this to Progress component if you want to directly style indicator
declare module '@/components/ui/progress' {
    interface ProgressProps {
        indicatorClassName?: string;
    }
}
// Modify progress.tsx to use indicatorClassName
// Find: className="h-full w-full flex-1 bg-primary transition-all"
// Replace: className={cn("h-full w-full flex-1 bg-primary transition-all", indicatorClassName)}
