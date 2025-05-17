export interface WifiNetwork {
  id: string; // Unique ID, typically BSSID
  ssid: string; // Network Name
  bssid: string; // MAC Address
  strength: number; // Signal strength in dBm
  frequency?: number; // e.g., 2412 (2.4GHz) or 5200 (5GHz)
  channel?: number;
  security?: string; // e.g., "WPA2/WPA3"
}
