import { readFile } from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).send("Missing channel ID");

  const jsonPath = path.join(process.cwd(), 'channels.json');
  const jsonData = await readFile(jsonPath, 'utf-8');
  const channels = JSON.parse(jsonData);

  const channel = channels.find(
    (c) => c["tvg-name"]?.toLowerCase() === decodeURIComponent(id).toLowerCase()
  );

  if (!channel) return res.status(404).send("Channel not found");

  const cookie = channel.headers?.cookie || "";

  // ✅ Return raw cookie string (not JSON)
  res.setHeader("Content-Type", "text/plain");
  return res.send(cookie);
}

