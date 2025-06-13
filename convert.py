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
            if "url" in item:
                print("✅ Saving previous channel:", item.get("tvg-name"))
                result.append(item)
                item = {}

            attrs = dict(re.findall(r'(\w+?)="(.*?)"', line))
            title = line.split(",")[-1].strip()

            print("📺 Found EXTINF:", title)
            item = {
                "tvg-id": attrs.get("tvg-id", ""),
                "tvg-name": attrs.get("tvg-name", title),
                "tvg-logo": attrs.get("tvg-logo", ""),
                "group-title": attrs.get("group-title", ""),
                "group-logo": attrs.get("group-logo", ""),
                "name": format_name_variants(title)["name"]
            }

        elif line.startswith("#KODIPROP:inputstream.adaptive.license_type="):
            item.setdefault("license", {})["type"] = line.split("=", 1)[1]

        elif line.startswith("#KODIPROP:inputstream.adaptive.license_key="):
            license_key = line.split("=", 1)[1]
            item.setdefault("license", {})
            if "keyid=" in license_key and "&key=" in license_key:
                keyid_match = re.search(r'keyid=([^&]+)', license_key)
                key_match = re.search(r'key=([^&]+)', license_key)
                if keyid_match and key_match:
                    item["license"]["keyid"] = keyid_match.group(1)
                    item["license"]["key"] = key_match.group(1)
            else:
                item["license"]["key"] = license_key

        elif line.startswith("#EXTHTTP:"):
            try:
                headers = json.loads(line[len("#EXTHTTP:"):])
                headers.pop("cookie", None)
                item["headers"] = headers
            except json.JSONDecodeError as e:
                print("❌ JSON decode failed in EXTHTTP:", e)

        elif line.startswith("http"):
            item["url"] = line
            print("🌐 Found URL:", line)

    if "url" in item:
        print("✅ Saving last channel:", item.get("tvg-name"))
        result.append(item)

    print(f"\n🔢 Total parsed channels: {len(result)}")
    return result

if __name__ == "__main__":
    with open("data.txt", "r", encoding="utf-8") as f:
        m3u_data = f.read()

    json_data = parse_m3u_to_json(m3u_data)

    with open("channels.json", "w", encoding="utf-8") as f:
        json.dump(json_data, f, indent=2)

    if not json_data:
        print("⚠️ No channels found. Check #EXTINF and http lines in your data.txt")
    else:
        print("✅ channels.json created successfully.")
