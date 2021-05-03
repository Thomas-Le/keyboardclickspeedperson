async function registerUser(event) {
    event.preventDefault();
    const email = $('#emailRegister').val();
    const username = $('#usernameRegister').val();
    const password = $('#passwordRegister').val();
    const passwordConfirmation = $('#confirmPasswordRegister').val();

    await axios({
        method: 'post',
        //url: 'http://localhost:4000/register',
        url: 'https://kcsp-elsamoht.apps.cloudapps.unc.edu/register',
        withCredentials: true,
        data: {
            email: email,
            username: username,
            password: password,
            passwordConfirmation: passwordConfirmation
        }
    }).then(res => {
        location.reload();
    }).catch(err => {
        $('#registerResponse').text(err.response.data.message);
    });
}

async function loginUser(event) {
    event.preventDefault();
    const email = $('#emailLogin').val();
    const password = $('#passwordLogin').val();

    const result = await axios({
        method: 'post',
        //url: 'http://localhost:4000/login',
        url: 'https://kcsp-elsamoht.apps.cloudapps.unc.edu/login',
        withCredentials: true,
        data: {
            email: email,
            password: password
        }
    }).then(res => {
        location.reload();
    }).catch(err => {
        $('#loginResponse').text(err.response.data.message);
    });
}
(async () => {
    let { loggedIn, user } = await checkLogin();
    $(function() {
        $('#register').on('submit', registerUser);
        $('#login').on('submit', loginUser);
        if (loggedIn) {
            $('#loginStatus').text(`Welcome ${user}`);
            $('#race').text('Race Now!');
            $('form').hide();
            $('.form-heading').hide();
        }
    });
})();