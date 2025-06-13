import json

# Step 1: Read token from get.txt
with open("get.txt", "r") as f:
    token = f.read().strip()

# Step 2: Load the channels.json
with open("channels.json", "r") as f:
    channels = json.load(f)

# Step 3: Update the URL field by appending the cookie
for channel in channels:
    if "url" in channel and not "|cookie=" in channel["url"]:
        channel["url"] = f'{channel["url"]}|cookie="{token}"'

# Step 4: Save the updated channels.json
with open("channels.json", "w") as f:
    json.dump(channels, f, indent=2)

print("✅ channels.json updated with cookie in URL format.")
