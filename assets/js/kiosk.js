// TODO : Rewrite this with TypeScript ?
// TODO : Perhaps this should be bundled as a WPA
if (!config.hasBeenConfigured) {
    // Show the settings panel
    config.showPanel();
} else {
    config.load(); // Load the config from localStorage
    config.hidePanel();

    const socket = io(config.serverURL);
    const iframe = document.querySelector("iframe#player");

    helpers.setID(config.screenID);
    helpers.setWindowTitle(config.screenID, "Waiting for connection...");

    socket.on(BuiltInEvents.CONNECT, () => {
        socket.emit(KioskEvents.REGISTER, {
            id: config.screenID,
            screenSize: `${window.innerWidth}x${window.innerHeight}`,
            machine: window.navigator.userAgent,
            version: config.VERSION
        });
    });

    socket.on(KioskEvents.EXCEPTION, (err) => {
        iframe.src = `${config.serverURL}/contents/error/${err.code}`;

        if (err.message) {
            iframe.src += `?details=${encodeURIComponent(err.message)}`;
        }

        helpers.setWindowTitle(config.screenID, err.reason);
    });

    socket.on(KioskEvents.INIT, (payload) => {
        iframe.src = payload.content.uri;

        helpers.setWindowTitle(config.screenID);
        helpers.setTitle(payload.content.displayName);
        helpers.setBrightness(payload.tv.brightness);
    });

    socket.on(KioskEvents.DISPLAY, (payload) => {
        iframe.src = payload.content.uri;

        helpers.setWindowTitle(config.screenID);
        helpers.setTitle(payload.content.displayName);
    });

    socket.on(BuiltInEvents.CONNECT_ERROR, () => {
        const ERROR_CONTENT = "contents/error.html";

        // This event occurs multiple times
        if (!iframe.src.endsWith(ERROR_CONTENT)) {
            iframe.src = ERROR_CONTENT;
            helpers.setWindowTitle(config.screenID, "Waiting for connection...");
        }

        helpers.setBrightness(1);
    });

    socket.on(KioskEvents.IDENTIFY, (payload) => {
        helpers.showID(payload.duration);
    });

    socket.on(KioskEvents.RELOAD, () => {
        iframe.src = iframe.src;
    });

    socket.on(KioskEvents.BRIGHTNESS, (payload) => {
        if (payload.brightness > 0.66) {
            helpers.showIcon("high_brightness");
        } else if (payload.brightness < 0.33) {
            helpers.showIcon("low_brightness");
        } else {
            helpers.showIcon("medium_brightness");
        }

        helpers.setBrightness(payload.brightness);
    });

    socket.on(KioskEvents.TOGGLE_MUTE, (payload) => {
        helpers.showIcon(payload.muted ? "mute" : "unmute");
        helpers.toggleMute(payload.muted, payload.type);
    });
}
