
"use client";

import type { WifiNetwork } from '@/types/wifi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useCallback } from 'react';

interface SignalTrackerDisplayProps {
  trackedNetworkInfo: {
    network: WifiNetwork | null;
    // History is kept for potential future use or other display components,
    // but this gauge will only show the current strength.
    history: Array<{ time: number; strength: number }>;
  };
}

const GAUGE_START_ANGLE = 200; // Start angle for the gauge arc
const GAUGE_END_ANGLE = -20; // End angle for the gauge arc (total sweep of 220 degrees)
const GAUGE_MIN_DB = -100;
const GAUGE_MAX_DB = -20;

export default function SignalTrackerDisplay({ trackedNetworkInfo }: SignalTrackerDisplayProps) {
  const { network } = trackedNetworkInfo;

  const normalizeStrengthForGauge = useCallback((strength: number): number => {
    const clampedStrength = Math.max(GAUGE_MIN_DB, Math.min(GAUGE_MAX_DB, strength));
    const value = Math.max(0, Math.min(100, ((clampedStrength - GAUGE_MIN_DB) / (GAUGE_MAX_DB - GAUGE_MIN_DB)) * 100));
    return value;
  }, []);

  const getGaugeColor = useCallback((strength: number): string => {
    if (strength > -60) return 'hsl(120, 70%, 45%)'; // Green for Strong
    if (strength > -75) return 'hsl(50, 85%, 50%)'; // Yellow for Medium
    return 'hsl(0, 75%, 55%)'; // Red for Weak/Very Weak
  }, []);

  if (!network) {
    return null;
  }

  const normalizedStrength = normalizeStrengthForGauge(network.strength);
  const gaugeColor = getGaugeColor(network.strength);

  const gaugeData = [{ name: 'strength', value: normalizedStrength, fill: gaugeColor }];

  // Ticks for the PolarAngleAxis (0 to 100 scale, labels are dBm)
  const gaugeTicks = [
    { value: 0, label: `${GAUGE_MIN_DB}` }, // Corresponds to -100 dBm
    { value: 25, label: `${Math.round(GAUGE_MIN_DB + (GAUGE_MAX_DB - GAUGE_MIN_DB) * 0.25)}` }, // -80
    { value: 50, label: `${Math.round(GAUGE_MIN_DB + (GAUGE_MAX_DB - GAUGE_MIN_DB) * 0.5)}` },  // -60
    { value: 75, label: `${Math.round(GAUGE_MIN_DB + (GAUGE_MAX_DB - GAUGE_MIN_DB) * 0.75)}` }, // -40
    { value: 100, label: `${GAUGE_MAX_DB}` }, // Corresponds to -20 dBm
  ];


  return (
    <Card className="my-6 shadow-lg border-border">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <CardTitle className="text-2xl">Tracking: {network.ssid}</CardTitle>
        </div>
        <CardDescription>Live signal strength. Move around to see updates.</CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <ResponsiveContainer width="100%" height={300}>
          <RadialBarChart
            cx="50%"
            cy="60%" // Adjust cy to push chart slightly down for better label visibility
            innerRadius="45%"
            outerRadius="90%"
            barSize={30}
            data={gaugeData}
            startAngle={GAUGE_START_ANGLE}
            endAngle={GAUGE_END_ANGLE}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]} // Normalized strength 0-100
              angleAxisId={0}
              tickAmount={gaugeTicks.length}
              ticks={gaugeTicks.map(t => t.value)}
              tickFormatter={(value) => {
                const tickObj = gaugeTicks.find(t => t.value === value);
                return tickObj ? tickObj.label : '';
              }}
              stroke="hsl(var(--foreground))" // Brighter color for ticks and labels
              fontSize={11} // Slightly larger font size for ticks
            />
            <RadialBar
              minAngle={15}
              background={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
              dataKey="value"
              cornerRadius={15}
              isAnimationActive={true}
              animationDuration={700}
              animationEasing="ease-out"
            />
            {/* Tooltip removed as per previous request for non-interactive graph */}
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/4 text-center pointer-events-none">
          <div className="text-5xl font-bold" style={{ color: gaugeColor }}>
            {network.strength}
          </div>
          <div className="text-sm text-muted-foreground">dBm</div>
        </div>
      </CardContent>
    </Card>
  );
}

