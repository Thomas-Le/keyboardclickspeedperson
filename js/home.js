(async () => {
    let { loggedIn, user } = await checkLogin();
    $(function() {
        const $root = $('#root');
        if (loggedIn) {
            const loginMsg = $root.find('#login-message');
            loginMsg.text(`Welcome `);
            loginMsg.append(`<span class="username">${user}</span>`);
            loginMsg.show();
        } else {
            $root.find('.not-logged-in').removeClass('hidden');
            $root.find('#login-message').text(`Login or register for your highscore to be uploaded!`);
        }

        $root.on('click', '#load-login', function() {
            $('#register-wrapper').addClass('hidden');
            $('#login-wrapper').removeClass('hidden');
        });

        $root.on('click', '#load-register', function() {
            $('#login-wrapper').addClass('hidden');
            $('#register-wrapper').removeClass('hidden');
        });

        $root.on('submit', '#login', async function(e) {
            e.preventDefault();
            const email = $('#emailLogin').val();
            const password = $('#passwordLogin').val();
            const res = await loginUser(email, password);
            if (res === "success") {
                location.reload();
            } else {
                $('#loginResponse').text(res);
            }
        });

        $root.on('submit', '#register', async function(e) {
            e.preventDefault();
            const username = $('#usernameRegister').val();
            const email = $('#emailRegister').val();
            const password = $('#passwordRegister').val();
            const passwordConfirmation = $('#confirmPasswordRegister').val();

            const res = await registerUser(username, email, password, passwordConfirmation);
            if (res === "success") {
                location.reload();
            } else {
                $('#registerResponse').text(res);
            }
        });
    });
})();