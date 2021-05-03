async function checkLogin() {
    let loggedIn = false;
    let username = undefined;

    await axios({
        method: 'get',
        //url: 'http://localhost:4000/login',
        url: 'https://kcsp-elsamoht.apps.cloudapps.unc.edu/login',
        withCredentials: true
    }).then(res => {
        loggedIn = res.data.message;
    }).catch(err => {
        console.log(err);
    });

    if (loggedIn) {
        await axios({
            method: 'get',
            //url: 'http://localhost:4000/home',
            url: 'https://kcsp-elsamoht.apps.cloudapps.unc.edu/home',
            withCredentials: true
        }).then(res => {
            username = res.data.username;
        }).catch(err => {
            console.log(err);
        });
    }

    return {loggedIn: loggedIn, user: username };
}