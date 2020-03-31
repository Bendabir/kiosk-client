// TODO : Rewrite this with TypeScript ?
// TODO : Perhaps this should be bundled as a WPA
const SERVER_URL = `http://${config.SERVER_HOST}:${config.SERVER_PORT}`;
const socket = io(SERVER_URL);

const iframe = document.querySelector("iframe#player");
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id") || "default";

helpers.setID(id);
helpers.setWindowTitle(id, "Waiting for connection...");

socket.on(BuiltInEvents.CONNECT, () => {
    socket.emit(KioskEvents.REGISTER, {
        id: id,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        machine: window.navigator.userAgent,
        version: config.VERSION
    });
});

socket.on(KioskEvents.EXCEPTION, (err) => {
    iframe.src = `${SERVER_URL}/contents/error/${err.code}`;

    if (err.message) {
        iframe.src += `?details=${encodeURIComponent(err.message)}`;
    }

    helpers.setWindowTitle(id, err.reason);
});

socket.on(KioskEvents.INIT, (payload) => {
    iframe.src = payload.content.uri;

    helpers.setWindowTitle(id);
    helpers.setTitle(payload.content.displayName);
    helpers.setBrightness(payload.tv.brightness);
});

socket.on(KioskEvents.DISPLAY, (payload) => {
    iframe.src = payload.content.uri;

    helpers.setWindowTitle(id);
    helpers.setTitle(payload.content.displayName);
});

socket.on(BuiltInEvents.CONNECT_ERROR, () => {
    const ERROR_CONTENT = "contents/error.html";

    // This event occurs multiple times
    if (!iframe.src.endsWith(ERROR_CONTENT)) {
        iframe.src = ERROR_CONTENT;
        helpers.setWindowTitle(id, "Waiting for connection...");
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
