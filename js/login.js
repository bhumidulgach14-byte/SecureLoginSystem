/**
 * login.js - Handles Login Page Interaction & Validation
 * 
 * Features:
 * 1. Form Validation (empty fields, email format)
 * 2. Show / Hide password toggle
 * 3. Login attempt limiting (Max 3 attempts)
 * 4. 1-Minute temporary lockout with visual countdown timer
 * 5. Persistent lockout state via LocalStorage
 */

// DOM Elements
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const showPasswordToggle = document.getElementById('showPasswordToggle');
const loginBtn = document.getElementById('loginBtn');
const messageBox = document.getElementById('messageBox');
const lockoutBanner = document.getElementById('lockoutBanner');
const timerDisplay = document.getElementById('timerDisplay');

// Global timer reference for clearing intervals
let lockoutInterval = null;

/**
 * Display a user-friendly message in the message box.
 * @param {string} text - Message content
 * @param {'error'|'success'|'warning'|'info'} type - Message alert type
 */
function showMessage(text, type = 'error') {
    messageBox.textContent = text;
    messageBox.className = `message-box ${type}`;
}

/**
 * Clears and hides the message box.
 */
function clearMessage() {
    messageBox.textContent = '';
    messageBox.className = 'message-box';
}

/**
 * Toggles input fields and login button enabled/disabled state.
 * @param {boolean} disabled 
 */
function setFormDisabled(disabled) {
    emailInput.disabled = disabled;
    passwordInput.disabled = disabled;
    loginBtn.disabled = disabled;
}

/**
 * Starts or resumes the lockout countdown timer.
 */
function startLockoutTimer() {
    // Disable inputs and button
    setFormDisabled(true);
    lockoutBanner.style.display = 'block';
    clearMessage();

    // Clear any previous interval to prevent multiple intervals running
    if (lockoutInterval) {
        clearInterval(lockoutInterval);
    }

    // Function to update the countdown display every second
    const updateCountdown = () => {
        const remainingSeconds = getRemainingLockoutTime();

        if (remainingSeconds > 0) {
            timerDisplay.textContent = `${remainingSeconds}s`;
        } else {
            // Lockout period finished
            clearInterval(lockoutInterval);
            lockoutInterval = null;
            lockoutBanner.style.display = 'none';
            setFormDisabled(false);
            showMessage('Lockout expired. You may now attempt to login again.', 'info');
        }
    };

    // Run once immediately then interval every 1 second
    updateCountdown();
    lockoutInterval = setInterval(updateCountdown, 1000);
}

/**
 * Checks if the user is locked out upon page load.
 */
function checkInitialLockout() {
    if (isUserLockedOut()) {
        startLockoutTimer();
    }
}

// -------------------------------------------------------------
// EVENT LISTENERS
// -------------------------------------------------------------

// Show / Hide Password Checkbox Toggle
showPasswordToggle.addEventListener('change', function () {
    if (this.checked) {
        passwordInput.type = 'text';
    } else {
        passwordInput.type = 'password';
    }
});

// Form Submission Event
loginForm.addEventListener('submit', function (event) {
    // Prevent normal HTML form reload
    event.preventDefault();

    // 1. Guard against submission during lockout
    if (isUserLockedOut()) {
        startLockoutTimer();
        return;
    }

    // 2. Read and trim input values
    const enteredEmail = emailInput.value.trim();
    const enteredPassword = passwordInput.value.trim();

    // 3. Form Validation: Empty field checks
    if (!enteredEmail) {
        showMessage('Please enter your email address.', 'error');
        emailInput.focus();
        return;
    }

    if (!enteredPassword) {
        showMessage('Please enter your password.', 'error');
        passwordInput.focus();
        return;
    }

    // 4. Form Validation: Email format check
    if (!isValidEmail(enteredEmail)) {
        showMessage('Please enter a valid email format (e.g. name@example.com).', 'error');
        emailInput.focus();
        return;
    }

    // 5. Authentication Verification against LocalStorage
    const matchedUser = findUserByEmail(enteredEmail);
    const isPasswordCorrect = matchedUser && (matchedUser.password === enteredPassword);

    if (matchedUser && isPasswordCorrect) {
        // --- Successful Login ---
        resetFailedAttempts();
        showMessage('Login successful! Redirecting to dashboard...', 'success');
        setFormDisabled(true);

        // Store active session in SessionStorage
        createSession(matchedUser.email);

        // Redirect after brief delay
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1200);

    } else {
        // --- Incorrect Credentials ---
        const failedCount = recordFailedAttempt();

        if (failedCount >= MAX_ATTEMPTS) {
            // Trigger 1-minute lockout
            triggerLockout();
            passwordInput.value = '';
            startLockoutTimer();
            showMessage('Too many failed attempts! Form locked for 1 minute.', 'error');
        } else {
            // Inform remaining attempts
            const remaining = MAX_ATTEMPTS - failedCount;
            showMessage(`Invalid email or password. ${remaining} attempt(s) remaining.`, 'error');
            passwordInput.value = '';
            passwordInput.focus();
        }
    }
});

// Check if user was already locked out upon opening/reloading page
checkInitialLockout();
