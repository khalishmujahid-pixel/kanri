import type { PmEquipmentEntry } from '../types/character';

// Cloudflare Worker Proxy Endpoint URL
export const GOOGLE_APPS_SCRIPT_URL =
  'https://cool-fire-606c.khalishmujahid.workers.dev/';

export interface SheetApiResponse {
  success?: boolean;
  pic?: string;
  totalEquipment?: number;
  equipmentSchedule?: PmEquipmentEntry[];
  availableSheets?: string[];
  error?: string;
}

/**
 * Fetch live PM schedule data from Google Sheets for a specific character/PIC
 */
export async function fetchLivePmSchedule(picName: string): Promise<PmEquipmentEntry[] | null> {
  try {
    // Add cache buster timestamp to ensure fresh response every time
    const url = `${GOOGLE_APPS_SCRIPT_URL}?pic=${encodeURIComponent(picName)}&_t=${Date.now()}`;
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`[GoogleSheetsService] HTTP Error: ${response.status}`);
      return null;
    }

    const data: SheetApiResponse = await response.json();

    if (data.error) {
      console.warn(`[GoogleSheetsService] API Error: ${data.error}`, data.availableSheets);
      return null;
    }

    if (data.equipmentSchedule && Array.isArray(data.equipmentSchedule) && data.equipmentSchedule.length > 0) {
      return data.equipmentSchedule;
    }

    return null;
  } catch (err) {
    console.error('[GoogleSheetsService] Failed to fetch schedule from Google Sheets:', err);
    return null;
  }
}
