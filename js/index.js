(async () => {
    const { loggedIn, user } = await checkLogin();
    $(function() {
        const $root = $('#root');
        if (loggedIn) {
        } else {
        }
        $('nav').load('./html/navigation.html', function() {
            if (loggedIn) {
                $('nav').append('<input type="button" value="Log Out" id="logout"/>');
                $root.on('click', '#logout', function() {
                    logout();
                    location.reload();
                });
            }
        });
    })
})();