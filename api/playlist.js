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
    const language = channel["tvg-language"] || "Unknown";

    const licenseType = channel.license?.type || "";
    const keyid = channel.license?.keyid || "";
    const key = channel.license?.key || "";

    const userAgent = channel.headers?.["user-agent"] || "Hotstar;in.startv.hotstar/25.01.27.5.3788 (Android/13)";
    const origin = "https://www.hotstar.com";  // can be filled from JSON if needed
    const referer = "https://www.hotstar.com/"; // can be filled from JSON if needed

    // M3U EXTINF header
    m3u += `#EXTINF:-1 tvg-id="${id}" tvg-name="${name}" tvg-language="${language}" tvg-logo="${logo}" group-title="${group}" group-logo="${groupLogo}", ${name}\n`;

    // License header using external URL
    if (licenseType.toLowerCase() === "clearkey" && keyid && key) {
      const licenseUrl = `https://clkey.vercel.app/api/results.php?keyid=${keyid}&key=${key}`;
      m3u += `#KODIPROP:inputstream.adaptive.license_type=clearkey\n`;
      m3u += `#KODIPROP:inputstream.adaptive.license_key=${licenseUrl}\n`;
    }

    // Proxy stream URL
    const proxyUrl = `https://${host}/api/js.mpd?id=${encodeURIComponent(id)}|User-Agent="${userAgent}"&Origin="${origin}"&Referer="${referer}"`;
    m3u += `${proxyUrl}\n\n`;
  });

  res.setHeader("Content-Type", "text/plain");
  res.send(m3u);
}
