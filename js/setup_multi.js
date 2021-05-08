import Race from "./race.js";

const fillerPrompt = "Waiting for prompt from server...";
let promptSet = false;
let inRoom = false; // flag to check if client is already in a room
let roomOwner = false; // flag to check if client is owner of room
const race = new Race(fillerPrompt);

function setRaceResults(data) {
    const sortedResult = data.sort((p1, p2) => p2[1][0] - p1[1][0]);
    let place = 1;
    let prevScore = -1;
    for (let player of sortedResult) {
        // tie
        if (prevScore === player[1][0]) {
            place--;
        }
        $('#highscore').append(`<li>${place}. ${player[0]} - ${player[1][0]}WPM</li>`);
        place++;
        prevScore = player[1][0];
    }
    $('#highscore-wrapper').removeClass('hidden');
}

function setText() {
    $('#highscore').empty();
    $('highscore-wrapper').addClass('hidden');

    $(`#current-user>.user-score`).text(0);
    $(`#current-user>.user-wpm`).text(0);

    $('#countdown-wrapper').fadeIn();
    $('#grey-out').fadeIn();
    $('#countdown').text(race.countdownTime);
    $('#timeout').text(race.timeoutTime);
    $('#wpm').text('0');
    $('#countdown-wrapper>h2').contents().get(2).nodeValue=" seconds";
    $('#timeout-wrapper>h2').contents().get(2).nodeValue=" seconds";
    if (roomOwner) {
        $('#type-area').attr('placeholder', 'Click here to start the race for everyone!')
    } else {
        $('#type-area').attr('placeholder', 'Waiting for room owner to start race...')
    }
    loadPrompt()
}

function loadPrompt() {
    $('#completed-words').text(race.prompt.slice(0, race.currentWordPosition).join(''));
    $('#correct-chars').text(race.getCurrentWord().slice(0, race.correctChars));
    $('#incorrect-chars').text(race.getCurrentWord().slice(race.correctChars, race.currentCharPosition));
    $('#rest-chars').text(race.getCurrentWord().slice(race.currentCharPosition, race.getCurrentWord().length));
    $('#new-words').text(race.prompt.slice(race.currentWordPosition + 1, race.prompt.length).join(''));
}

function loadRace(socket) {
    setText();

    race.onCountdownTick(raceStatus => {
        $('#countdown').text(raceStatus.countdownTime);
    });

    race.onCountdownEnd(() => {
        $('#countdown').text("Start!");
        $('#countdown-wrapper').fadeOut();
        $('#grey-out').fadeOut();
        $('#countdown-wrapper>h2').contents().get(2).nodeValue="";
        $('#type-area').attr('placeholder', '');
    });

    race.onTimeoutTick(raceStatus => {
        $('#timeout').text(raceStatus.timeoutTime);
        $('#wpm').text(raceStatus.wpm);

        $(`#current-user>.user-score`).text(Math.round(raceStatus.percentComplete * 100) / 100);
        $(`#current-user>.user-wpm`).text(raceStatus.wpm);

        socket.emit('my-stats', [raceStatus.wpm, raceStatus.percentComplete]); // inform server of stats
    });

    race.onTimeoutEnd(() => {
        $('#timeout').text("Race Over!");
    });

    race.onRaceEnd(raceStatus => {
        $('#wpm').text(raceStatus.wpm);
        $('#timeout-wrapper>h2').contents().get(2).nodeValue="";

        $(`#current-user>.user-score`).text(Math.round(raceStatus.percentComplete * 100)/100);
        $(`#current-user>.user-wpm`).text(raceStatus.wpm);
        $('#type-area').attr('placeholder', 'Waiting for other players to finish...');

        socket.emit('my-stats', [raceStatus.wpm, raceStatus.percentComplete]);
        socket.emit('finish'); // tell server client has finished race
    });

    race.onNewPrompt(() => {
        $("#end-options-btn-wrapper").addClass('hidden');
        setText();
    });

    // Clearing just in case (bad code yessir)
    $('#type-area').off();

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
}

function clearListeners() {
    $('#create-room').off();
}

function addRoomToList(roomid, ownerName, isLocked, roomButtonName) {
    $('#room-list').append(`<div id="${roomid}-room"><button type="button" class="${roomButtonName}">Join [${ownerName}]'s Room</button></div>`);
    if (isLocked) {
        lockRoom(roomid, ownerName);
    }
}

function removeRoomFromList(roomid) {
    $(`#${roomid}-room`).remove();
}

function lockRoom(roomid, ownerName) {
    $(`#${roomid}-room>button`).prop('disabled', true);
    $(`#${roomid}-room>button`).text(`Join [${ownerName}]'s Room {Locked, race started}`);
}

function unlockRoom(roomid, ownerName) {
    $(`#${roomid}-room>button`).prop('disabled', false);
    $(`#${roomid}-room>button`).text(`Join [${ownerName}]'s Room`);
}

function addPlayerToRace(userID, username) {
    $('#race-scores').append(`<div id=${userID}-user>${username}: <span class="user-score">0</span>% <span class="user-wpm">0</span>WPM</div>`)
}

function removePlayerFromRace(userID) {
    $(`#${userID}-user`).remove();
}

function updatePlayerStats(playerID, wpm, percentComplete) {
    $(`#${playerID}-user>.user-wpm`).text(wpm);
    $(`#${playerID}-user>.user-score`).text(Math.round(percentComplete * 100) / 100);
}

function setupSocket(user) {
    const socket = io(backendURL, {
        withCredentials: true,
        query: {
            username: user
        }
    });

    const $root = $('#root');

    socket.on('disconnect', data => {
        if(!alert("You have been disconnected, try again")) {
            location.reload();
        }
    });

    // data = [roomID, owner username]
    // sent to connecting socket
    socket.on('init-rooms', data => {
        for (let roomIDUser of data) {
            // let div contain room name
            addRoomToList(roomIDUser[0], roomIDUser[1], roomIDUser[2], roomButtonName);
        }
    });

    const roomButtonName = 'room-btn';

    // data = [roomID, owner username]
    // sent to all, hence inRoom flag is used
    socket.on('add-room', data => {
        // only want to add to room list if client isn't in room
        if (!inRoom) {
            addRoomToList(data[0], data[1], data[2], roomButtonName);
        }
    });

    // data = string (roomID)
    // sent to all, hence inRoom flag is used
    socket.on('room-deleted', data => {
        if (!inRoom) {
            removeRoomFromList(data);
        }
    });

    // data = array of array [[userID, username], ...]
    // only sent to players in specific room
    socket.on('init-players', data => {
        for (let player of data) {
            addPlayerToRace(player[0], player[1]);
        }
    });

    // new player has joined [userID, username]
    // only sent to players in specific room
    socket.on('joined', data => {
        addPlayerToRace(data[0], data[1])
    });

    // only sent to players in specific room
    socket.on('owner-left', () => {
        if(!alert("Room owner has left, join another")) {
            location.reload();
        }
    });

    // data = clientID
    // only sent to players in specific room
    socket.on('player-left', data => {
        removePlayerFromRace(data);
    });

    socket.on('room-join-error', data => {
        if(!alert("Room no longer exists, try again")) {
            location.reload();
        }
    });

    socket.on('already-logged', () => {
        alert("Your account is currently already in a room, proceeding to disconnect from old room...");
    });

    // data = string (the prompt)
    socket.on('room-prompt', data => {
        promptSet = true;
        race.resetRace(data);
    });

    // owner started race
    socket.on('start-race', () => {
        $('#type-area').attr('placeholder', 'Race is starting!');
        race.beginCountdown();
    });

    // data = [owner socket.id, ownerUsername]
    socket.on('room-locked', data => {
        if (!inRoom) {
            lockRoom(data[0], data[1]);
        }
    });

    socket.on('race-end', () => {
        $('#type-area').attr('placeholder', 'Race Finished!');
        if (roomOwner) {
            $("#end-options-btn-wrapper").removeClass('hidden');
        }
    });

    socket.on('race-data', data => {
        // playerData = [player, [wpm, %complete]]
        for (let playerData of data) {
            updatePlayerStats(playerData[0], playerData[1][0], playerData[1][1])
        }
    });

    //[[player, [wpm, %complete]], ...]
    socket.on('race-results', data => {
        setRaceResults(data);
    });

    /* Testing Purpose */
    socket.on('test', () => {
        console.log('test');
    });

    socket.on('reset-race', () => {
        race.resetRace();
    });

    socket.on('new-prompt', data => {
        race.resetRace(data);
    });
    
    socket.on('room-unlocked', data => {
        if (!inRoom) {
            unlockRoom(data[0], data[1]);
        }
    });

    clearListeners();

    $('#create-room').on('click', function() {
        socket.emit('create-room', user); // create room on server
        $('#rooms-wrapper').addClass('hidden') // no longer need to see room list
        $('#race').removeClass('hidden')
        addPlayerToRace("current", user) // add ourself to race list with ID of "current-user" instead of socketID
        inRoom = true;
        roomOwner = true;
        loadRace(socket);
    });

    $root.on('click', `.${roomButtonName}`, function() {
        const roomName = $(this).parent().attr('id').slice(0, -5) // room name should be parent div's id, minus the appended '-room'
        $('#rooms-wrapper').addClass('hidden') // no longer need to see room list
        $('#race').removeClass('hidden')
        socket.emit('join-room', roomName);
        addPlayerToRace("current", user) // add ourself to race list with ID of "current-user" instead of socketID
        inRoom = true;
        loadRace(socket);
    });

    // Clicking on box to start race
    $root.on('click', '#type-area', async function() {
        // only room owner can start race, server has to set prompt, previous race should be reset
        if (!race.raceStarted && promptSet && roomOwner && race.currentWordPosition !== race.prompt.length) {
            socket.emit('owner-start-race');
            $('#type-area').attr('placeholder', '');
            race.beginCountdown();
        }
    });

    $root.on('click', '#restart-btn', function() {
        if (!race.raceStarted && roomOwner && race.currentWordPosition === race.prompt.length) {
            socket.emit('race-reset');
            race.resetRace();
        }
    });

    $root.on('click', '#new-prompt-btn', function() {
        if (!race.raceStarted && roomOwner && race.currentWordPosition === race.prompt.length) {
            socket.emit('owner-new-prompt');
        }
    });
}

(async () => {
    let { loggedIn, user } = await checkLogin();
    $(async function() {
        if (!loggedIn) {
            $('#msg').text('Please login to play multiplayer!');
        } else {
            $('#msg').text(`Welcome "${user}"`);
            $('#rooms-wrapper').removeClass('hidden');
            //$('#race').removeClass('hidden');
            setupSocket(user);
        }
    });
})();