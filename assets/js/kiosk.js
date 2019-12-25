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
    REGISTER: "register"
};

const SERVER_HOST = "localhost";
const SERVER_PORT = 5000;
const VERSION = "3.0.0";

const socket = io(`http://${SERVER_HOST}:${SERVER_PORT}`);

const iframe = document.querySelector("iframe#player");
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id") || "default";

const setID = (id) => {
    document.querySelector("#tv-id").innerText = id;
};
const setTitle = (id, status) => {
    if (status) {
        document.title = `TV ${id} - ${status}`;
    } else {
        document.title = `TV ${id}`;
    }
};
const showID = (duration = 5000) => {
    const el = document.querySelector("#tv-id");
    el.className = "fade-in";

    setTimeout(() => {
        el.className = "fade-out";
    }, duration);
};

setID(id);
setTitle(id, "Waiting for connection...");

socket.on(BuiltInEvents.CONNECT, () => {
    socket.emit(KioskEvents.REGISTER, {
        id: id,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        machine: window.navigator.userAgent,
        version: VERSION
    });
});

socket.on(KioskEvents.EXCEPTION, (err) => {
    iframe.src = `http://${SERVER_HOST}:${SERVER_PORT}/contents/error/${err.code}`;

    if (err.message) {
        iframe.src += `?details=${encodeURIComponent(err.message)}`;
    }

    setTitle(id, err.reason);
});

socket.on(KioskEvents.DISPLAY, (payload) => {
    iframe.src = payload.uri;
    setTitle(id);
});

socket.on(BuiltInEvents.CONNECT_ERROR, () => {
    const ERROR_CONTENT = "contents/error.html";

    // This event occurs multiple times
    if (!iframe.src.endsWith(ERROR_CONTENT)) {
        iframe.src = ERROR_CONTENT;
        setTitle(id, "Waiting for connection...");
    }
});

socket.on(KioskEvents.IDENTIFY, (payload) => {
    showID(payload.duration);
});
