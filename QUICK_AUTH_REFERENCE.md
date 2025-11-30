# Quick Authentication Reference

## 🔑 Admin Credentials
```
Username: Admin
Password: AbdullahShafiq5757
```

## 📋 Protected vs Public Pages

### 🔒 Protected (11 pages - NEED LOGIN)
✓ index.html
✓ home.html
✓ about.html
✓ features.html
✓ pricing.html
✓ blog.html
✓ contact.html
✓ demo.html
✓ api.html
✓ careers.html
✓ feedback.html

### 🔓 Public (NO LOGIN REQUIRED)
✓ login.html

## 🔧 How to Add New Protected Page

1. Create your new page (e.g., `newpage.html`)
2. Add this line in the `<head>` section:
```html
<script src="auth-check.js"></script>
```
3. Done! Page is now protected.

## 🗝️ How to Remove Login Protection from a Page

Simply remove this line from the page's `<head>`:
```html
<script src="auth-check.js"></script>
```

## 🚀 User Experience Flow

```
User tries to access page
    ↓
auth-check.js runs
    ↓
Is user logged in? ← Check localStorage for "linguasign_auth"
    ├─ YES → Allow page access + show logout button
    └─ NO → Redirect to login.html
         ↓
    User enters credentials
         ↓
    Credentials match? ← Check against Admin or user database
    ├─ YES → Store in localStorage + redirect to index.html
    └─ NO → Show error message
```

## 📱 Header Button Locations

When logged in, header displays:
```
[Logo] [Nav Links]                [👤 Username] [🌙 Theme] [🚪 Logout]
```

On mobile (< 768px):
```
[Logo]                                         [🌙 Theme] [🚪 Logout]
```
(Username hidden to save space)

## 🔄 Session Management

- **Timeout**: 30 minutes of inactivity
- **Activity tracked**: Mouse, keyboard, clicks
- **Auto-logout**: Yes
- **Remember me**: Available on login

## 💾 localStorage Keys

```javascript
// Authentication data
localStorage.getItem('linguasign_auth')
// Returns: { isLoggedIn, user: { username, role, loginTime } }

// All registered users
localStorage.getItem('linguasign_users')
// Returns: Array of user objects

// Remember me flag
localStorage.getItem('remember_me')
// Returns: 'true' if checked

// Theme preference
localStorage.getItem('theme')
// Returns: 'light' or 'dark'
```

## 🧪 Testing Checklist

- [ ] Try accessing protected page without login → redirects to login
- [ ] Login with Admin credentials → success redirect
- [ ] Logout button appears after login
- [ ] Click logout → confirmation dialog
- [ ] Confirm logout → redirects to login.html
- [ ] Create new account → works
- [ ] Login with new account → success
- [ ] Session timeout after 30 mins → auto-logout
- [ ] Direct page access with valid auth → works
- [ ] Dark mode toggle still works
- [ ] Mobile responsive logout button → visible

## 🐛 Quick Debug Commands

```javascript
// Check login status
console.log(localStorage.getItem('linguasign_auth'))

// Check current user
const auth = JSON.parse(localStorage.getItem('linguasign_auth') || '{}')
console.log(auth.user)

// Manually force logout
localStorage.removeItem('linguasign_auth')
location.reload()

// Check all users
const users = JSON.parse(localStorage.getItem('linguasign_users') || '[]')
console.log(users)

// Check if page has auth-check.js
console.log(!!window.logout) // Should be true
```

## 📝 Configuration Files

| File | Purpose | Contains |
|------|---------|----------|
| `auth-check.js` | Enforce authentication | Redirect logic, logout button |
| `auth.js` | Login/signup forms | User credentials validation |
| `login.html` | Login page | Login & signup forms |
| `style.css` | Base styling | Theme variables |
| `auth.css` | Auth page styling | Form styles, animations |

## 🔐 Password Requirements (For Signup)

- Minimum 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 number (0-9)
- Special characters optional

Example: `Password123`

## 🎨 Styling Logout Button

Logout button added by auth-check.js uses:
```css
.btn-logout {
  background: linear-gradient(135deg, #ff4757 0%, #ff6348 100%);
  /* Red gradient */
}
```

Customize in `auth-check.js` around line 145-180

## 📊 Page Load Sequence

```
1. HTML loads
2. auth-check.js script tag encountered
3. auth-check.js executes (checks authentication)
4. If not logged in → redirect happens
5. If logged in → continue loading
6. setupLogoutButton() runs on DOMContentLoaded
7. Logout button added to header
8. Page fully loaded with user session
```

## 🚨 If Something Breaks

1. Open browser DevTools (F12)
2. Go to Storage tab
3. Check Application/localStorage
4. Look for `linguasign_auth` key
5. If empty → user not logged in
6. If corrupted → delete it and try again
7. Check Console tab for JavaScript errors

---

**Last Updated**: November 30, 2025
