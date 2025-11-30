# Authentication System Integration Guide

## Overview
All pages on the website are now protected by authentication. Users must log in with valid credentials before accessing any content.

## Admin Access Credentials
```
Username: Admin
Password: AbdullahShafiq5757
```

## How It Works

### 1. Authentication Flow
- **Unprotected Page**: `login.html` - Anyone can access
- **Protected Pages**: All other pages require authentication
- When user tries to access any protected page without login → redirected to `login.html`
- After successful login → user is redirected to `index.html`
- User info and logout button appear in header

### 2. How Authentication is Enforced

#### `auth-check.js` (Runs on ALL Protected Pages)
This file is included in every page's `<head>` section:
```html
<script src="auth-check.js"></script>
```

It performs these checks:
1. **On Page Load** - Checks if `linguasign_auth` exists in localStorage
2. **If Not Logged In** - Redirects to `login.html`
3. **If Logged In** - Allows page access and adds logout button
4. **Session Timeout** - Auto-logout after 30 minutes of inactivity

#### Protected Pages (11 total)
- index.html ✓
- home.html ✓
- about.html ✓
- features.html ✓
- pricing.html ✓
- blog.html ✓
- contact.html ✓
- demo.html ✓
- api.html ✓
- careers.html ✓
- feedback.html ✓

#### Public Pages
- login.html (NO auth-check.js) ✓

### 3. Login Process

**Step 1**: User visits any protected page
- auth-check.js runs and detects no authentication
- Redirects to login.html

**Step 2**: User enters credentials on login.html
- Username: Admin
- Password: AbdullahShafiq5757
- Or can create new account (signup)

**Step 3**: Credentials are validated
- Admin credentials checked against hardcoded values
- OR user database checked for registered accounts
- Password is hashed before storage

**Step 4**: On success
- Authentication data stored in localStorage
- User redirected to index.html
- Logout button appears in header

### 4. Authentication Data Structure

Stored in localStorage as `linguasign_auth`:
```json
{
  "isLoggedIn": true,
  "user": {
    "username": "Admin",
    "role": "admin",
    "loginTime": "2025-11-30T10:30:00.000Z"
  },
  "loginTime": "2025-11-30T10:30:00.000Z"
}
```

### 5. User Interface Changes

When logged in:
- **Header now shows**: 👤 Username | 🌙 Theme Toggle | 🚪 Logout

When logout button clicked:
- Confirmation dialog appears
- On confirm: auth data deleted from localStorage
- Redirects to login.html

### 6. Session Management

**Automatic Logout After Inactivity**
- 30 minutes timeout (editable in auth-check.js, line 97)
- Activity tracked: mouse movement, keyboard, clicks
- Alert shown when session expires

### 7. Files Modified

1. **auth-check.js** (NEW)
   - Enforces authentication on protected pages
   - Adds logout button to header
   - Manages session timeout

2. **auth.js** (MODIFIED)
   - Changed redirect from dashboard.html → index.html

3. **All Protected HTML Pages** (MODIFIED)
   - Added `<script src="auth-check.js"></script>` in `<head>`

## Testing the Authentication System

### Test 1: Unauthorized Access
1. Open browser dev tools → Storage → Clear localStorage
2. Try to access: `http://yoursite.com/index.html`
3. Expected: Redirects to `login.html`

### Test 2: Admin Login
1. Go to login page
2. Enter Username: `Admin`
3. Enter Password: `AbdullahShafiq5757`
4. Click Sign In
5. Expected: Redirected to index.html with logout button visible

### Test 3: Signup New Account
1. On login page, click "Create Account"
2. Fill signup form with valid data
3. Click "Sign Up"
4. Expected: Account created, redirected to login
5. Try logging in with new account

### Test 4: Session Timeout
1. Login to system
2. Don't interact for 30+ minutes
3. Try to perform any action
4. Expected: Alert appears, session expires, redirected to login

### Test 5: Direct Page Access
1. Login successfully
2. Visit any protected page directly: /about.html, /demo.html, etc.
3. Expected: Page loads normally with logout button visible

### Test 6: Logout
1. Login with Admin
2. Click "🚪 Logout" button
3. Confirm logout in dialog
4. Expected: Redirected to login.html

## Security Notes

⚠️ **Important**: This is a client-side authentication system suitable for:
- Development and testing
- Internal company websites
- Demo/prototype purposes
- Educational projects

⚠️ **Not suitable for production** without:
- Moving authentication to secure backend server
- Using HTTPS for all communications
- Implementing proper password hashing (bcrypt, scrypt, etc.)
- Using JWT tokens with expiration
- Database for user storage
- Rate limiting on login attempts
- CSRF protection
- Regular security audits

## Customization

### Change Admin Password
Edit `auth.js`, line 5-6:
```javascript
const ADMIN_CREDENTIALS = {
  username: 'Admin',
  password: 'YourNewPassword' // Change here
};
```

### Change Session Timeout
Edit `auth-check.js`, line 97:
```javascript
const SESSION_TIMEOUT = 30 * 60 * 1000; // Change 30 to desired minutes
```

### Add More Admin Users
Edit `auth.js` to add multiple admin credentials:
```javascript
const ADMIN_CREDENTIALS = [
  { username: 'Admin', password: 'AbdullahShafiq5757' },
  { username: 'Manager', password: 'ManagerPassword123' }
];
```

### Change Redirect After Login
Edit `auth.js`, line 308:
```javascript
window.location.href = 'index.html'; // Change to different page
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Still seeing login page after login | Clear browser cache and localStorage |
| Logout button not appearing | Ensure auth-check.js is loaded (check browser console) |
| Session timing out too quickly | Increase SESSION_TIMEOUT value in auth-check.js |
| Can't login with new account | Ensure password meets requirements (8+ chars, uppercase, number) |
| Stuck in redirect loop | Check localStorage for corrupted data, clear it |

## Browser Console Debug

Open browser console (F12) and try:
```javascript
// Check if logged in
localStorage.getItem('linguasign_auth')

// Check current user
JSON.parse(localStorage.getItem('linguasign_auth')).user

// Manually logout
localStorage.removeItem('linguasign_auth')

// Check registered users
JSON.parse(localStorage.getItem('linguasign_users'))
```

---

**Last Updated**: November 30, 2025
**System Status**: ✅ Active and Fully Integrated
