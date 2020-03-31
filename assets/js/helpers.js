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
