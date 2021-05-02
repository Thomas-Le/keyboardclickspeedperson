import Race from "./race.js";

const prompt = "A duck walked up to the lemonade stand and he said to the man";

let testRace = new Race(prompt);

testRace.onCountdownStart(raceStatus => {
    console.log(raceStatus.countdownTime);
});

testRace.onCountdownTick(raceStatus => {
    console.log(raceStatus.countdownTime);
});

testRace.onCountdownEnd(raceStatus => {
    console.log(raceStatus.countdownTime);
});

testRace.beginCountdown();
