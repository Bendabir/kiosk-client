// TODO : Rewrite this with TypeScript ?
// TODO : Perhaps this should be bundled as a WPA
const BuiltInEvents = {
    CONNECT: "connect",
    CONNECTING: "connecting",
    DISCONNECT: "disconnect",
    CONNECT_FAILED: "connect_failed",
    ERROR: "error",
    MESSAGE: "message",
    RECONNECT: "reconnect",
    RECONNECTING: "reconnecting",
    RECONNECT_FAILED: "reconnect_failed",
    CONNECT_ERROR: "connect_error"
};

const KioskEvents = {
    INIT: "kiosk_init",
    EXCEPTION: "kiosk_exception",
    DISPLAY: "kiosk_display",
    IDENTIFY: "kiosk_identify",
    REGISTER: "kiosk_register",
    RELOAD: "kiosk_reload",
    BRIGHTNESS: "kiosk_brightness",
    TOGGLE_MUTE: "kiosk_toggle_mute"
};

const ContentType = {
    IMAGE: "image",
    TEXT: "text",
    VIDEO: "video",
    WEBPAGE: "webpage",
    YOUTUBE: "youtube",
    PLAYLIST: "playlist"
};

const helpers = {
    setID(id) {
        document.querySelector("#tv-id").innerText = id;
    },
    setTitle(title) {
        document.querySelector("#content-title").innerText = title;
    },
    setWindowTitle(id, status) {
        if (status) {
            document.title = `TV ${id} - ${status}`;
        } else {
            document.title = `TV ${id}`;
        }
    },
    showID(duration = 5000) {
        const el = document.querySelector("#tv-id");
        el.classList.replace("fade-out", "fade-in");

        setTimeout(() => {
            el.classList.replace("fade-in", "fade-out");
        }, duration);
    },
    showIcon(action, duration = 1000) {
        const el = document.querySelector("#action-icon");
        el.classList.replace("fade-out", "fade-in");

        const icon = el.querySelector(".material-icons");

        switch(action) {
            case "play": {
                icon.textContent = "play_arrow";
                break;
            }
            case "pause": {
                icon.textContent = "pause";
                break;
            }
            case "mute": {
                icon.textContent = "volume_mute";
                break;
            }
            case "unmute": {
                icon.textContent = "volume_up";
                break;
            }
            case "forward": {
                icon.textContent = "forward_5";
                // icon.textContent = "fast_forward";
                break;
            }
            case "rewind": {
                icon.textContent = "replay_5";
                // icon.textContent = "fast_rewind";
                break;
            }
            case "high_brightness": {
                icon.textContent = "brightness_high";
                break;
            }
            case "medium_brightness": {
                icon.textContent = "brightness_medium";
                break;
            }
            case "low_brightness": {
                icon.textContent = "brightness_low";
                break;
            }
        }

        setTimeout(() => {
            el.classList.replace("fade-in", "fade-out");
        }, duration);
    },
    setBrightness(brightness) {
        const cappedBrightness = Math.max(Math.min(brightness, 1.0), 0.05);

        document.querySelector("#brightness").style.opacity = 1.0 - cappedBrightness;
    },
    toggleMute(muted, contentType) {
        // The way we mute/unmute a screen depends on the inner content
        switch(contentType) {
            case ContentType.VIDEO: {
                iframe.contentWindow.postMessage({
                    object: "toggle_mute",
                    data: {
                        muted: muted
                    }
                }, "*");
                break;
            }
            case ContentType.YOUTUBE: {
                break;
            }
            default: break; // Do nothing for other contents
        }
    }
};

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
