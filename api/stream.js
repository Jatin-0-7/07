import { readFile } from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
    const { channel } = req.query;

    const jsonPath = path.join(process.cwd(), 'channels.json');
    const jsonData = await readFile(jsonPath, 'utf-8');
    const channels = JSON.parse(jsonData);

    const channelData = channels.find(ch => ch["tvg-id"] === channel);

    if (!channelData) {
        return res.status(404).json({ error: "Channel not found" });
    }

    const originalUrl = channelData.url;

    if (!originalUrl) {
        return res.status(400).json({ error: "No URL defined for this channel" });
    }

    res.redirect(originalUrl);
}
