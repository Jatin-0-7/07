import { readFile } from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  const { id } = req.query; // Channel name
  if (!id) return res.status(400).send("❌ Missing channel ID");

  const jsonPath = path.join(process.cwd(), 'channels.json');
  const jsonData = await readFile(jsonPath, 'utf-8');
  const channels = JSON.parse(jsonData);

  const channel = channels.find(c => c["tvg-name"]?.toLowerCase() === id.toLowerCase());
  if (!channel) return res.status(404).send("❌ Channel not found");

  let url = channel.url;
  const headers = {};

  if (channel.headers?.["user-agent"]) {
    headers["User-Agent"] = channel.headers["user-agent"];
  }
  if (channel.headers?.cookie) {
    // If cookie is not already in the URL, add it
    if (!url.includes("|")) {
      url += `|cookie=${channel.headers.cookie}`;
    }
  }

  // Respond with redirect and optional headers (or proxy manually if needed)
  res.setHeader("Location", url);
  res.statusCode = 302;
  res.end();
}
