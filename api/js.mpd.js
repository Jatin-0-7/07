import { readFile } from 'fs/promises';
import path from 'path';
import https from 'https';
import http from 'http';
import { URL } from 'url';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) return res.status(400).send("❌ Missing 'id' parameter");

  const jsonPath = path.join(process.cwd(), 'channels.json');
  const jsonData = await readFile(jsonPath, 'utf-8');
  const channels = JSON.parse(jsonData);

  const channel = channels.find(
    c => (c["tvg-id"] || "").toLowerCase() === decodeURIComponent(id).toLowerCase()
  );

  if (!channel || !channel.url) return res.status(404).send("❌ Channel not found");

  const streamUrl = channel.url;
  const parsedUrl = new URL(streamUrl);

  const client = parsedUrl.protocol === 'https:' ? https : http;

  client.get(streamUrl, streamRes => {
    res.writeHead(streamRes.statusCode, streamRes.headers);
    streamRes.pipe(res);
  }).on('error', err => {
    console.error('Stream fetch error:', err);
    res.status(500).send("❌ Failed to fetch stream");
  });
}
