import Race from "./race.js";

function loadRace() {
    const prompt = "A duck walked up to the lemonade stand and he said to the man";
    let race = new Race(prompt);

    race.onCountdownTick(raceStatus => {
        $('#countdown').text(raceStatus.countdownTime);
    });
    race.onCountdownEnd(() => {
        $('#countdown').text("Start!");
        $('#type-area').prop('readonly', false);
    });

    race.onTimeoutTick(raceStatus => {
        $('#timeout').text(raceStatus.timeoutTime);
        $('#wpm').text(raceStatus.wpm);
    });
    race.onTimeoutEnd(() => {
        $('#timeout').text("Race Over!");
        $('#type-area').prop('readonly', true);
    });

    race.onRaceEnd(raceStatus => {
        $('#wpm').text(raceStatus.wpm);
    });

    $('#countdown').text(race.countdownTime);
    $('#timeout').text(race.timeoutTime);
    $('#current-word').text(race.getCurrentWord());
    $('#type-area').on('input', function(e) {
        if (race.checkInput(e.target.value)) {
            $('#current-word').text(race.getCurrentWord()); // get new word
            $('#type-area').val(''); // clear input box
        }
    });
    $('#start-btn').on('click', function() {
        race.beginCountdown();
    });
}

$(function() {
    loadRace();
});