async function logout() {
    await axios({
        method: 'post',
        //url: 'http://localhost:4000/logout',
        url: 'https://kcsp-elsamoht.apps.cloudapps.unc.edu/logout',
        withCredentials: true
    }).then(res => {
        console.log("logged out successfully");
    }).catch(err => {
        console.log("not logged in");
    });
    location.reload();
}

(async () => {
    const { loggedIn, user } = await checkLogin();

    $(function() {
        const $body = $('body');
        $('nav').load('./html/navigation.html', function() {
            if (loggedIn) {
                $('nav').append('<input type="button" value="Log Out" id="logout"/>');
                $('header').append(`<p>Logged in as ${user}</p>`)
            }
        });

        $body.on('click', '#logout', logout);
    })
})();