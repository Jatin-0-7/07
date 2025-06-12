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

        const userAgent = channel.headers?.["user-agent"] || "Mozilla/5.0";
        const origin = "";
        const referer = "";

        // M3U Header
        m3u += `#EXTINF:-1 tvg-id="${id}" tvg-name="${name}" tvg-language="${language}" tvg-logo="${logo}" group-title="${group}" group-logo="${groupLogo}", ${name}\n`;

        // Add clearkey license info if available
        if (licenseType.toLowerCase() === "clearkey" && keyid && key) {
            m3u += `#KODIPROP:inputstream.adaptive.license_type=clearkey\n`;
            m3u += `#KODIPROP:inputstream.adaptive.license_key=${keyid}:${key}\n`;

            // Add optional license URL for dynamic usage
            const licenseUrl = `https://clkey.vercel.app/api/results.php?keyid=${keyid}&key=${key}`;
            // Uncomment if you want to include it as a comment
            // m3u += `# License URL: ${licenseUrl}\n`;
        }

        // Final proxy URL with headers
        const proxyUrl = `https://${host}/api/js.mpd?id=${id}|User-Agent="${userAgent}"&Origin="${origin}"&Referer="${referer}"`;
        m3u += `${proxyUrl}\n\n`;
    });

    res.setHeader("Content-Type", "text/plain");
    res.send(m3u);
}
