
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { WifiNetwork } from '@/types/wifi';
import { generateMockWifiData } from '@/lib/mock-data';
import { exportWifiDataToCsv } from '@/lib/csv-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import WifiList from './wifi-list';
import SignalTrackerDisplay from './signal-tracker-display';
import { RefreshCw, Download, MapPin, Activity, XCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface TrackedNetworkState {
  network: WifiNetwork | null;
  history: Array<{ time: number; strength: number }>;
}

const MAX_HISTORY_POINTS = 30; // Number of data points for the chart
const SIGNAL_UPDATE_INTERVAL = 1500; // milliseconds

export default function WifiScanner() {
  const [wifiNetworks, setWifiNetworks] = useState<WifiNetwork[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [locationLabel, setLocationLabel] = useState<string>('My Current Location');
  const [trackedNetworkInfo, setTrackedNetworkInfo] = useState<TrackedNetworkState>({ network: null, history: [] });
  const { toast } = useToast();

  const handleScanWifi = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      const newNetworks = generateMockWifiData(Math.floor(Math.random() * 8) + 5);
      setWifiNetworks(newNetworks);
      setIsLoading(false);
      toast({
        title: "Scan Complete",
        description: `${newNetworks.length} WiFi networks found.`,
      });

      // Check if tracked network is still visible
      if (trackedNetworkInfo.network) {
        const stillExists = newNetworks.find(n => n.id === trackedNetworkInfo.network!.id);
        if (!stillExists) {
          toast({
            title: "Tracking Stopped",
            description: `Network ${trackedNetworkInfo.network.ssid} is no longer visible.`,
            variant: "destructive"
          });
          setTrackedNetworkInfo({ network: null, history: [] });
        } else {
          // Update details of the tracked network if they changed (e.g. channel), but keep live strength
           setTrackedNetworkInfo(prev => ({
            ...prev,
            network: prev.network ? { ...stillExists, strength: prev.network.strength } : null
           }));
        }
      }
    }, 1000);
  }, [toast, trackedNetworkInfo.network]);

  const handleExportCsv = () => {
    if (wifiNetworks.length === 0) {
      toast({
        title: "Export Failed",
        description: "No WiFi data to export. Please scan first.",
        variant: "destructive",
      });
      return;
    }
    exportWifiDataToCsv(wifiNetworks, locationLabel);
    toast({
      title: "Export Successful",
      description: `Data exported to wifi_scan_data.csv for location: ${locationLabel}`,
    });
  };

  const handleSelectNetwork = (network: WifiNetwork) => {
    if (trackedNetworkInfo.network?.id === network.id) {
      // Deselect if clicking the same network again (optional behavior)
      // setTrackedNetworkInfo({ network: null, history: [] });
      // toast({ title: "Tracking Stopped", description: `Stopped tracking ${network.ssid}.` });
      return; // Or do nothing if re-clicked
    }
    // Make a copy for the live tracking to modify its strength independently
    const networkCopy = { ...network };
    setTrackedNetworkInfo({ 
      network: networkCopy, 
      history: [{ time: Date.now(), strength: networkCopy.strength }] 
    });
    toast({
      title: "Tracking Started",
      description: `Now tracking ${network.ssid}. Move around to see signal updates.`,
    });
  };
  
  const stopTracking = () => {
    if (trackedNetworkInfo.network) {
       toast({ title: "Tracking Stopped", description: `Stopped tracking ${trackedNetworkInfo.network.ssid}.` });
    }
    setTrackedNetworkInfo({ network: null, history: [] });
  }

  // Initial scan on component mount
  useEffect(() => {
    handleScanWifi();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // handleScanWifi is memoized with useCallback

  // Effect for live signal strength update simulation
  useEffect(() => {
    if (!trackedNetworkInfo.network) {
      return; 
    }

    const intervalId = setInterval(() => {
      setTrackedNetworkInfo(prevInfo => {
        if (!prevInfo.network) {
          // This case should ideally be handled by the cleanup, but as a safeguard:
          clearInterval(intervalId);
          return prevInfo;
        }

        // Simulate a small change, ensure it stays within realistic bounds
        let newStrength = prevInfo.network.strength + (Math.random() * 8 - 4); // -4 to +4 dBm change
        newStrength = Math.max(-100, Math.min(-20, Math.round(newStrength))); // Clamp between -100 and -20 dBm

        const updatedLiveNetwork = { ...prevInfo.network, strength: newStrength };
        const newHistoryEntry = { time: Date.now(), strength: newStrength };
        
        const updatedHistory = [...prevInfo.history, newHistoryEntry].slice(-MAX_HISTORY_POINTS);

        return { network: updatedLiveNetwork, history: updatedHistory };
      });
    }, SIGNAL_UPDATE_INTERVAL);

    return () => clearInterval(intervalId); 
  }, [trackedNetworkInfo.network?.id]); // Re-run if the ID of the tracked network changes

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-bold">WiFi Strength Scanner</CardTitle>
          </div>
          <CardDescription>
            Simulate scanning for nearby WiFi networks. Click a network to track its signal strength in real-time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-secondary/50 rounded-lg border border-border">
            <label htmlFor="locationLabel" className="block text-sm font-medium text-foreground mb-1">
              Location Label
            </label>
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <Input
                id="locationLabel"
                type="text"
                value={locationLabel}
                onChange={(e) => setLocationLabel(e.target.value)}
                placeholder="E.g., Living Room, Office Desk"
                className="bg-background focus:border-primary"
              />
            </div>
             <p className="text-xs text-muted-foreground mt-1">Label your scan for better context in exports.</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <Button
              onClick={handleScanWifi}
              disabled={isLoading}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
              aria-label="Scan for WiFi networks"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Scanning...' : 'Scan WiFi'}
            </Button>
            {trackedNetworkInfo.network && (
                 <Button
                    onClick={stopTracking}
                    variant="destructive"
                    className="w-full sm:w-auto"
                    aria-label="Stop tracking WiFi network"
                >
                    <XCircle className="mr-2 h-4 w-4" />
                    Stop Tracking
                </Button>
            )}
            <Button
              onClick={handleExportCsv}
              disabled={wifiNetworks.length === 0 || isLoading}
              variant="outline"
              className="w-full sm:w-auto border-accent text-accent hover:bg-accent hover:text-accent-foreground"
              aria-label="Export WiFi data to CSV"
            >
              <Download className="mr-2 h-4 w-4" />
              Export to CSV
            </Button>
          </div>
          
          {trackedNetworkInfo.network && (
            <SignalTrackerDisplay trackedNetworkInfo={trackedNetworkInfo} />
          )}
          
          <WifiList 
            networks={wifiNetworks} 
            isLoading={isLoading}
            selectedNetworkId={trackedNetworkInfo.network?.id || null}
            onNetworkSelect={handleSelectNetwork}
          />
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground pt-4 border-t">
          <p>Signal strength is simulated. This tool is for demonstration purposes.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
