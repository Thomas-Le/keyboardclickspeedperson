//const backendURL = 'https://kcsp-elsamoht.apps.cloudapps.unc.edu';
const backendURL = 'http://localhost:4000'

async function registerUser(username, email, password, passwordConfirmation) {
    try {
        await axios({
            method: 'post',
            url: `${backendURL}/register`,
            withCredentials: true,
            data: {
                email: email,
                username: username,
                password: password,
                passwordConfirmation: passwordConfirmation
            }
        });
        return "success";
    } catch (err) {
        return err.response.data.message;
    }
}

async function loginUser(email, password) {
    try {
        await axios({
            method: 'post',
            url: `${backendURL}/login`,
            withCredentials: true,
            data: {
                email: email,
                password: password
            }
        });
        return "success";
    } catch (err) {
        return err.response.data.message;
    }
}

async function logout() {
    await axios({
        method: 'post',
            url: `${backendURL}/logout`,
        withCredentials: true
    }).then(res => {
        console.log("logged out successfully");
    }).catch(err => {
        console.log("not logged in");
    });
    location.reload();
}

async function checkLogin() {
    let loggedIn = false;
    let username = undefined;

    await axios({
        method: 'get',
            url: `${backendURL}/login`,
        withCredentials: true
    }).then(res => {
        loggedIn = res.data.message;
    }).catch(err => {
        console.log(err);
    });

    if (loggedIn) {
        await axios({
            method: 'get',
            url: `${backendURL}/home`,
            withCredentials: true
        }).then(res => {
            username = res.data.username;
        }).catch(err => {
            console.log(err);
        });
    }

    return {loggedIn: loggedIn, user: username };
}


async function updateWPM(newWPM) {
    let { loggedIn, user } = await checkLogin();

    if (loggedIn){
        await axios({
            method: 'post',
            url: `${backendURL}/score`,
            withCredentials: true,
            data: {
                score: newWPM
            }
        });
    }
}

async function getUserHighscore() {
    let score;
    await axios({
        method: 'get',
        url: `${backendURL}/score`,
        withCredentials: true
    }).then(res => {
        score = res.data.userHighscore;
    }).catch(err => {
        console.log(err);
    });
    return score;
}

async function getHighscores() {
    $('#highscore').empty();
    let scores;
    await axios({
        method: 'get',
        url: `${backendURL}/highscore`,
        withCredentials: true
    }).then(res => {
        scores = res.data;
    }).catch(err => {
        console.log(err);
    });
    return scores;
}
