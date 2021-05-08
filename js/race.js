export default class Race {
    constructor(textPrompt) {
        // Split prompt into array of words and add space to all elements except last
        this.prompt = textPrompt.split(" ").map((word, index, arr) => word + (index === arr.length - 1 ? '' : ' '));
        this.currentWordPosition = 0; // current word in prompt array
        this.currentCharPosition = 0;
        this.correctChars = 0;
        this.lastInput = "";
        this.listeners = {};
        this.raceStarted = false;
        this.countdownTime = 3; // sec
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
        this.raceStarted = true;
    }

    endRace() {
        this.emit("race end");
        this.raceStarted = false;
    }

    checkInput(input) {
        if (input === this.getCurrentWord()) {
            this.checkIfOver();
            return true;
        }
        return false;
    }

    update(input) {
        this.lastInput = input;
        this.currentCharPosition = this.lastInput.length;
        if (this.getCurrentlyCorrect()) {
            this.correctChars = this.lastInput.length;
        }
    }

    checkIfOver() {
        this.currentWordPosition++;
        if (this.currentWordPosition >= this.prompt.length) {
            this.timeoutTimer.stop();
            return true;
        }
        return false;
    }

    getCurrentWord() {
        const currWord = this.prompt[this.currentWordPosition];
        if (currWord === undefined) {
            return this.prompt[this.currentWordPosition - 1];
        }
        return currWord;
    }

    getCurrentlyCorrect() {
        return this.lastInput === this.getCurrentWord().slice(0, this.lastInput.length);
    }

    // ((# of char) / 5) / (elapsed time in minutes) = WPM
    getWPM() {
        let charTyped = this.prompt.slice(0, this.currentWordPosition).reduce((acc, word) => acc += word.length, 0);
        
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
        return { wpm: this.getWPM(), countdownTime: this.currentCountdown, timeoutTime: this.currentTimeout, percentComplete: (this.currentWordPosition / this.prompt.length) * 100 };
    }

    resetRace(newPrompt) {
        if (newPrompt) {
            this.prompt = newPrompt.split(" ").map((word, index, arr) => word + (index === arr.length - 1 ? '' : ' '));
        }
        this.currentWordPosition = 0; // current word in prompt array
        this.currentCharPosition = 0;
        this.correctChars = 0;
        this.lastInput = "";
        this.raceStarted = false;
        this.countdownTime = 3; // sec
        this.currentCountdown = this.countdownTime;
        this.timeoutTime = Math.round(this.calculateTimeout()); // sec, also used to calculate WPM
        this.currentTimeout = this.timeoutTime;
        this.emit("new prompt");
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

    onNewPrompt(callback) {
        this.on("new prompt", callback);
    }

    emit(event) {
        if (event in this.listeners) {
            this.listeners[event].forEach(callback => {
                callback(this.getRaceStatus());
            })
        }
    }
} 