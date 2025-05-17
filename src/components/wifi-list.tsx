
"use client";

import type { WifiNetwork } from '@/types/wifi';
import WifiListItem from './wifi-list-item';
import { Skeleton } from '@/components/ui/skeleton';
import { WifiOff } from 'lucide-react';

interface WifiListProps {
  networks: WifiNetwork[];
  isLoading: boolean;
  selectedNetworkId: string | null;
  onNetworkSelect: (network: WifiNetwork) => void;
}

export default function WifiList({ networks, isLoading, selectedNetworkId, onNetworkSelect }: WifiListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 mt-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 border rounded-lg shadow-sm bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-6 w-6 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (networks.length === 0) {
    return (
      <div className="mt-10 flex flex-col items-center justify-center text-center">
        <WifiOff className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold text-foreground">No WiFi Networks Found</h3>
        <p className="text-muted-foreground">Click "Scan WiFi" to search for networks.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-0">
      <h2 className="text-xl font-semibold text-foreground mb-3">Available Networks</h2>
      {networks.map(network => (
        <WifiListItem 
          key={network.id} 
          network={network}
          onNetworkSelect={onNetworkSelect}
          isSelected={network.id === selectedNetworkId}
        />
      ))}
    </div>
  );
}
