
"use client";

import type { WifiNetwork } from '@/types/wifi';
import { Card, CardContent } from '@/components/ui/card';
import { Wifi, SignalHigh, SignalMedium, SignalLow, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface WifiListItemProps {
  network: WifiNetwork;
  onNetworkSelect: (network: WifiNetwork) => void;
  isSelected: boolean;
}

export default function WifiListItem({ network, onNetworkSelect, isSelected }: WifiListItemProps) {
  const getSignalStrengthIndicator = (strength: number) => {
    if (strength > -60) {
      return <SignalHigh className="h-5 w-5 text-green-500" aria-label="Strong signal" />;
    } else if (strength > -70) {
      return <SignalMedium className="h-5 w-5 text-yellow-500" aria-label="Medium signal" />;
    } else if (strength > -90){
      return <SignalLow className="h-5 w-5 text-red-500" aria-label="Weak signal" />;
    }
    return <AlertTriangle className="h-5 w-5 text-slate-400" aria-label="Very weak signal" />;
  };

  const getSignalStrengthColorClass = (strength: number): string => {
    if (strength > -60) return 'border-l-4 border-green-500';
    if (strength > -70) return 'border-l-4 border-yellow-500';
    if (strength > -90) return 'border-l-4 border-red-500';
    return 'border-l-4 border-slate-400';
  };

  return (
    <Card 
      className={cn(
        "group mb-3 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer",
        getSignalStrengthColorClass(network.strength),
        isSelected && "ring-2 ring-primary shadow-xl"
      )}
      onClick={() => onNetworkSelect(network)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onNetworkSelect(network)}}
      aria-pressed={isSelected}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Wifi className="h-6 w-6 text-primary" />
            <div>
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-150">{network.ssid}</h3>
              <p className="text-xs text-muted-foreground">{network.bssid}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-foreground">{network.strength} dBm</span>
            {getSignalStrengthIndicator(network.strength)}
          </div>
        </div>
        {(network.frequency || network.security) && (
           <div className="mt-2 pt-2 border-t border-border/50 flex flex-wrap gap-2">
            {network.frequency && (
              <Badge variant="secondary" className="text-xs">
                {network.frequency > 4000 ? '5 GHz' : '2.4 GHz'}
                {network.channel && ` (Ch: ${network.channel})`}
              </Badge>
            )}
            {network.security && <Badge variant="outline" className="text-xs">{network.security}</Badge>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
