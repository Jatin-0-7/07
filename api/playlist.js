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

    const licenseType = channel.license?.type || "";
    const keyid = channel.license?.keyid || "";
    const key = channel.license?.key || "";

    const userAgent = channel.headers?.["user-agent"] || "Hotstar;in.startv.hotstar/25.01.27.5.3788 (Android/13)";
    const origin = "https://www.hotstar.com";
    const referer = "https://www.hotstar.com/";

    // EXTINF line
    m3u += `#EXTINF:-1 tvg-id="${id}" tvg-name="${name}" tvg-logo="${logo}" group-title="${group}" group-logo="${groupLogo}", ${name}\n`;

    // KODIPROP manifest_type
    m3u += `#KODIPROP:inputstream.adaptive.manifest_type=dash\n`;

    // License
    if (licenseType.toLowerCase() === "org.w3.clearkey" && keyid && key) {
      const licenseUrl = `https://clkey.vercel.app/api/results.php?keyid=${keyid}&key=${key}`;
      m3u += `#KODIPROP:inputstream.adaptive.license_type=org.w3.clearkey\n`;
      m3u += `#KODIPROP:inputstream.adaptive.license_key=${licenseUrl}\n`;
    }

    // Proxy URL with headers
    const proxyUrl = `https://${host}/api/js.mpd?id=${encodeURIComponent(id)}|User-Agent="${userAgent}"&Origin="${origin}"&Referer="${referer}"`;
    m3u += `${proxyUrl}\n\n`;
  });

  res.setHeader("Content-Type", "text/plain");
  res.send(m3u);
}

