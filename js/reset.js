/**
 * reset.js - Handles Setting and Validating the New Password
 * 
 * Features:
 * 1. Checks that the user accessed this page through the forgot password flow.
 * 2. Toggles password visibility for both input fields.
 * 3. Enforces minimum 8 characters constraint.
 * 4. Enforces matching confirmation password.
 * 5. Updates credentials in LocalStorage and clears reset session token.
 */

const resetForm = document.getElementById('resetForm');
const newPasswordInput = document.getElementById('newPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');
const showPasswordsToggle = document.getElementById('showPasswordsToggle');
const resetBtn = document.getElementById('resetBtn');
const messageBox = document.getElementById('messageBox');
const targetEmailText = document.getElementById('targetEmailText');

// Check that the user has verified their email on the forgot-password page
const resetEmail = sessionStorage.getItem('password_reset_allowed_email');

if (!resetEmail) {
    // If accessed directly without email verification, redirect to forgot-password page
    window.location.href = 'forgot-password.html';
} else {
    targetEmailText.textContent = `Account: ${resetEmail}`;
}

/**
 * Display message helper.
 * @param {string} text 
 * @param {'error'|'success'|'warning'|'info'} type 
 */
function showMessage(text, type = 'error') {
    messageBox.textContent = text;
    messageBox.className = `message-box ${type}`;
}

// Toggle visibility for both password inputs
showPasswordsToggle.addEventListener('change', function () {
    const inputType = this.checked ? 'text' : 'password';
    newPasswordInput.type = inputType;
    confirmPasswordInput.type = inputType;
});

// Form submission handler
resetForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    // 1. Validation: Empty inputs
    if (!newPassword) {
        showMessage('Please enter a new password.', 'error');
        newPasswordInput.focus();
        return;
    }

    if (!confirmPassword) {
        showMessage('Please confirm your new password.', 'error');
        confirmPasswordInput.focus();
        return;
    }

    // 2. Validation: Minimum 8 characters
    if (newPassword.length < 8) {
        showMessage('Password must contain at least 8 characters.', 'error');
        newPasswordInput.focus();
        return;
    }

    // 3. Validation: Password match
    if (newPassword !== confirmPassword) {
        showMessage('Passwords do not match. Please re-enter identical passwords.', 'error');
        confirmPasswordInput.focus();
        return;
    }

    // 4. Update the password in LocalStorage
    updateUserPassword(resetEmail, newPassword);

    // Reset any previous failed login lockouts/attempts so user can log in cleanly
    resetFailedAttempts();

    // Clear the reset authorization token from SessionStorage
    sessionStorage.removeItem('password_reset_allowed_email');

    // UI feedback and redirection
    resetBtn.disabled = true;
    showMessage('Password reset successfully! Redirecting to login page...', 'success');

    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1800);
});
