import re
import json

def format_name_variants(tvg_name):
    return {
        "tvg-id": tvg_name.replace(" ", "+"),
        "name": tvg_name.replace(" ", "-")
    }

def parse_m3u_to_json(m3u_content):
    lines = m3u_content.strip().splitlines()
    result = []
    item = {}

    for line in lines:
        line = line.strip()

        if line.startswith("#EXTINF:"):
            extinf_pattern = re.compile(
                r'#EXTINF:-1 tvg-logo="(.*?)" group-title="(.*?)",(.*)')
            match = extinf_pattern.match(line)
            if match:
                tvg_logo = match.group(1)
                group_title = match.group(2)
                tvg_name = match.group(3).strip()
                name_variants = format_name_variants(tvg_name)
                item = {
                    "tvg-id": name_variants["tvg-id"],
                    "tvg-name": tvg_name,
                    "tvg-logo": tvg_logo,
                    "group-title": group_title,
                    "name": name_variants["name"]
                }

        elif line.startswith("#KODIPROP:inputstream.adaptive.license_type="):
            item["license"] = {"type": line.split("=", 1)[1]}

        elif line.startswith("#KODIPROP:inputstream.adaptive.license_key="):
            license_key = line.split("=", 1)[1]
            if "license" not in item:
                item["license"] = {"type": "clearkey"}  # default type
            if ":" in license_key:
                keyid, key = license_key.split(":", 1)
                item["license"]["keyid"] = keyid.strip()
                item["license"]["key"] = key.strip()
            else:
                item["license"]["key"] = license_key.strip()  # fallback

        elif line.startswith("#EXTVLCOPT:http-user-agent="):
            if "headers" not in item:
                item["headers"] = {}
            item["headers"]["user-agent"] = line.split("=", 1)[1].strip()

        elif line.startswith("#EXTHTTP:"):
            continue  # Skip for now

        elif line.startswith("http"):
            item["url"] = line.strip()
            result.append(item)
            item = {}

    return result

if __name__ == "__main__":
    with open("data.txt", "r", encoding="utf-8") as f:
        m3u_data = f.read()

    json_data = parse_m3u_to_json(m3u_data)

    with open("channels.json", "w", encoding="utf-8") as f:
        json.dump(json_data, f, indent=2)

    print("✅ Converted to channels.json with key/keyid support")
