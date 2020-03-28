// TODO : Rewrite this with TypeScript ?
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
    EXCEPTION: "exception",
    DISPLAY: "display",
    IDENTIFY: "identify",
    REGISTER: "register",
    RELOAD: "reload"
};

const helpers = {
    setID(id) {
        document.querySelector("#tv-id").innerText = id;
    },
    setTitle(id, status) {
        if (status) {
            document.title = `TV ${id} - ${status}`;
        } else {
            document.title = `TV ${id}`;
        }
    },
    showID(duration = 5000) {
        const el = document.querySelector("#tv-id");
        el.className = "fade-in";

        setTimeout(() => {
            el.className = "fade-out";
        }, duration);
    }
};

const SERVER_URL = `http://${config.SERVER_HOST}:${config.SERVER_PORT}`;
const socket = io(SERVER_URL);

const iframe = document.querySelector("iframe#player");
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id") || "default";

helpers.setID(id);
helpers.setTitle(id, "Waiting for connection...");

socket.on(BuiltInEvents.CONNECT, () => {
    socket.emit(KioskEvents.REGISTER, {
        id: id,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        machine: window.navigator.platform,
        version: config.VERSION
    });
});

socket.on(KioskEvents.EXCEPTION, (err) => {
    iframe.src = `${SERVER_URL}/contents/error/${err.code}`;

    if (err.message) {
        iframe.src += `?details=${encodeURIComponent(err.message)}`;
    }

    helpers.setTitle(id, err.reason);
});

socket.on(KioskEvents.DISPLAY, (payload) => {
    iframe.src = payload.uri;
    helpers.setTitle(id);
});

socket.on(BuiltInEvents.CONNECT_ERROR, () => {
    const ERROR_CONTENT = "contents/error.html";

    // This event occurs multiple times
    if (!iframe.src.endsWith(ERROR_CONTENT)) {
        iframe.src = ERROR_CONTENT;
        helpers.setTitle(id, "Waiting for connection...");
    }
});

socket.on(KioskEvents.IDENTIFY, (payload) => {
    helpers.showID(payload.duration);
});

socket.on(KioskEvents.RELOAD, () => {
    window.location.reload();
});
