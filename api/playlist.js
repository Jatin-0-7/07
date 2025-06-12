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
        const licenseKeyRaw = channel.license?.key || "";

        const userAgent = channel.headers?.["user-agent"] || "tv.accedo.airtel.wynk/1.97.1 (Linux;Android 13) ExoPlayerLib/2.19.1";
        const origin = "";
        const referer = "";

        // Build license URL if present
        let licenseUrl = "";
        if (licenseKeyRaw.includes(":")) {
            const [keyid, key] = licenseKeyRaw.split(":");
            licenseUrl = `https://clkey.vercel.app/api/results.php?keyid=${keyid}&key=${key}`;
        }

        // M3U Info Line
        m3u += `#EXTINF:-1 tvg-id="${id}" tvg-name="${name}" tvg-language="${language}" tvg-logo="${logo}" group-title="${group}" group-logo="${groupLogo}", ${name}\n`;

        if (licenseUrl) {
            m3u += `#KODIPROP:inputstream.adaptive.license_type=${licenseType}\n`;
            m3u += `#KODIPROP:inputstream.adaptive.license_key=${licenseUrl}\n`;
        }

        // Use proxy with headers passed in query
        const proxyUrl = `https://${host}/api/js.mpd?id=${id}|User-Agent="${userAgent}"&Origin="${origin}"&Referer="${referer}"`;
        m3u += `${proxyUrl}\n\n`;
    });

    res.setHeader("Content-Type", "text/plain");
    res.send(m3u);
}
