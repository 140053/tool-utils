export type QrTemplate = "text" | "website" | "wifi";
export type WifiEncryption = "WPA" | "WEP" | "nopass";

export interface WifiData {
  ssid: string;
  password: string;
  encryption: WifiEncryption;
  hidden: boolean;
}

// Characters that must be backslash-escaped in the WIFI: payload.
const escapeWifi = (value: string) => value.replace(/([\\;,:"])/g, "\\$1");

export function buildWifiPayload({ ssid, password, encryption, hidden }: WifiData): string {
  if (!ssid) return "";
  const parts = [`T:${encryption}`, `S:${escapeWifi(ssid)}`];
  if (encryption !== "nopass") parts.push(`P:${escapeWifi(password)}`);
  if (hidden) parts.push("H:true");
  return `WIFI:${parts.join(";")};;`;
}

export function buildWebsitePayload(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}
