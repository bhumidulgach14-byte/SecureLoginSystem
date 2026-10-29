# Secure Login System (HTML, CSS & Vanilla JavaScript)

[![Status](https://img.shields.io/badge/Status-Completed-success.svg)](#)
[![Tech Stack](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20JavaScript%20ES6+-blue.svg)](#)
[![Storage](https://img.shields.io/badge/Storage-LocalStorage%20%7C%20SessionStorage-orange.svg)](#)
[![Academic Project](https://img.shields.io/badge/Course-MCA%20(26CAP--607)-purple.svg)](#)

> An interactive, responsive, client-side authentication system built with semantic HTML5, modern CSS3, and modular vanilla JavaScript. Features multi-user persistence, client-side input validation, brute-force lockout protection with live countdown timers, password recovery workflows, and session-guarded dashboard access without requiring external backend servers or database installations.

---

## 📌 Project Overview

The **Secure Login System** is an educational yet practical web application designed to demonstrate fundamental web security paradigms and frontend state management. It provides a full authentication lifecycle including account registration, credential verification, temporary rate-limiting / lockout, password reset flows, and protected dashboard routing.

Data persistence and session control are achieved entirely through native browser APIs:
- **`localStorage`**: Houses registered user arrays, failed attempt counters, and lockout expiration timestamps across browser restarts.
- **`sessionStorage`**: Manages transient session state for active logged-in sessions and gates password-reset authorization tokens.

---

## 🚀 Key Features

### 1. 🔐 Robust Authentication & Multi-User Support
- Pre-seeded with a default demo account (`student@example.com` / `Password123`) on initial initialization.
- Dynamic multi-user registration stored as JSON objects in `localStorage`.
- Case-insensitive email normalization and duplicate-email prevention.
- Seamless password updates with backward-compatible storage keys.

### 2. 🛡️ Brute-Force & Lockout Protection
- Tracks failed login attempts in real time.
- Allows up to **3 consecutive failed attempts**.
- On the 3rd failed attempt, the system triggers a **60-second temporary lockout**.
- Form inputs and action buttons are disabled during lockout.
- A live, dynamic visual countdown timer (`60s` down to `0s`) is rendered.
- **State persistence**: Lockout expiration is stored as a Unix timestamp, preventing bypass via browser refresh.

### 3. 📝 Client-Side Form Validation & UX
- Real-time empty field checking with field auto-focus on errors.
- RFC-compliant email regex syntax check: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`.
- Enforces strong password rules (minimum 8 characters).
- Password and confirm-password equivalence validation.
- Interactive **Show / Hide Password** toggles for enhanced user convenience.
- Color-coded feedback alerts:
  - 🔴 **Error (`#fef2f2`)**: Validation warnings, incorrect credentials, lockout alerts.
  - 🟢 **Success (`#f0fdf4`)**: Successful login, account created, password updated.
  - 🔵 **Info (`#eff6ff`)**: Expiration notifications, educational guidelines.

### 4. 🔄 Password Recovery (Forgot & Reset Flow)
- **Email Verification**: Validates whether the entered email exists in `localStorage`.
- **Session-Gated Token**: On successful verification, sets a temporary token in `sessionStorage` (`password_reset_allowed_email`).
- **Route Guarding**: Direct URL access to `reset-password.html` without prior email verification automatically redirects the user back to `forgot-password.html`.
- Upon successful reset, failed attempt counters are cleared and the user is redirected to login.

### 5. 📊 Session-Guarded Dashboard
- Protects `dashboard.html` against unauthorized access using `sessionStorage.getItem('secure_auth_session')`.
- Displays dynamic welcome text with the logged-in user's email address.
- Interactive **Logout** functionality that destroys the active session and routes back to `index.html`.

---

## 🗂️ Project Directory Structure

```text
SecureLoginSystem/
│
├── css/
│   └── style.css            # Centralized responsive stylesheet (Card UI & Alerts)
│
├── js/
│   ├── auth.js              # Core authentication engine & Web Storage helpers
│   ├── login.js             # Login event listeners, validation & lockout timer
│   ├── register.js          # New user registration & duplicate check logic
│   ├── forgot.js            # Email existence verification for password recovery
│   └── reset.js             # Password update & session token route guard
│
├── index.html               # Main login page with lockout banner & demo hints
├── register.html            # User registration form
├── forgot-password.html     # Email lookup for password recovery
├── reset-password.html      # Protected new password submission page
├── dashboard.html           # Authenticated user dashboard with session check
└── README.md                # Project documentation
```

---

## ⚙️ Architecture & Data Storage Model

### `localStorage` Schema
| Key | Data Type | Purpose |
|---|---|---|
| `secure_auth_users` | `Array<Object>` | JSON-serialized list of registered accounts `[{ email, password }]` |
| `secure_auth_attempts` | `string` (Integer) | Count of consecutive incorrect login attempts (`0` to `3`) |
| `secure_auth_lockout_expiry` | `string` (Timestamp) | Epoch millisecond timestamp until which the login form remains locked |
| `secure_auth_user` | `Object` | Legacy single-user object kept in sync for backwards compatibility |

### `sessionStorage` Schema
| Key | Data Type | Purpose |
|---|---|---|
| `secure_auth_session` | `string` | Stores active logged-in user's email to authorize dashboard access |
| `password_reset_allowed_email` | `string` | Ephemeral authorization token allowing access to `reset-password.html` |

---

## 🧪 Testing & Validation Matrix

| Test ID | Scenario | Expected Result | Actual Result | Status |
|:---:|---|---|---|:---:|
| **TC-01** | Blank form submission | Displays error: *"Please enter your email address"* | Error displayed; focus on input | **PASSED** |
| **TC-02** | Invalid email format | Regex rejects string, prompts valid format error | Error alert triggered | **PASSED** |
| **TC-03** | Valid login with demo user | Creates session token, redirects to `dashboard.html` | Dashboard rendered with active user email | **PASSED** |
| **TC-04** | 3 consecutive failed logins | Triggers 60s lockout banner, disables submit button | Form locked; timer countdown initiates | **PASSED** |
| **TC-05** | Page refresh during lockout | Timer continues remaining seconds from timestamp | Lockout persists across refresh | **PASSED** |
| **TC-06** | Duplicate email registration | Rejects registration with account existence alert | Duplicate account blocked | **PASSED** |
| **TC-07** | Password < 8 characters | Rejects registration, alerts 8-character rule | Validation error displayed | **PASSED** |
| **TC-08** | Unregistered email in recovery | Rejects recovery request, informs user not found | Blocked with notification | **PASSED** |
| **TC-09** | Valid password reset flow | Updates password in `localStorage`, clears session token | Password updated, login succeeded | **PASSED** |
| **TC-10** | Unauthorized dashboard visit | Denies direct access via URL, redirects to `index.html` | Alert shown, redirected to login | **PASSED** |

---

## 💻 How to Run the Project

### Option 1: Direct Browser Launch (Zero Setup)
1. Clone or download the repository to your local machine:
   ```bash
   git clone https://github.com/PrabhatRanjan1612/SecureLoginSystem.git
   ```
2. Navigate into the project folder:
   ```bash
   cd SecureLoginSystem
   ```
3. Double-click **`index.html`** or right-click and choose **Open with > Google Chrome / Microsoft Edge / Firefox**.

### Option 2: Live Server (VS Code)
1. Open the project folder in **Visual Studio Code**.
2. Install the **Live Server** extension (`ritwickdey.LiveServer`).
3. Right-click `index.html` and click **"Open with Live Server"**.
4. The application will launch at `http://127.0.0.1:5500/index.html`.

---

## 🔑 Default Demo Credentials

For quick evaluation and testing, the application pre-loads a demo user:
- **Email:** `student@example.com`
- **Password:** `Password123`

---

## 🔮 Future Enhancements

- [ ] **Cryptographic Password Hashing**: Utilize the browser's Web Crypto API (`crypto.subtle.digest('SHA-256', ...)`) to prevent plaintext password storage in client memory.
- [ ] **Visual CAPTCHA**: Add an interactive mathematical or image-based captcha challenge after 2 failed login attempts.
- [ ] **Real OTP Delivery**: Integrate third-party email APIs (e.g., EmailJS) to dispatch real time-limited OTPs for password recovery.
- [ ] **Two-Factor Authentication (2FA)**: Introduce TOTP-based 2FA support using QR code generation.
- [ ] **Full-Stack Backend Integration**: Migrate client-side storage to a RESTful Node.js/Express backend with MongoDB and JWT token sessions.

---

## 👨‍💻 Author & Academic Information

- **Student Name:** Prabhat Ranjan
- **University Roll No / UID:** 26MCA20120
- **Course:** Master of Computer Applications (MCA) — Sem 1
- **Subject / Code:** Mini Project (26CAP-607)
- **Institution:** University Institute of Computing (UIC), Chandigarh University, Mohali, Punjab - 140301
- **Supervisor:** Arshid Ahmad Wani, UIC

---

## 📄 License
This project is developed for educational and academic assessment purposes as part of the MCA degree curriculum at Chandigarh University.
