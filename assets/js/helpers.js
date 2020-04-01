const youtube = {
    _ready: false,
    binded: false,
    iframe: null,
    executionQueue: [],
    messageListener: null,
    get ready() {
        return this._ready;
    },
    set ready(value) {
        this._ready = value;

        // Execute everything that was queued
        if (this._ready) {
            while(this.executionQueue.length) {
                this.executionQueue.shift().call();
            }
        }
    },
    queue(func) {
        this.executionQueue.push(func);
    },
    bind(iframe) {
        if (this.ready) {
            return;
        }

        if (!iframe && iframe.tagName.toUpperCase() != "IFRAME") {
            console.error("Provided element is not an iFrame.");
            return;
        }

        this.binded = true;
        this.iframe = iframe;

        // Keep polling the iframe until it's ready
        const poller = setInterval(() => {
            this.iframe.contentWindow.postMessage(JSON.stringify({
                event: "listening",
                id: this.iframe.id
            }), "*");
        }, 250);

        this.messageListener = (event) => {
            if (!this.iframe || this.ready) {
                return;
            }

            if(event.source === this.iframe.contentWindow) {
                const message = JSON.parse(event.data);

                if (message.event === "onReady") {
                    this.ready = true;
                    clearInterval(poller);
                }
            }
        };

        // Listen to the player to get its state
        window.addEventListener("message", this.messageListener);
    },
    release() {
        window.removeEventListener("message", this.messageListener);

        this.ready = false;
        this.binded = false;
        this.iframe = null;
        this.executionQueue = [];
        this.messageListener = null;
    },
    execute(func, ...args) {
        if (!this.binded) {
            console.error("Please bind the object to the YouTube iFrame.");
            return;
        }

        if (!this.ready) {
            // Wait until ready
            this.queue(() => this.call(func, args));
        } else {
            // Or execute right away if possible
            this.call(func, args)
        }
    },
    call(func, ...args) {
        // Make direct call if function is provided
        if (func.call) {
            return func();
        }

        this.iframe.contentWindow.postMessage(JSON.stringify({
            "event": "command",
            "func": func,
            "args": args,
            "id": this.iframe.id
        }), "*");
    }
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
            case "volume_up": {
                icon.textContent = "volume_up";
                break;
            }
            case "volume_down": {
                icon.textContent = "volume_down";
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
    toggleMute(iframe, muted, contentType) {
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
                // Assumes the helper has been binded
                youtube.execute(muted ? "mute" : "unMute");
                break;
            }
            default: break; // Do nothing for other contents
        }
    },
    setVolume(iframe, volume, contentType) {
        switch(contentType) {
            case ContentType.VIDEO: {
                iframe.contentWindow.postMessage({
                    object: "set_volume",
                    data: {
                        volume: volume
                    }
                }, "*");
                break;
            }
            case ContentType.YOUTUBE: {
                youtube.execute("setVolume", Math.round(volume * 100));
                break;
            }
            default: break;
        }
    }
};
