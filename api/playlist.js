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
    const userAgent = channel.headers?.["user-agent"] || "";

    m3u += `#EXTINF:-1 tvg-id="${id}" tvg-name="${name}" tvg-logo="${logo}" group-title="${group}",${name}\n`;

    if (userAgent) {
      m3u += `#EXTVLCOPT:http-user-agent=${userAgent}\n`;
    }

    m3u += `${baseUrl}/api/stream.mpd?id=${encodeURIComponent(id)}\n\n`;
  });

  res.setHeader("Content-Type", "text/plain");
  res.send(m3u);
}
