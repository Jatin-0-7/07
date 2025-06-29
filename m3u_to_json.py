import requests
import json
import re

M3U_URL = "https://raw.githubusercontent.com/geekyhimanshu/m3u/refs/heads/main/artl.m3u"

def parse_m3u(content):
    lines = content.strip().splitlines()
    channels = []
    current = {}
    license_key = ""
    cookie = ""

    for line in lines:
        line = line.strip()

        if line.startswith("#KODIPROP:inputstream.adaptive.license_key="):
            license_key = line.split("=", 1)[1]

        elif line.startswith("#EXTHTTP:"):
            try:
                headers_json = json.loads(line.replace("#EXTHTTP:", "").strip())
                cookie = headers_json.get("cookie", "")
            except:
                pass

        elif line.startswith("#EXTINF:"):
            logo = re.search(r'tvg-logo="([^"]+)"', line)
            group = re.search(r'group-title="([^"]+)"', line)
            name = re.search(r',(.*)', line)

            current = {
                "tvg-id": name.group(1).strip().replace(" ", "+") if name else "",
                "tvg-name": name.group(1).strip() if name else "",
                "tvg-logo": logo.group(1) if logo else "",
                "group-title": group.group(1) if group else ""
            }

        elif line and not line.startswith("#"):
            base_url = line
            formatted_url = f"{base_url}?|Cookie={cookie}" if cookie else base_url
            current["url"] = formatted_url

            if license_key and ":" in license_key:
                keyid, key = license_key.split(":")
                current["drmScheme"] = "clearkey"
                current["drmLicense"] = f"{keyid}:{key}"

            channels.append(current)
            current = {}
            license_key = ""
            cookie = ""

    return channels

def main():
    response = requests.get(M3U_URL)
    if response.status_code == 200:
        m3u_content = response.text
        channels = parse_m3u(m3u_content)
        with open("channels.json", "w", encoding="utf-8") as f:
            json.dump(channels, f, indent=2, ensure_ascii=False)
        print("✅ channels.json updated successfully.")
    else:
        print("❌ Failed to fetch M3U. Status:", response.status_code)

if __name__ == "__main__":
    main()

