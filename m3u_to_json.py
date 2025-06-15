# m3u_to_json.py

import requests
import json
import re

M3U_URL = "https://raw.githubusercontent.com/alex4528/m3u/refs/heads/main/artl.m3u"

def parse_m3u(content):
    channels = []
    lines = content.splitlines()
    current = {}

    for i, line in enumerate(lines):
        line = line.strip()
        if line.startswith("#EXTINF"):
            logo_match = re.search(r'tvg-logo="([^"]+)"', line)
            group_match = re.search(r'group-title="([^"]+)"', line)
            name_match = re.search(r',(.*)', line)
            
            current = {
                "tvg-id": name_match.group(1).strip().replace(" ", "+") if name_match else "",
                "tvg-name": name_match.group(1).strip() if name_match else "",
                "tvg-logo": logo_match.group(1) if logo_match else "",
                "group-title": group_match.group(1) if group_match else ""
            }

        elif line and not line.startswith("#"):
            url = line
            current["url"] = url
            channels.append(current)
            current = {}

    return channels

def main():
    response = requests.get(M3U_URL)
    if response.status_code == 200:
        m3u_content = response.text
        channels = parse_m3u(m3u_content)
        with open("channels.json", "w", encoding="utf-8") as f:
            json.dump(channels, f, indent=2, ensure_ascii=False)
    else:
        print("Failed to fetch M3U. Status:", response.status_code)

if __name__ == "__main__":
    main()
