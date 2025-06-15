import { readFile } from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).send("❌ Missing 'id' parameter");
  }

  const jsonPath = path.join(process.cwd(), 'channels.json');
  const jsonData = await readFile(jsonPath, 'utf-8');
  const channels = JSON.parse(jsonData);

  const channel = channels.find(
    c => (c["tvg-id"] || "").toLowerCase() === decodeURIComponent(id).toLowerCase()
  );

  if (!channel) {
    return res.status(404).send("❌ Channel not found");
  }

  let finalUrl = channel.url;
  const userAgent = channel.headers?.["user-agent"];

  if (userAgent) {
    finalUrl += `|User-Agent=${userAgent}`;
  }

  res.writeHead(302, {
    Location: finalUrl
  });
  res.end();
}
