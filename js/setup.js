import Race from "./race.js";

async function checkWPM(currScore) {
    let { loggedIn, user } = await checkLogin();

    if (loggedIn){
        let score = await getUserHighscore();
        if (currScore > score) {
            await axios({
                method: 'post',
                //url: 'http://localhost:4000/score',
                url: 'https://kcsp-elsamoht.apps.cloudapps.unc.edu/score',
                withCredentials: true,
                data: {
                    score: currScore
                }
            }).then(res => {
                $('#msg').text("New Highscore!");
                getHighscores();
            }).catch(err => {
                console.log(err);
            });
        }
    }
}

async function getUserHighscore() {
    let score;
    await axios({
        method: 'get',
        //url: 'http://localhost:4000/score',
        url: 'https://kcsp-elsamoht.apps.cloudapps.unc.edu/score',
        withCredentials: true
    }).then(res => {
        score = res.data.userHighscore;
    }).catch(err => {
        console.log(err);
    });
    return score;
}

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
        checkWPM(raceStatus.wpm);
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

async function getHighscores() {
    $('#highscore').empty();
    let scores;
    await axios({
        method: 'get',
        //url: 'http://localhost:4000/highscore',
        url: 'https://kcsp-elsamoht.apps.cloudapps.unc.edu/highscore',
        withCredentials: true
    }).then(res => {
        scores = res.data;
    }).catch(err => {
        console.log(err);
    });
    for (let i = 0; i < scores.length; i++) {
        $('#highscore').append(`${i+1}. ${scores[i].user} - ${scores[i].score} WPM`);
    }
}

(async () => {
    let { loggedIn, user } = await checkLogin();
    $(function() {
        if (!loggedIn) {
            $('#msg').text('Log in to have your score go in the leaderboards!');
        }
        loadRace();
        getHighscores();
    });
})();