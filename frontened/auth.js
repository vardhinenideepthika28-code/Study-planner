// ==========================================
// STUDYFLOW - AUTHENTICATION
// ==========================================

const API_URL = (window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost" || window.location.protocol === "file:")
    ? (localStorage.getItem("studyflow_api_url") || "http://127.0.0.1:8000")
    : (localStorage.getItem("studyflow_api_url") || "https://study-planner-ng92.onrender.com");


// ==========================================
// LOGIN
// ==========================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        const rememberMe =
            document.getElementById("rememberMe").checked;

        const message =
            document.getElementById("loginMessage");


        message.textContent = "";
        message.className = "form-message";


        try {

            const response = await fetch(
                `${API_URL}/api/auth/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );


            const data = await response.json();


            if (!response.ok) {

                throw new Error(
                    data.detail || "Login failed"
                );

            }


            // Save user information
            if (rememberMe) {

                localStorage.setItem(
                    "studyflowUser",
                    JSON.stringify(data)
                );

            } else {

                sessionStorage.setItem(
                    "studyflowUser",
                    JSON.stringify(data)
                );

            }


            message.textContent =
                "Login successful! Redirecting...";

            message.classList.add("success");


            setTimeout(function () {

                window.location.href =
                    "dashboard.html";

            }, 800);


        } catch (error) {

            console.error(error);

            message.textContent =
                error.message;

            message.classList.add("error");

        }

    });

}


// ==========================================
// SIGNUP
// ==========================================

const signupForm =
    document.getElementById("signupForm");


if (signupForm) {

    signupForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const fullName =
                document
                    .getElementById("fullName")
                    .value
                    .trim();


            const email =
                document
                    .getElementById("signupEmail")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("signupPassword")
                    .value;


            const confirmPassword =
                document
                    .getElementById("confirmPassword")
                    .value;


            const terms =
                document.getElementById("terms");


            const message =
                document.getElementById("signupMessage");


            message.textContent = "";
            message.className = "form-message";


            // Check password
            if (password !== confirmPassword) {

                message.textContent =
                    "Passwords do not match.";

                message.classList.add("error");

                return;

            }


            // Check terms
            if (terms && !terms.checked) {

                message.textContent =
                    "Please accept the terms and conditions.";

                message.classList.add("error");

                return;

            }


            try {

                const response = await fetch(
                    `${API_URL}/api/auth/signup`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({

                            full_name: fullName,

                            email: email,

                            password: password

                        })
                    }
                );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.detail || "Signup failed"
                    );

                }


                // Save newly created user
                sessionStorage.setItem(
                    "studyflowUser",
                    JSON.stringify(data)
                );


                message.textContent =
                    "Account created successfully! Redirecting...";

                message.classList.add("success");


                setTimeout(function () {

                    window.location.href =
                        "dashboard.html";

                }, 1000);


            } catch (error) {

                console.error(error);

                message.textContent =
                    error.message;

                message.classList.add("error");

            }

        }
    );

}


// ==========================================
// SHOW / HIDE LOGIN PASSWORD
// ==========================================

const togglePassword =
    document.getElementById("togglePassword");


if (togglePassword) {

    togglePassword.addEventListener(
        "click",
        function () {

            const password =
                document.getElementById("password");


            if (password.type === "password") {

                password.type = "text";

                togglePassword.textContent = "◉";

            } else {

                password.type = "password";

                togglePassword.textContent = "◉";

            }

        }
    );

}


// ==========================================
// SHOW / HIDE SIGNUP PASSWORD
// ==========================================

const toggleSignupPassword =
    document.getElementById("toggleSignupPassword");


if (toggleSignupPassword) {

    toggleSignupPassword.addEventListener(
        "click",
        function () {

            const password =
                document.getElementById("signupPassword");


            if (password.type === "password") {

                password.type = "text";

            } else {

                password.type = "password";

            }

        }
    );

}


// ==========================================
// FORGOT PASSWORD
// ==========================================

const forgotPassword =
    document.getElementById("forgotPassword");


if (forgotPassword) {

    forgotPassword.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            alert(
                "Password recovery will be added in a future version."
            );

        }
    );

}