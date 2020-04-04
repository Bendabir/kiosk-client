const config = {
    SCREEN_ID: "default",
    SERVER_HOST: "localhost",
    SERVER_PORT: 5000,
    CLIENT_KEY: null,
    VERSION: "3.0.0",
    actualScreenID: null,
    load() {
        this.SCREEN_ID = window.localStorage.getItem("screen_id");
        this.SERVER_HOST = window.localStorage.getItem("server_host");
        this.SERVER_PORT = parseInt(window.localStorage.getItem("server_port"));
        this.CLIENT_KEY = window.localStorage.getItem("client_key");
    },
    get hasBeenConfigured() {
        const screenID = window.localStorage.getItem("screen_id");
        const host = window.localStorage.getItem("server_host");
        const port = window.localStorage.getItem("server_port");

        return screenID !== null && host !== null && port !== null;
    },
    configure(screenID, serverHost, serverPort, clientKey) {
        this.SCREEN_ID = screenID || "default";
        this.SERVER_HOST = serverHost || "localhost";
        this.SERVER_PORT = parseInt(serverPort) || 5000;

        window.localStorage.setItem("screen_id", this.SCREEN_ID);
        window.localStorage.setItem("server_host", this.SERVER_HOST);
        window.localStorage.setItem("server_port", this.SERVER_PORT);

        if (!clientKey) {
            this.CLIENT_KEY = null;
        } else {
            this.CLIENT_KEY = clientKey;

            window.localStorage.setItem("client_key", this.CLIENT_KEY);
        }
    },
    clear() {
        window.localStorage.clear();
        window.location.reload();
    },
    get serverURL() {
        return `http://${this.SERVER_HOST}:${this.SERVER_PORT}`;
    },
    showPanel() {
        // Pre-fill some parameters
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get("id");

        if (id) {
            document.querySelector("#tv-id").value = id;
        }

        document.querySelector("#settings").style.display = "block";
    },
    hidePanel() {
        document.querySelector("#settings").style.display = "none";
    },
    get screenID() {
        // Make the ID query parameter to have the priority over the config
        // Therefore, we could have several screens on the same machine
        // Caching to avoid parsing each time
        if (!this.actualScreenID) {
            const urlParams = new URLSearchParams(window.location.search);
            const id = urlParams.get("id");

            if (id) {
                this.actualScreenID = id;
            } else {
                this.actualScreenID = this.SCREEN_ID;
            }
        }

        return this.actualScreenID;
    }
};

document.querySelector("#ok-button").addEventListener("click", () => {
    const id = document.querySelector("#tv-id").value;
    const host = document.querySelector("#server-host").value;
    const port = document.querySelector("#server-port").value;
    const clientKey = document.querySelector("#client-key").value;

    config.configure(id, host, port, clientKey);

    // Finally, reload the page
    window.location.reload();
});
