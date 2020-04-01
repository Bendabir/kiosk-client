// TODO : Rewrite this with TypeScript ?
// TODO : Perhaps this should be bundled as a WPA
if (!config.hasBeenConfigured) {
    // Show the settings panel
    config.showPanel();
} else {
    // Load the config from the local storage
    config.load();
    config.hidePanel();

    // Set up some basics on the screen
    player.setID(config.screenID, true);
    player.setWindowTitle("Waiting for connection...");

    // Connecting to the WebSocket server and define behavior
    const socket = io(config.serverURL);

    socket.on(BuiltInEvents.CONNECT, () => {
        socket.emit(KioskEvents.REGISTER, {
            id: player.id,
            screenSize: `${window.innerWidth}x${window.innerHeight}`,
            machine: window.navigator.userAgent,
            version: config.VERSION
        });
    });

    socket.on(KioskEvents.EXCEPTION, (err) => {
        let url = `${config.serverURL}/contents/error/${err.code}`;

        if (err.message) {
            url += `?details=${encodeURIComponent(err.message)}`;
        }

        player.reset();
        player.display(url);
        player.setWindowTitle(err.reason);
    });

    socket.on(KioskEvents.INIT, (payload) => {
        player.setContentType(payload.content.type);

        // If we have a YouTube content, we need to bind our helper on it
        if (player.type === ContentType.YOUTUBE) {
            youtube.bind(player.iframe);
        }

        player.setWindowTitle(payload.content.displayName);
        player.setDisplayName(payload.content.displayName);
        player.setBrightness(payload.tv.brightness);
        player.toggleMute(payload.tv.muted);
        player.setVolume(payload.tv.volume);
        player.display(payload.content.uri);
        player.identify();
    });

    socket.on(KioskEvents.DISPLAY, (payload) => {
        // Release the helper and bind alter on if needed
        youtube.release();

        player.setContentType(payload.content.type);

        if (player.type === ContentType.YOUTUBE) {
            youtube.bind(player.iframe);
        }

        player.setWindowTitle(payload.content.displayName);
        player.setDisplayName(payload.content.displayName);
        player.display(payload.content.uri);
    });

    socket.on(BuiltInEvents.CONNECT_ERROR, () => {
        player.reset();

        const errorContent = "contents/error.html";

        // This event occurs multiple times
        if (!player.url.endsWith(errorContent)) {
            player.setWindowTitle("Waiting for connection...");
            player.display(errorContent);
        }
    });

    socket.on(KioskEvents.IDENTIFY, (payload) => {
        player.identify(payload.duration);
    });

    socket.on(KioskEvents.RELOAD, player.reload.bind(player));

    socket.on(KioskEvents.BRIGHTNESS, (payload) => {
        // Show the icons
        player.setBrightness(payload.brightness, true);
    });

    socket.on(KioskEvents.TOGGLE_MUTE, (payload) => {
        // Show the icons
        player.toggleMute(payload.muted, true);
    });

    socket.on(KioskEvents.VOLUME, (payload) => {
        // Show the icons
        player.setVolume(payload.volume, true);
    });
}
