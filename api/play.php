<?php
$channelId = $_GET['c'];
$channelsData = json_decode(file_get_contents('data.json'), true);
$selectedChannel = null;

foreach ($channelsData as $channel) {
    if ($channel['channel_name'] == $channelId) {
        $selectedChannel = $channel;
        break;
    }
}

if (!$selectedChannel) {
    echo 'Error: Invalid channel ID';
    exit;
}

$videoUrl = $selectedChannel['url'];
$logoUrl = $selectedChannel['logo'];
$videoTitle = $selectedChannel['channel_name'];
?>

<html>
<head>
    <title>Tvtelugu</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1.0,user-scalable=no"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
    <link rel="shortcut icon" type="image/x-icon" href="https://raw.githubusercontent.com/tvtelugu/play/main/images/TVtelugu.ico">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/plyr@3.6.2/dist/plyr.css" />
    <script src="https://cdn.jsdelivr.net/npm/plyr@3.6.12/dist/plyr.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/hls.js@1.1.4/dist/hls.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/dashjs@3.1.0/dist/dash.all.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js"></script>
    <style>
        /* Your existing styles */
    </style>
</head>
<body>

<div id="loading" class="loading">
    <div class="loading-text">
        <b>
            <span class="loading-text-words">T</span>
            <span class="loading-text-words">V</span>
            <span class="loading-text-words">T</span>
            <span class="loading-text-words">E</span>
            <span class="loading-text-words">L</span>
            <span class="loading-text-words">U</span>
            <span class="loading-text-words">G</span>
            <span class="loading-text-words">U</span>
        </b>
    </div>
</div>

<video id="player" autoplay controls crossorigin poster="https://raw.githubusercontent.com/tvtelugu/play/main/images/TVtelugu.ico" playsinline>
    <!-- Video source will be dynamically injected by JavaScript -->
</video>

<script>
    setTimeout(videovisible, 3000);

    function videovisible() {
        document.getElementById('loading').style.display = 'none';
    }

    document.addEventListener("DOMContentLoaded", () => {
        const videoElement = document.querySelector("video");
        const videoUrl = "<?php echo $videoUrl; ?>";
        const isMpd = videoUrl.toLowerCase().endsWith('.mpd'); // Check if it's an MPD (DASH) file

        // If it's an MPD (DASH) file
        if (isMpd) {
            // Using dash.js to handle MPD streaming
            const player = dashjs.MediaPlayer().create();
            player.initialize(videoElement, videoUrl, true); // Initialize DASH player

            player.on('error', function(event) {
                console.error("Error loading DASH stream: ", event);
                alert("Error loading DASH stream.");
            });
        }
        // If it's an HLS stream (M3U8)
        else if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(videoUrl);

            hls.on(Hls.Events.MANIFEST_PARSED, function() {
                const qualityOptions = hls.levels.map(level => level.height);
                const plyrOptions = {
                    quality: {
                        default: qualityOptions[0],
                        options: qualityOptions,
                        forced: true,
                        onChange: (quality) => {
                            hls.levels.forEach((level, index) => {
                                if (level.height === quality) {
                                    hls.currentLevel = index;
                                }
                            });
                        }
                    }
                };
                new Plyr(videoElement, plyrOptions);
            });

            hls.on(Hls.Events.ERROR, function(event, data) {
                if (data.fatal) {
                    console.error("HLS.js error: ", data);
                    alert("Error loading HLS stream.");
                }
            });

            hls.attachMedia(videoElement);
            window.hls = hls;
        } else {
            console.error("Neither HLS.js nor Dash.js is supported");
            alert("Error: Stream type not supported in this browser.");
        }
    });
</script>

</body>
</html>
