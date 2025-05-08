fetch("https://allinonereborn.com/zee5/channels199.json")
  .then(res => res.json())
  .then(data => {
    const grid = document.getElementById("channel-grid");

    data.forEach(channel => {
      const card = document.createElement("div");
      card.className = "channel-card";
      card.innerHTML = `
        <img class="channel-logo" src="${channel.logo}" alt="${channel.name}" />
        <p>${channel.name}</p>
      `;
      card.onclick = () => {
        const params = new URLSearchParams({
          name: channel.name,
          mpd: channel.mpd,
          keyId: Object.keys(channel.key)[0],
          key: Object.values(channel.key)[0],
        });
        window.location.href = `player.html?${params.toString()}`;
      };
      grid.appendChild(card);
    });
  });
