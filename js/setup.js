import Race from "./race.js";

async function updateHighscore(currWPM) {
    let { loggedIn, user } = await checkLogin();

    if (loggedIn) {
        const currPlayerHighscore = await getUserHighscore();
        if (currWPM > currPlayerHighscore) {
            await updateWPM(currWPM);
            $('#hs-msg').text('New Personal Highscore!');
            // Update scoreboard
            const scores = await getHighscores();
            for (let i = 0; i < scores.length; i++) {
                $('#highscore').append(`<li>${i+1}. ${scores[i].user} - ${parseFloat(scores[i].score)} WPM</li>`);
            }
        }
    }
}

function resetRace(race) {
    race.resetRace();
    setText(race);
}

function setText(race) {
    $('#countdown').text(race.countdownTime);
    $('#timeout').text(race.timeoutTime);
    $('#wpm').text('0');
    $('#countdown-wrapper>h2').contents().get(2).nodeValue=" seconds";
    $('#timeout-wrapper>h2').contents().get(2).nodeValue=" seconds";
    loadPrompt(race)
}

function loadPrompt(race) {
    $('#completed-words').text(race.prompt.slice(0, race.currentWordPosition).join(''));
    $('#correct-chars').text(race.getCurrentWord().slice(0, race.correctChars));
    $('#incorrect-chars').text(race.getCurrentWord().slice(race.correctChars, race.currentCharPosition));
    $('#rest-chars').text(race.getCurrentWord().slice(race.currentCharPosition, race.getCurrentWord().length));
    $('#new-words').text(race.prompt.slice(race.currentWordPosition + 1, race.prompt.length).join(''));
}

function loadRace() {
    //const prompt = "A duck walked up to the lemonade stand and he said to the man";
    //const prompt = "A duck walked up to the lemonade stand and he said to the man, hey got any grapes and the man said no I don't have any grapes for you, I forgot the rest of the script but yea thats what the man said I think";
    //const prompt = 'A duck walked up to a lemonade stand and he said to the man, running the stand "Hey! (Bum bum bum) Got any grapes?" The man said "No we just sell lemonade.'
    const prompt = "COMP 426 is taught by Ketan Mayer-Patel. You may know him as your former COMP 401 professor, as the director of UNC's ACM International Collegiate Programming Contest Team, or as the Director of Undergraduate Studies here in the Computer Science department."

    let race = new Race(prompt);

    race.onCountdownTick(raceStatus => {
        $('#countdown').text(raceStatus.countdownTime);
    });
    race.onCountdownEnd(() => {
        $('#countdown').text("Start!");
        $('#countdown-wrapper').fadeOut();
        $('#grey-out').fadeOut();
        $('#countdown-wrapper>h2').contents().get(2).nodeValue="";
        $('#type-area').prop('readonly', false);
    });

    race.onTimeoutTick(raceStatus => {
        $('#timeout').text(raceStatus.timeoutTime);
        $('#wpm').text(raceStatus.wpm);
    });
    race.onTimeoutEnd(() => {
        $('#timeout').text("Race Over!");
    });

    race.onRaceEnd(raceStatus => {
        $('#wpm').text(raceStatus.wpm);
        $('#timeout-wrapper>h2').contents().get(2).nodeValue="";
        updateHighscore(raceStatus.wpm);
        $('#reset-btn-wrapper').removeClass('hidden');
    });

    setText(race);

    $('#type-area').on('input', function(e) {
        const inputWord = e.target.value;
        race.update(inputWord);
        if (race.getCurrentlyCorrect()) {
            $('#type-area').css('background-color', 'transparent');
        } else {
            $('#type-area').css('background-color', '#FF7D7D');
        }

        loadPrompt(race);
        if (race.checkInput(inputWord)) {
            $('#type-area').val(''); // clear input box
            race.update('');
        } else {
            loadPrompt(race);
        }
    });

    $('#type-area').on('keypress', function(e) {
        if (!race.raceStarted || (!race.getCurrentlyCorrect() && race.currentCharPosition + 1 > race.getCurrentWord().length)) {
            return false;
        }
    });
    $('#type-area').on('click', async function() {
        if (!race.raceStarted && race.currentWordPosition != race.prompt.length) {
            race.beginCountdown();
        }
    });

    $('#reset-btn').on('click', function() {
        resetRace(race);
        $('#reset-btn-wrapper').addClass('hidden');
        $('#countdown-wrapper').show();
        $('#grey-out').show();
    })
}

(async () => {
    let { loggedIn, user } = await checkLogin();
    $(async function() {
        if (!loggedIn) {
            $('#msg').text('You are not logged in, scores will not be uploaded');
        } else {
            $('#msg').text(`Welcome "${user}"`);
        }
        loadRace();
        const scores = await getHighscores();
        for (let i = 0; i < scores.length; i++) {
            $('#highscore').append(`<li>${i+1}. ${scores[i].user} - ${parseFloat(scores[i].score)} WPM</li>`);
        }
    });
})();