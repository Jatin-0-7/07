// /pages/api/js.mpd.js

import { readFile } from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).send("Missing channel ID");

  const jsonPath = path.join(process.cwd(), 'channels.json');
  const jsonData = await readFile(jsonPath, 'utf-8');
  const channels = JSON.parse(jsonData);

  const channel = channels.find(c => c["tvg-name"] === id);
  if (!channel) return res.status(404).send("Channel not found");

  // Redirect directly to .mpd
  res.writeHead(302, {
    "Location": channel.url
  });
  res.end();
}
