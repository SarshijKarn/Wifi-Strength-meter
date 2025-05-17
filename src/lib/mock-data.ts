import type { WifiNetwork } from '@/types/wifi';

const MOCK_SSIDS = [
  "HomeNetwork", "OfficeWifi", "GuestAccess", "MyHotspot", "TechCafe", 
  "PublicFreeWifi", " NeighborsWiFi", "ConferenceRoom", "SmartHomeNet", "DevNet"
];

const MOCK_BSSIDS_PREFIX = [
  "00:1A:2B:", "08:00:27:", "A0:B1:C2:", "D3:E4:F5:", "11:22:33:",
  "44:55:66:", "77:88:99:", "AA:BB:CC:", "DD:EE:FF:", "12:34:56:"
];

const MOCK_SECURITY = ["WPA2-PSK", "WPA3-Personal", "WEP", "Open", "WPA2/WPA3"];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomMacSuffix(): string {
  return Array(3).fill(0).map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(':').toUpperCase();
}

function generateRandomBssid(): string {
  return getRandomElement(MOCK_BSSIDS_PREFIX) + generateRandomMacSuffix();
}

export function generateMockWifiData(count: number = 10): WifiNetwork[] {
  const networks: WifiNetwork[] = [];
  const usedBssids = new Set<string>();

  for (let i = 0; i < count; i++) {
    let bssid = generateRandomBssid();
    while(usedBssids.has(bssid)) { // Ensure unique BSSIDs
        bssid = generateRandomBssid();
    }
    usedBssids.add(bssid);

    const strength = Math.floor(Math.random() * ((-30) - (-90) + 1)) + (-90); // dBm between -30 and -90
    const frequency = Math.random() > 0.5 ? 5000 : 2400; // Simplified 5GHz or 2.4GHz
    
    networks.push({
      id: bssid,
      ssid: `${getRandomElement(MOCK_SSIDS)}${Math.random() > 0.7 ? `_${Math.floor(Math.random() * 100)}` : ''}`,
      bssid,
      strength,
      frequency,
      channel: frequency === 2400 ? Math.floor(Math.random() * 11) + 1 : Math.floor(Math.random() * 12) * 4 + 36, // Simplified channel logic
      security: getRandomElement(MOCK_SECURITY),
    });
  }
  // Sort by strength (strongest first)
  return networks.sort((a, b) => b.strength - a.strength);
}
