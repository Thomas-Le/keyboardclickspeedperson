export default class Race {
    constructor(textPrompt) {
        // Split prompt into array of words and add space to all elements except last
        this.prompt = textPrompt.split(" ").map((word, index, arr) => word + (index === arr.length - 1 ? '' : ' '));
        this.currentPosition = 0; // current word in prompt array
        this.lastInput = "";
        this.listeners = {};
        this.countdownTime = 5; // sec
        this.currentCountdown = this.countdownTime;
        this.countdownTimer = new Timer({
            tick: 1,
            ontick: () => {
                this.currentCountdown--;
                this.emit("countdown tick");
            },
            onend: () => {
                this.currentCountdown--; // to get to 0
                this.emit("countdown end");
                this.startRace();
            }
        });
        this.timeoutTime = Math.round(this.calculateTimeout()); // sec, also used to calculate WPM
        this.currentTimeout = this.timeoutTime;
        this.timeoutTimer = new Timer({
            tick: 1,
            ontick: () => {
                this.currentTimeout--;
                this.emit("timeout tick");
            },
            onstop: () => {
                this.emit("timeout end");
                this.endRace();
            },
            onend: () => {
                this.currentTimeout--; // to get it to 0, for WPM calculation
                this.emit("timeout end");
                this.endRace();
            }
        });
    }

    beginCountdown() {
        this.countdownTimer.start(this.countdownTime);
    }

    startRace() {
        this.timeoutTimer.start(this.timeoutTime);
    }

    endRace() {
        this.emit("race end");
    }

    checkInput(input) {
        this.lastInput = input;
        if (input === this.getCurrentWord()) {
            this.checkIfOver();
            this.currentPosition++; // go on to next word
            return true;
        }
        return false;
    }

    checkIfOver() {
        if (this.currentPosition + 1 >= this.prompt.length) {
            this.timeoutTimer.stop();
        }
    }

    getCurrentWord() {
        return this.prompt[this.currentPosition];
    }


    // ((# of char) / 5) / (elapsed time in minutes) = WPM
    getWPM() {
        let charTyped = this.prompt.slice(0, this.currentPosition).reduce((acc, word) => acc += word.length, 0);
        
        // include into count correct characteres between current input and current word
        for (let i = 0; i < this.getCurrentWord().length; i++) {
            if (i >= this.lastInput.length) {
                break;
            } else if (this.getCurrentWord().charAt(i) === this.lastInput.charAt(i)) {
                charTyped++;
            } else {
                break;
            }
        }

        return Math.round(((charTyped / 5) / ((this.timeoutTime - this.currentTimeout) / 60)) * 100) / 100;
    }

    // Time in seconds before timeout
    // Calculated such that a minimum of 20WPM is required otherwise will timeout
    calculateTimeout() {
        const numChar = this.prompt.reduce((acc, word) => acc += word.length, 0);
        return ((numChar / 5) / 20 * 60);
    }

    getRaceStatus() {
        return { wpm: this.getWPM(), countdownTime: this.currentCountdown, timeoutTime: this.currentTimeout };
    }

    on(event, callback) {
        if (!(event in this.listeners)) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    onCountdownTick(callback) {
        this.on("countdown tick", callback);
    }

    onCountdownEnd(callback) {
        this.on("countdown end", callback);
    }

    onTimeoutTick(callback) {
        this.on("timeout tick", callback);
    }

    onTimeoutEnd(callback) {
        this.on("timeout end", callback);
    }

    onRaceStart(callback) {
        this.on("race start", callback);
    }

    onRaceEnd(callback) {
        this.on("race end", callback);
    }

    emit(event) {
        if (event in this.listeners) {
            this.listeners[event].forEach(callback => {
                callback(this.getRaceStatus());
            })
        }
    }
} 