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
    const socket = io(config.serverURL, {
        query: {
            key: config.CLIENT_KEY
        }
    });

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
        player.toggleDisplayName(false);
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
        player.toggleDisplayName(payload.tv.showTitle);
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

    const reset = () => {
        const errorContent = "contents/error.html";

        // This event occurs multiple times
        if (!player.url.endsWith(errorContent)) {
            player.reset();
            player.setWindowTitle("Waiting for connection...");
            player.toggleDisplayName(false);
            player.display(errorContent);
        }
    };

    socket.on(BuiltInEvents.ERROR, (err) => {
        // Handle authentication error
        // Could but cleaner I guess
        if (err === "E006") {
            const message = "Please reconfigure your client.";
            let url = `${config.serverURL}/contents/error/E006?details=${encodeURIComponent(message)}`;

            player.reset();
            player.display(url);
            player.setWindowTitle("Authentication failed");
            player.toggleDisplayName(false);
        }
    });

    socket.on(BuiltInEvents.CONNECT_ERROR, reset);
    socket.on(BuiltInEvents.DISCONNECT, () => {
        reset();

        // Try to reconnect to the server after a while
        setTimeout(() => socket.open(), 10000);
    });

    socket.on(KioskEvents.IDENTIFY, (payload) => {
        player.identify(payload.duration);
    });

    socket.on(KioskEvents.SHOW_TITLE, (payload) => {
        player.toggleDisplayName(payload.show);
    });

    socket.on(KioskEvents.RELOAD, player.reload.bind(player));

    socket.on(KioskEvents.BRIGHTNESS, (payload) => {
        // Show the icons
        player.setBrightness(payload.brightness, true);
    });

    socket.on(KioskEvents.MUTE, (payload) => {
        // Show the icons
        player.toggleMute(payload.muted, true);
    });

    socket.on(KioskEvents.VOLUME, (payload) => {
        // Show the icons
        player.setVolume(payload.volume, true);
    });

    socket.on(KioskEvents.PLAY, (payload) => {
        // Show the icons
        player.togglePlay(payload.play, true);
    });

    socket.on(KioskEvents.FORWARD, (payload) => {
        // Show the icons
        player.forward(payload.duration, true);
    });

    socket.on(KioskEvents.REWIND, (payload) => {
        // Show the icons
        player.rewind(payload.duration, true);
    });
}
