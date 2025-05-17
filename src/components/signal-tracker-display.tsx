
"use client";

import type { WifiNetwork } from '@/types/wifi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadialBarChart, RadialBar, PolarAngleAxis, PolarRadiusAxis, PolarGrid, ResponsiveContainer, Label } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { useMemo, useCallback } from 'react';

interface SignalTrackerDisplayProps {
  trackedNetworkInfo: {
    network: WifiNetwork | null;
    history: Array<{ time: number; strength: number }>;
  };
}

export default function SignalTrackerDisplay({ trackedNetworkInfo }: SignalTrackerDisplayProps) {
  const { network, history } = trackedNetworkInfo;

  const strengthToProgressValue = useCallback((strength: number): number => {
    const minDb = -100;
    const maxDb = -20;
    // Ensure strength is within expected bounds before normalization
    const clampedStrength = Math.max(minDb, Math.min(maxDb, strength));
    const value = Math.max(0, Math.min(100, ((clampedStrength - minDb) / (maxDb - minDb)) * 100));
    return value;
  }, []);


  const getProgressColor = (strength: number): string => {
    // These are Tailwind classes, Progress component is set up to use them via indicatorClassName
    if (strength > -60) return 'bg-green-500'; // Strong
    if (strength > -70) return 'bg-yellow-500'; // Medium
    if (strength > -80) return 'bg-orange-500'; // Weak
    return 'bg-red-500'; // Very Weak
  };


  const formattedHistory = useMemo(() => {
    return history.map(item => ({
      time: format(new Date(item.time), 'HH:mm:ss'),
      strength_norm: strengthToProgressValue(item.strength),
      original_strength: item.strength,
    }));
  }, [history, strengthToProgressValue]);
  
  const angleAxisInterval = useMemo(() => {
    if (formattedHistory.length === 0) return 0;
    return Math.max(0, Math.ceil(formattedHistory.length / 8) - 1); // Aim for ~8 labels
  }, [formattedHistory.length]);

  if (!network) {
    return null;
  }
  
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

        {formattedHistory.length > 1 && (
          <div>
            <h4 className="text-md font-semibold mb-2 text-foreground">Signal History (Circular View)</h4>
            <ResponsiveContainer width="100%" height={350}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                data={formattedHistory}
                innerRadius="15%"
                outerRadius="85%"
                barSize={Math.max(5, Math.floor(150 / Math.max(1, formattedHistory.length)))} // Dynamic bar size
              >
                <PolarGrid gridType="polygon" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                <PolarAngleAxis
                  dataKey="time"
                  tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }}
                  interval={angleAxisInterval}
                />
                <PolarRadiusAxis
                  angle={30} // Angle for the radius axis line labels
                  domain={[0, 100]} // Normalized strength 0-100
                  tickFormatter={(value) => `${value}%`}
                  tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickCount={6} // 0, 20, 40, 60, 80, 100
                >
                  <Label 
                    value="Normalized Strength" 
                    angle={0} 
                    position="outer" 
                    offset={-25} 
                    style={{ textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  />
                </PolarRadiusAxis>
                <RadialBar
                  dataKey="strength_norm"
                  fill="hsl(var(--primary))"
                  background={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
                  cornerRadius={2}
                  isAnimationActive={false}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
