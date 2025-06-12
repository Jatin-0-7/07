import { readFile } from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: "Missing channel ID" });
    }

    const jsonPath = path.join(process.cwd(), 'channels.json');
    const jsonData = await readFile(jsonPath, 'utf-8');
    const channels = JSON.parse(jsonData);

    const channel = channels.find(ch => ch["tvg-id"] === id);

    if (!channel || !channel.url) {
        return res.status(404).json({ error: "Channel not found or URL missing" });
    }

    // Redirect to actual stream URL
    res.writeHead(302, {
        Location: channel.url
    });
    res.end();
}
