/**
 * auth.js - Shared Authentication & Storage Helper Functions
 * 
 * Purpose:
 * Handles simulated user data (multi-user support), login attempts, 
 * temporary lockout, and session state using browser's LocalStorage and SessionStorage.
 */

// Storage Keys Constants
const STORAGE_KEYS = {
    USER: 'secure_auth_user',         // Legacy single user key (for backward compatibility)
    USERS: 'secure_auth_users',       // Array of all registered users
    ATTEMPTS: 'secure_auth_attempts',
    LOCKOUT_EXPIRY: 'secure_auth_lockout_expiry',
    ACTIVE_SESSION: 'secure_auth_session'
};

// Default Demo Credentials
const DEFAULT_USER = {
    email: 'student@example.com',
    password: 'Password123'
};

// Lockout Configurations
const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION_SECONDS = 60; // 1 minute lockout

/**
 * Initializes default demo user in LocalStorage if no users exist.
 */
function initAuth() {
    let users = [];
    const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);

    if (storedUsers) {
        try {
            users = JSON.parse(storedUsers);
        } catch (e) {
            users = [];
        }
    } else {
        // Check if there is an existing single user from older version
        const legacyUser = localStorage.getItem(STORAGE_KEYS.USER);
        if (legacyUser) {
            try {
                users = [JSON.parse(legacyUser)];
            } catch (e) {
                users = [DEFAULT_USER];
            }
        } else {
            users = [DEFAULT_USER];
        }
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }

    // Keep legacy single-user key synced for safety
    if (users.length > 0) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(users[0]));
    }

    if (localStorage.getItem(STORAGE_KEYS.ATTEMPTS) === null) {
        localStorage.setItem(STORAGE_KEYS.ATTEMPTS, '0');
    }
}

/**
 * Retrieves the array of all registered users.
 * @returns {Array<{email: string, password: string}>}
 */
function getAllUsers() {
    initAuth();
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
}

/**
 * Finds a user by email address (case-insensitive).
 * @param {string} email 
 * @returns {Object|null}
 */
function findUserByEmail(email) {
    if (!email) return null;
    const users = getAllUsers();
    const cleanEmail = email.trim().toLowerCase();
    return users.find(u => u.email.toLowerCase() === cleanEmail) || null;
}

/**
 * Registers a new user and saves to LocalStorage.
 * @param {string} email 
 * @param {string} password 
 * @returns {{success: boolean, message: string}}
 */
function registerUser(email, password) {
    const cleanEmail = email.trim();

    // Check if user already exists
    if (findUserByEmail(cleanEmail)) {
        return {
            success: false,
            message: 'An account with this email already exists. Please log in or use another email.'
        };
    }

    const users = getAllUsers();
    const newUser = {
        email: cleanEmail,
        password: password
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    return {
        success: true,
        message: 'Account created successfully! You can now log in.'
    };
}

/**
 * Retrieves the default or primary user (for backward compatibility).
 * @returns {Object}
 */
function getUser() {
    const users = getAllUsers();
    return users.length > 0 ? users[0] : DEFAULT_USER;
}

/**
 * Updates a specific user's password in LocalStorage.
 * Accepts either (email, newPassword) or (newPassword).
 * @param {string} emailOrPassword 
 * @param {string} [maybePassword] 
 */
function updateUserPassword(emailOrPassword, maybePassword) {
    let email, newPassword;
    if (maybePassword !== undefined) {
        email = emailOrPassword;
        newPassword = maybePassword;
    } else {
        newPassword = emailOrPassword;
        const sessionResetEmail = sessionStorage.getItem('password_reset_allowed_email');
        email = sessionResetEmail || getUser().email;
    }

    const users = getAllUsers();
    const cleanEmail = email.trim().toLowerCase();
    let updated = false;

    for (let i = 0; i < users.length; i++) {
        if (users[i].email.toLowerCase() === cleanEmail) {
            users[i].password = newPassword;
            updated = true;
            break;
        }
    }

    if (updated) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        // Keep single-user key updated if primary user was modified
        if (users[0].email.toLowerCase() === cleanEmail) {
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(users[0]));
        }
    }
}

/**
 * Gets the current count of failed login attempts.
 * @returns {number}
 */
function getFailedAttempts() {
    const attempts = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
    return attempts ? parseInt(attempts, 10) : 0;
}

/**
 * Increments failed attempts counter by 1.
 * @returns {number} The updated attempts count
 */
function recordFailedAttempt() {
    const current = getFailedAttempts() + 1;
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, current.toString());
    return current;
}

/**
 * Resets the failed attempts counter back to 0.
 */
function resetFailedAttempts() {
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, '0');
    localStorage.removeItem(STORAGE_KEYS.LOCKOUT_EXPIRY);
}

/**
 * Locks the login form by setting an expiry timestamp (current time + 60 seconds).
 */
function triggerLockout() {
    const expiryTime = Date.now() + (LOCKOUT_DURATION_SECONDS * 1000);
    localStorage.setItem(STORAGE_KEYS.LOCKOUT_EXPIRY, expiryTime.toString());
}

/**
 * Checks remaining lockout seconds.
 * If time has expired, it automatically resets lockout and attempts.
 * @returns {number} Remaining seconds, or 0 if not locked out.
 */
function getRemainingLockoutTime() {
    const expiryStr = localStorage.getItem(STORAGE_KEYS.LOCKOUT_EXPIRY);
    if (!expiryStr) {
        return 0;
    }

    const expiryTime = parseInt(expiryStr, 10);
    const now = Date.now();
    const remainingMs = expiryTime - now;

    if (remainingMs > 0) {
        return Math.ceil(remainingMs / 1000);
    } else {
        // Lockout period has elapsed: reset attempts and remove lockout key
        resetFailedAttempts();
        return 0;
    }
}

/**
 * Returns whether the form is currently locked out.
 * @returns {boolean}
 */
function isUserLockedOut() {
    return getRemainingLockoutTime() > 0;
}

/**
 * Validates email format using a standard regular expression.
 * @param {string} email 
 * @returns {boolean}
 */
function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

/**
 * Saves logged-in user into SessionStorage.
 * @param {string} email 
 */
function createSession(email) {
    sessionStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, email);
}

/**
 * Retrieves the currently logged-in user email from SessionStorage.
 * @returns {string|null}
 */
function getActiveSession() {
    return sessionStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
}

/**
 * Destroys the active session on logout.
 */
function clearSession() {
    sessionStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
}

// Auto-run initAuth on script load
initAuth();
