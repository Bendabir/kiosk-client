const player = {
    id: null,
    displayName: null,
    type: null,
    muted: true,
    volume: 1.0,
    brightness: 1.0,
    iframe: document.querySelector("iframe#player"),
    icons: new Map([

    ]),
    get url() {
        return this.iframe.src;
    },
    /** Set the object value and setup the data in the DOM.
     */
    setup(id, displayName, type, muted, volume, brightness) {
        // Set the object values and
        this.type = type;

        // These helpers process some DOM modifications as well
        this.setID(id);
        this.setDisplayName(displayName);
        this.setBrightness(brightness);
        this.toggleMute(muted);
        this.setVolume(volume);

        this.setWindowTitle(displayName);
    },
    reset() {
        this.display(null);
        this.setDisplayName(null);
        this.setBrightness(1.0);
        this.type = null;
        this.muted = true;
        this.volume = 1.0;
    },
    setID(id, show = false) {
        this.id = id;
        document.querySelector("#screen-id").innerText = id;

        if (show) {
            this.identify();
        }
    },
    setDisplayName(displayName, show = false) {
        this.displayName = displayName;
        document.querySelector("#content-title").innerText = displayName;

        if (show) {
            // TODO
        }
    },
    setContentType(type) {
        this.type = type;
    },
    setWindowTitle(status) {
        document.title = `TV ${this.id} - ${status}`;
    },
    identify(duration = 5000) {
        // Show the TV ID on the bottom left corner
        const el = document.querySelector("#screen-id");
        el.classList.replace("fade-out", "fade-in");

        setTimeout(() => {
            el.classList.replace("fade-in", "fade-out");
        }, duration);
    },
    showIcon(name, duration = 3000) {
        const el = document.querySelector("#action-icon");
        el.classList.replace("fade-out", "fade-in");

        el.querySelector(".material-icons").textContent = name;

        setTimeout(() => {
            el.classList.replace("fade-in", "fade-out");
        }, duration);
    },
    display(url) {
        this.iframe.src = url;
    },
    reload() {
        this.iframe.src = this.iframe.src;
    },
    setBrightness(brightness, iconize = false) {
        // Update the local value
        this.brightness = Math.max(Math.min(brightness, 1.0), 0.05);

        document.querySelector("#brightness").style.opacity = 1.0 - this.brightness;

        // Display an icon on the screen if we want
        // It depends on the value
        if (iconize) {
            if (this.brightness > 0.66) {
                this.showIcon("brightness_high");
            } else if (this.brightness < 0.33) {
                this.showIcon("brightness_low");
            } else {
                this.showIcon("brightness_medium");
            }
        }
    },
    toggleMute(muted, iconize = false) {
        this.muted = muted;

        switch(this.type) {
            case ContentType.VIDEO: {
                this.iframe.contentWindow.postMessage({
                    object: "toggle_mute",
                    data: {
                        muted: this.muted
                    }
                }, "*");
                break;
            }
            case ContentType.YOUTUBE: {
                // Assumes the YouTube helper as been binded
                youtube.execute(this.muted ? "mute" : "unMute");
                break;
            }
            // Prevent showing icon if content is not supported
            default: return;
        }

        if (iconize) {
            this.showIcon(this.muted ? "volume_mute" : "volume_up");
        }
    },
    setVolume(volume, iconize = false) {
        const previousVolume = this.volume;
        this.volume = Math.max(Math.min(volume, 1.0), 0.0);

        switch(this.type) {
            case ContentType.VIDEO: {
                this.iframe.contentWindow.postMessage({
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
            // Prevent showing icon if content is not supported
            default: return;
        }

        if (iconize) {
            this.showIcon(this.volume < previousVolume ? "volume_down" : "volume_up");
        }
    },
    togglePlay(play, iconize = false) {
        switch(this.type) {
            case ContentType.VIDEO: {
                this.iframe.contentWindow.postMessage({
                    object: play ? "play" : "pause"
                }, "*");
                break;
            }
            case ContentType.YOUTUBE: {
                youtube.execute(play ? "playVideo" : "pauseVideo");
                break;
            }
            // Prevent showing icon if content is not supported
            default: return;
        }

        if (iconize) {
            this.showIcon(play ? "play_arrow" : "pause");
        }
    },
    forward(duration, iconize = false) {
        duration = Math.round(Math.max(0, duration));

        switch(this.type) {
            case ContentType.VIDEO: {
                this.iframe.contentWindow.postMessage({
                    object: "forward",
                    data: {
                        duration: duration / 1000
                    }
                }, "*");
                break;
            }
            case ContentType.YOUTUBE: {
                // TODO
                console.warn("Forward for YouTube videos is not supported yet.");
                return;
            }
            // Prevent showing icon if content is not supported
            default: return;
        }

        if (iconize) {
            this.showIcon("fast_forward");
        }
    },
    rewind(duration, iconize = false) {
        duration = Math.round(Math.max(0, duration));

        switch(this.type) {
            case ContentType.VIDEO: {
                this.iframe.contentWindow.postMessage({
                    object: "rewind",
                    data: {
                        duration: duration / 1000
                    }
                }, "*");
                break;
            }
            case ContentType.YOUTUBE: {
                // TODO
                console.warn("Rewind for YouTube videos is not supported yet.");
                return;
            }
            // Prevent showing icon if content is not supported
            default: return;
        }

        if (iconize) {
            this.showIcon("fast_rewind");
        }
    }
};
