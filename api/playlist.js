import { readFile } from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  const host = req.headers.host;
  const baseUrl = `https://${host}`;
  const jsonPath = path.join(process.cwd(), 'channels.json');
  const jsonData = await readFile(jsonPath, 'utf-8');
  const channels = JSON.parse(jsonData);

  let m3u = "#EXTM3U\n\n";

  channels.forEach((channel, index) => {
    const id = channel["tvg-id"] || String(index + 100);
    const name = channel["tvg-name"] || "Unknown";
    const logo = channel["tvg-logo"] || "";
    const group = channel["group-title"] || "General";
    const userAgent = "tv.accedo.airtel.wynk/1.97.1 (Linux;Android 13) ExoPlayerLib/2.19.1";
    const drmScheme = channel["drmScheme"] || "";
    const drmLicense = channel["drmLicense"] || "";

    // #EXTINF
    m3u += `#EXTINF:-1 tvg-id="${id}" tvg-name="${name}" tvg-logo="${logo}" group-title="${group}",${name}\n`;

    // user-agent
    m3u += `#EXTVLCOPT:http-user-agent=${userAgent}\n`;

    // Stream URL with query params if DRM present
    const streamUrl = `${baseUrl}/api/js.mpd?id=${encodeURIComponent(id)}${drmScheme && drmLicense ? `&drmScheme=${drmScheme}&drmLicense=${drmLicense}` : ""}`;
    m3u += `${streamUrl}\n\n`;
  });

  res.setHeader("Content-Type", "text/plain");
  res.send(m3u);
}

