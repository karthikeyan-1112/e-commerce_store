const BASE_URL = "http://localhost:3000";

// SIGNUP
async function signup() {
    const name = name.value;
    const email = email.value;
    const phone = phone.value;
    const password = password.value;

    const res = await fetch("/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password })
    });

    const data = await res.json();
    msg.innerText = data.message || data.error;
    if (data.message) location.href = "otp.html";
}

// VERIFY SIGNUP OTP
async function verifyOTP() {
    const res = await fetch("/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: otp_email.value,
            otp: otp_code.value
        })
    });

    const data = await res.json();
    msg.innerText = data.message || data.error;
    if (data.message) location.href = "login.html";
}

// LOGIN
async function login() {
    const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: login_email.value,
            password: login_password.value
        })
    });

    const data = await res.json();
    msg.innerText = data.message || data.error;
}

// FORGOT PASSWORD
async function sendResetOTP() {
    const res = await fetch("/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgot_email.value })
    });

    const data = await res.json();
    msg.innerText = data.message || data.error;
}

// VERIFY RESET OTP
async function verifyResetOTP() {
    const res = await fetch("/verify-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: forgot_email.value,
            otp: reset_otp.value
        })
    });

    const data = await res.json();
    msg.innerText = data.message || data.error;
}

// RESET PASSWORD
async function resetPassword() {
    const res = await fetch("/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: forgot_email.value,
            newPassword: new_password.value
        })
    });

    const data = await res.json();
    msg.innerText = data.message || data.error;
    if (data.message) location.href = "login.html";
}
