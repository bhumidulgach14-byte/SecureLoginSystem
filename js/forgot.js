/**
 * forgot.js - Handles Email Verification for Password Recovery
 * 
 * Features:
 * 1. Validates email input format and non-empty status.
 * 2. Checks if the email matches the registered user in LocalStorage.
 * 3. Simulates verification and passes verified email to reset-password.html via SessionStorage.
 */

const forgotForm = document.getElementById('forgotForm');
const forgotEmailInput = document.getElementById('forgotEmail');
const submitBtn = document.getElementById('submitBtn');
const messageBox = document.getElementById('messageBox');

/**
 * Display helper for feedback messages.
 * @param {string} text 
 * @param {'error'|'success'|'warning'|'info'} type 
 */
function showMessage(text, type = 'error') {
    messageBox.textContent = text;
    messageBox.className = `message-box ${type}`;
}

forgotForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const enteredEmail = forgotEmailInput.value.trim();

    // 1. Validate empty field
    if (!enteredEmail) {
        showMessage('Please enter your registered email address.', 'error');
        forgotEmailInput.focus();
        return;
    }

    // 2. Validate email structure
    if (!isValidEmail(enteredEmail)) {
        showMessage('Please enter a valid email address (e.g. name@example.com).', 'error');
        forgotEmailInput.focus();
        return;
    }

    // 3. Check if email exists in LocalStorage
    const matchedUser = findUserByEmail(enteredEmail);

    if (matchedUser) {
        // Match found: Save temporary verification token in SessionStorage
        sessionStorage.setItem('password_reset_allowed_email', matchedUser.email);

        submitBtn.disabled = true;
        showMessage('Email verified successfully! Redirecting to reset password page...', 'success');

        // Redirect to reset-password.html after 1.2 seconds
        setTimeout(() => {
            window.location.href = 'reset-password.html';
        }, 1200);
    } else {
        // Email does not match
        showMessage('No registered account found with this email address.', 'error');
        forgotEmailInput.focus();
    }
});
