document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('grid-container');
    const searchBar = document.getElementById('search-bar');
    const languageFilter = document.getElementById('language-filter');
    const categoryFilter = document.getElementById('category-filter');
    const videoPlayer = document.getElementById('videoPlayer');

    let allChannels = [];

    // Load channels from data.json
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            allChannels = data.channels;
            populateFilters(allChannels);
            displayChannels(allChannels);
            searchBar.addEventListener('input', () => filterChannels());
            languageFilter.addEventListener('change', () => filterChannels());
            categoryFilter.addEventListener('change', () => filterChannels());
        })
        .catch(error => console.error('Error loading data.json:', error));

    function populateFilters(channels) {
        const languages = [...new Set(channels.map(c => c.language))];
        const categories = [...new Set(channels.map(c => c.category || c.catagory))]; // for typo

        languages.forEach(lang => {
            const opt = document.createElement('option');
            opt.value = lang;
            opt.textContent = lang;
            languageFilter.appendChild(opt);
        });

        categories.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat;
            categoryFilter.appendChild(opt);
        });
    }

    function displayChannels(channels) {
        gridContainer.innerHTML = '';
        channels.forEach(channel => {
            const item = document.createElement('div');
            item.classList.add('grid-item');
            item.innerHTML = `
                <img src="${channel.logo}" alt="${channel.name}">
                <div class="channel-name">${channel.name}</div>
            `;
            item.addEventListener('click', () => playChannel(channel));
            gridContainer.appendChild(item);
        });
    }

    function filterChannels() {
        const query = searchBar.value.toLowerCase();
        const lang = languageFilter.value;
        const cat = categoryFilter.value;

        const filtered = allChannels.filter(c =>
            c.name.toLowerCase().includes(query) &&
            (lang === '' || c.language === lang) &&
            (cat === '' || c.category === cat || c.catagory === cat)
        );

        displayChannels(filtered);
    }

    async function playChannel(channel) {
        if (!shaka.Player.isBrowserSupported()) {
            alert('Shaka Player not supported in this browser');
            return;
        }

        const player = new shaka.Player(videoPlayer);

        // Configure clearkey DRM
        if (channel.clearkey && channel.clearkey.keyId && channel.clearkey.key) {
            player.configure({
                drm: {
                    clearKeys: {
                        [channel.clearkey.keyId]: channel.clearkey.key
                    }
                }
            });
        }

        try {
            await player.load(channel.mpd); // Load .mpd link
            console.log(`Now playing: ${channel.name}`);
        } catch (err) {
            console.error('Error playing channel:', err);
            alert('Error loading stream');
        }
    }
});
