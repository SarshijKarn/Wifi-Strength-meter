import type { WifiNetwork } from '@/types/wifi';

interface ExportDataRow {
  Location: string;
  SSID: string;
  BSSID: string;
  'Signal Strength (dBm)': number;
  Frequency?: number;
  Channel?: number;
  Security?: string;
}

function convertToCSV(data: ExportDataRow[]): string {
  if (!data.length) {
    return '';
  }
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = (row as any)[header];
        // Escape commas and quotes
        const stringValue = value === undefined || value === null ? '' : String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ];
  return csvRows.join('\\n');
}

export function exportWifiDataToCsv(networks: WifiNetwork[], locationLabel: string, filename: string = 'wifi_scan_data.csv'): void {
  const dataToExport: ExportDataRow[] = networks.map(network => ({
    Location: locationLabel,
    SSID: network.ssid,
    BSSID: network.bssid,
    'Signal Strength (dBm)': network.strength,
    Frequency: network.frequency,
    Channel: network.channel,
    Security: network.security,
  }));

  const csvString = convertToCSV(dataToExport);
  if (!csvString) return;

  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
