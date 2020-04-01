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
