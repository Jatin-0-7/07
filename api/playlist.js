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
    const groupLogo = channel["group-logo"] || "https://play-lh.googleusercontent.com/jzl7NxxP-KCiPokxeHrf3RZtJTbsYh_GgQUeMT7LaknTi5LiJ82FYUd68kttuKVRpmw=w480-h960-rw";

    const licenseType = channel.license?.type || "";
    const licenseKeyRaw = channel.license?.key || "";
    const [keyid, key] = licenseKeyRaw.includes(":") ? licenseKeyRaw.split(":") : ["", ""];

    const userAgent = channel.headers?.["user-agent"] || "tv.accedo.airtel.wynk/1.97.1 (Linux;Android 13) ExoPlayerLib/2.19.1";
    const cookie = channel.headers?.cookie || "";

    m3u += `#EXTINF:-1 tvg-id="${id}" tvg-name="${name}" tvg-language="Unknown" tvg-logo="${logo}" group-title="AirtelXstream⛑️${group}" group-logo="${groupLogo}", ${name}\n`;

    if (licenseType.toLowerCase() === "clearkey" && keyid && key) {
      const licenseUrl = `https://clkey.vercel.app/api/results.php?keyid=${keyid}&key=${key}`;
      m3u += `#KODIPROP:inputstream.adaptive.license_type=org.w3.clearkey\n`;
      m3u += `#KODIPROP:inputstream.adaptive.license_key=${licenseUrl}\n`;
    }

    if (cookie) {
      m3u += `#EXTHTTP:{"cookie":"${cookie}"}\n`;
    }

    m3u += `${baseUrl}/api/js.mpd?id=${encodeURIComponent(name)}|User-Agent="${userAgent}"\n\n`;
  });

  res.setHeader("Content-Type", "text/plain");
  res.send(m3u);
}
