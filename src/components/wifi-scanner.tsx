"use client";

import { useState, useEffect } from 'react';
import type { WifiNetwork } from '@/types/wifi';
import { generateMockWifiData } from '@/lib/mock-data';
import { exportWifiDataToCsv } from '@/lib/csv-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import WifiList from './wifi-list';
import { RefreshCw, Download, MapPin, Activity } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function WifiScanner() {
  const [wifiNetworks, setWifiNetworks] = useState<WifiNetwork[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [locationLabel, setLocationLabel] = useState<string>('My Current Location');
  const { toast } = useToast();

  const handleScanWifi = () => {
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      const newNetworks = generateMockWifiData(Math.floor(Math.random() * 8) + 5); // 5 to 12 networks
      setWifiNetworks(newNetworks);
      setIsLoading(false);
      toast({
        title: "Scan Complete",
        description: `${newNetworks.length} WiFi networks found.`,
      });
    }, 1000);
  };

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

  // Initial scan on component mount
  useEffect(() => {
    handleScanWifi();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <div className="max-w-3xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-bold">WiFi Strength Scanner</CardTitle>
          </div>
          <CardDescription>
            Simulate scanning for nearby WiFi networks, view their signal strength, and export the results.
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
          
          <WifiList networks={wifiNetworks} isLoading={isLoading} />
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground pt-4 border-t">
          <p>Signal strength is simulated. This tool is for demonstration purposes.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
