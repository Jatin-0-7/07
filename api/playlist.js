import { readFile } from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  const host = req.headers.host;
  const jsonPath = path.join(process.cwd(), 'channels.json');
  const jsonData = await readFile(jsonPath, 'utf-8');
  const channels = JSON.parse(jsonData);

  let m3u = "#EXTM3U\n\n";

  channels.forEach(channel => {
    const id = channel["tvg-id"] || "unknown";
    const name = channel["tvg-name"] || "Unknown";
    const logo = channel["tvg-logo"] || "";
    const group = channel["group-title"] || "General";
    const groupLogo = channel["group-logo"] || "";

    // License info
    const licenseType = channel.license?.type || "";
    const licenseKeyRaw = channel.license?.key || "";
    const [keyid, key] = licenseKeyRaw.includes(":") ? licenseKeyRaw.split(":") : ["", ""];

    // Headers
    const userAgent = channel.headers?.["user-agent"] || "Hotstar;in.startv.hotstar/25.01.27.5.3788 (Android/13)";
    const origin = channel.headers?.["origin"] || "";
    const referer = channel.headers?.["referer"] || "";

    // EXTINF
    m3u += `#EXTINF:-1 tvg-id="${id}" tvg-name="${name}" tvg-logo="${logo}" group-title="${group}" group-logo="${groupLogo}", ${name}\n`;

    // KODIPROP for DASH
    m3u += `#KODIPROP:inputstream.adaptive.manifest_type=dash\n`;

    // License (clearkey)
    if (licenseType.toLowerCase() === "clearkey" && keyid && key) {
      m3u += `#KODIPROP:inputstream.adaptive.license_type=clearkey\n`;
      m3u += `#KODIPROP:inputstream.adaptive.license_key=${licenseKeyRaw}\n`;
    }

    // Final stream URL (with |cookie already in URL if present)
    const finalUrl = `${channel.url}|User-Agent="${userAgent}"${origin ? `&Origin="${origin}"` : ""}${referer ? `&Referer="${referer}"` : ""}`;
    m3u += `${finalUrl}\n\n`;
  });

  res.setHeader("Content-Type", "text/plain");
  res.send(m3u);
}


