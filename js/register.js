/**
 * register.js - Handles New User Registration
 * 
 * Features:
 * 1. Validates non-empty input fields.
 * 2. Checks email syntax with regex.
 * 3. Enforces 8+ character password rule.
 * 4. Ensures password and confirm password match.
 * 5. Prevents duplicate email registrations.
 * 6. Stores the new user credentials in LocalStorage.
 */

// DOM Elements
const registerForm = document.getElementById('registerForm');
const regEmailInput = document.getElementById('regEmail');
const regPasswordInput = document.getElementById('regPassword');
const regConfirmPasswordInput = document.getElementById('regConfirmPassword');
const showRegPasswordsToggle = document.getElementById('showRegPasswordsToggle');
const registerBtn = document.getElementById('registerBtn');
const messageBox = document.getElementById('messageBox');

/**
 * Display a user-friendly alert message.
 * @param {string} text 
 * @param {'error'|'success'|'warning'|'info'} type 
 */
function showMessage(text, type = 'error') {
    messageBox.textContent = text;
    messageBox.className = `message-box ${type}`;
}

// Show / Hide Passwords Checkbox Toggle
showRegPasswordsToggle.addEventListener('change', function () {
    const inputType = this.checked ? 'text' : 'password';
    regPasswordInput.type = inputType;
    regConfirmPasswordInput.type = inputType;
});

// Registration Form Submission Event
registerForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const email = regEmailInput.value.trim();
    const password = regPasswordInput.value.trim();
    const confirmPassword = regConfirmPasswordInput.value.trim();

    // 1. Validation: Check empty fields
    if (!email) {
        showMessage('Please enter an email address.', 'error');
        regEmailInput.focus();
        return;
    }

    if (!password) {
        showMessage('Please enter a password.', 'error');
        regPasswordInput.focus();
        return;
    }

    if (!confirmPassword) {
        showMessage('Please confirm your password.', 'error');
        regConfirmPasswordInput.focus();
        return;
    }

    // 2. Validation: Email format check
    if (!isValidEmail(email)) {
        showMessage('Please enter a valid email format (e.g. name@example.com).', 'error');
        regEmailInput.focus();
        return;
    }

    // 3. Validation: Minimum 8 characters password rule
    if (password.length < 8) {
        showMessage('Password must be at least 8 characters long.', 'error');
        regPasswordInput.focus();
        return;
    }

    // 4. Validation: Passwords must match
    if (password !== confirmPassword) {
        showMessage('Passwords do not match. Please ensure both passwords are identical.', 'error');
        regConfirmPasswordInput.focus();
        return;
    }

    // 5. Register user in LocalStorage
    const result = registerUser(email, password);

    if (!result.success) {
        showMessage(result.message, 'error');
        regEmailInput.focus();
        return;
    }

    // 6. Success state and redirection
    registerBtn.disabled = true;
    showMessage('Account created successfully! Redirecting to login...', 'success');

    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
});
