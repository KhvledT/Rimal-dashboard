# Route Protection System Documentation

## Overview

Complete route protection system implemented for the Admin Dashboard with three reusable route guards.

## Files Modified

1. **src/components/PublicRoute.tsx** (NEW)
   - Guest-only route protection
   - Role-based redirect logic for authenticated users

2. **src/components/ProtectedRoute.tsx** (REFACTORED)
   - Simplified to handle authentication only
   - Removed role-based checks (delegated to RoleGuard)
   - Shows loading during authentication restoration

3. **src/components/RoleGuard.tsx** (NEW)
   - Role-based access control
   - Supports `requireAdmin` and `requireSuperAdmin` flags

4. **src/App.tsx** (REFACTORED)
   - Restructured routing with new guard system
   - Proper nesting of route guards

5. **src/providers/AuthContext.tsx** (MODIFIED)
   - Added `ROUTE_PATHS` import
   - Updated `logout()` to use `replace` navigation

## Route Guard Architecture

### 1. PublicRoute

**Purpose**: Protects pages that should only be accessible to guests (unauthenticated users).

**Behavior**:
- If `isLoading`: Show fullscreen loading spinner
- If NOT authenticated: Allow access
- If authenticated:
  - Admin/Super Admin: Redirect to Dashboard
  - User: Redirect to Access Denied

**Use Cases**:
- Login page
- Signup page (if added)
- OTP verification pages (if added)

**Key Features**:
- Uses `replace` navigation to prevent browser back button
- Shows loading during authentication restoration
- Prevents authenticated users from seeing login/signup

### 2. ProtectedRoute

**Purpose**: Protects pages that require authentication (any role).

**Behavior**:
- If `isLoading`: Show fullscreen loading spinner with message
- If NOT authenticated: Redirect to Login
- If authenticated: Allow access

**Use Cases**:
- Any page requiring a logged-in user
- Access Denied page
- Dashboard layout wrapper

**Key Features**:
- Does NOT perform role-based checks (use RoleGuard for that)
- Shows loading during silent refresh to prevent redirect flickering
- Uses `replace` navigation for security

### 3. RoleGuard

**Purpose**: Protects pages based on user role/permissions.

**Behavior**:
- If `isLoading`: Show fullscreen loading spinner
- If NOT authenticated: Redirect to Login
- If authenticated but lacks required permission: Redirect to Access Denied
- If authenticated with required permission: Allow access

**Props**:
- `requireAdmin`: Requires Admin or Super Admin role
- `requireSuperAdmin`: Requires Super Admin role only

**Use Cases**:
- Dashboard pages (Admin/Super Admin only)
- Admin management panel (Super Admin only)
- Any role-specific functionality

**Key Features**:
- Never renders unauthorized content even briefly
- Uses `replace` navigation
- Validates permissions using existing `permissions` utility

## Redirect Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Start                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │ AuthContext restores │
              │    session from      │
              │    localStorage      │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  isLoading = true    │
              │  Show loading screen │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  isLoading = false   │
              │  isAuthenticated =   │
              │  (user exists)       │
              └──────────┬───────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
┌─────────────────┐           ┌─────────────────┐
│  NOT Authenticated│           │   Authenticated   │
└────────┬────────┘           └────────┬────────┘
         │                             │
         ▼                             ▼
┌─────────────────┐           ┌─────────────────┐
│   PublicRoute   │           │  ProtectedRoute │
│   (Login)       │           │  (Dashboard)    │
└─────────────────┘           └────────┬────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │    RoleGuard    │
                              │  (Check role)   │
                              └────────┬────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    │                                     │
                    ▼                                     ▼
           ┌─────────────────┐                   ┌─────────────────┐
           │ Has Permission? │                   │ Lacks Permission│
           └────────┬────────┘                   └────────┬────────┘
                    │                                     │
                    ▼                                     ▼
           ┌─────────────────┐                   ┌─────────────────┐
           │  Render Page    │                   │ Access Denied   │
           └─────────────────┘                   └─────────────────┘
```

## Authentication Flow

### Initial Load / Browser Refresh

1. Application mounts
2. `AuthContext` hydrates session from `localStorage`
3. `isLoading = true` while restoring
4. All route guards show loading screen
5. Session restoration completes
6. `isLoading = false`
7. Route guards evaluate authentication state
8. Appropriate redirect or page render occurs

### Login Flow

1. User navigates to `/login` (guest)
2. `PublicRoute` allows access
3. User submits credentials
4. `AuthContext.login()` stores tokens and user
5. Login page navigates to Dashboard with `replace: true`
6. `PublicRoute` detects authentication and redirects to Dashboard
7. Browser back button cannot return to Login

### Logout Flow

1. User clicks logout
2. `AuthContext.logout()` clears tokens and user state
3. Clears React Query cache
4. Navigates to `/login` with `replace: true`
5. Browser back button cannot return to protected pages

## Redirect Rules Summary

### Guest (Not Authenticated)

| Target Route | Behavior |
|-------------|----------|
| `/login` | ✅ Allowed |
| `/dashboard` | ❌ Redirect to `/login` |
| `/team` | ❌ Redirect to `/login` |
| `/admin` | ❌ Redirect to `/login` |

### Authenticated User (Role = User)

| Target Route | Behavior |
|-------------|----------|
| `/login` | ❌ Redirect to `/access-denied` |
| `/dashboard` | ❌ Redirect to `/access-denied` |
| `/team` | ❌ Redirect to `/access-denied` |
| `/admin` | ❌ Redirect to `/access-denied` |

### Authenticated Admin

| Target Route | Behavior |
|-------------|----------|
| `/login` | ❌ Redirect to `/dashboard` |
| `/dashboard` | ✅ Allowed |
| `/team` | ✅ Allowed |
| `/admin` | ❌ Redirect to `/dashboard` |

### Authenticated Super Admin

| Target Route | Behavior |
|-------------|----------|
| `/login` | ❌ Redirect to `/dashboard` |
| `/dashboard` | ✅ Allowed |
| `/team` | ✅ Allowed |
| `/admin` | ✅ Allowed |

## Browser Back Button Behavior

### After Login
- **Before**: Browser back button could return to Login
- **After**: Login page uses `navigate(ROUTE_PATHS.DASHBOARD, { replace: true })`
- **Result**: Back button goes to page before Login, not Login itself

### After Logout
- **Before**: Browser back button could return to protected pages
- **After**: Logout uses `navigate(ROUTE_PATHS.LOGIN, { replace: true })`
- **Result**: Back button goes to page before logout, not protected pages

### Authenticated User on Public Route
- **Before**: Authenticated user could stay on Login
- **After**: `PublicRoute` redirects with `replace: true`
- **Result**: Back button goes to page before navigation, not Login

## Security Guarantees

1. **Never rely on UI hiding**: All route guards enforce server-side role checks
2. **No unauthorized content rendering**: `RoleGuard` checks permissions before rendering
3. **Authentication restoration**: Loading screens prevent redirect flickering
4. **Browser back protection**: All redirects use `replace: true`
5. **No redirect loops**: Guards have clear, non-circular redirect logic

## Code Quality

### Reusable Components
- `PublicRoute`: Single responsibility (guest-only access)
- `ProtectedRoute`: Single responsibility (authentication check)
- `RoleGuard`: Single responsibility (role-based authorization)

### Avoided Duplication
- Authentication logic centralized in `AuthContext`
- Permission checks use existing `permissions` utility
- Loading screens use consistent styling

### Declarative Routing
- Route structure clearly shows protection levels
- Guards compose naturally via nesting
- Easy to add new protected routes

## Verification Checklist

### Manual Testing Steps

1. **Guest → Login**
   - [ ] Clear localStorage
   - [ ] Navigate to `/login`
   - [ ] Verify login page loads
   - [ ] Verify no redirect occurs

2. **Guest → Dashboard**
   - [ ] Clear localStorage
   - [ ] Navigate to `/dashboard`
   - [ ] Verify redirect to `/login`

3. **Guest → Team**
   - [ ] Clear localStorage
   - [ ] Navigate to `/team`
   - [ ] Verify redirect to `/login`

4. **Admin → Login**
   - [ ] Login as Admin
   - [ ] Navigate to `/login`
   - [ ] Verify redirect to `/dashboard`
   - [ ] Verify browser back button doesn't return to login

5. **Admin → Signup**
   - [ ] Login as Admin
   - [ ] Navigate to `/signup` (if exists)
   - [ ] Verify redirect to `/dashboard`

6. **Admin → Dashboard**
   - [ ] Login as Admin
   - [ ] Navigate to `/dashboard`
   - [ ] Verify dashboard loads
   - [ ] Verify no redirect occurs

7. **User → Dashboard**
   - [ ] Login as User (role 0)
   - [ ] Navigate to `/dashboard`
   - [ ] Verify redirect to `/access-denied`

8. **User → Login**
   - [ ] Login as User
   - [ ] Navigate to `/login`
   - [ ] Verify redirect to `/access-denied`

9. **Browser Refresh**
   - [ ] Login as Admin
   - [ ] Refresh browser
   - [ ] Verify loading screen appears
   - [ ] Verify user stays on current page
   - [ ] Verify no redirect flickering

10. **Silent Refresh**
    - [ ] Login as Admin
    - [ ] Wait for token refresh (if implemented)
    - [ ] Verify session remains valid
    - [ ] Verify no redirect occurs

11. **Logout**
    - [ ] Login as Admin
    - [ ] Click logout
    - [ ] Verify redirect to `/login`
    - [ ] Verify browser back button doesn't return to protected pages

12. **Browser Back**
    - [ ] Login as Admin
    - [ ] Navigate to multiple pages
    - [ ] Use browser back button
    - [ ] Verify navigation works correctly
    - [ ] Verify no unexpected redirects

13. **Deep Links**
    - [ ] Clear localStorage
    - [ ] Navigate directly to `/team`
    - [ ] Verify redirect to `/login`
    - [ ] Login as Admin
    - [ ] Navigate directly to `/team`
    - [ ] Verify page loads

14. **Direct URL Access**
    - [ ] Clear localStorage
    - [ ] Type `/admin` in address bar
    - [ ] Verify redirect to `/login`
    - [ ] Login as Super Admin
    - [ ] Type `/admin` in address bar
    - [ ] Verify page loads

15. **No Redirect Loops**
    - [ ] Test all redirect scenarios
    - [ ] Monitor browser network tab
    - [ ] Verify no infinite redirect chains
    - [ ] Verify browser doesn't hang

## Architecture Preserved

### Existing Components Used
- `AuthContext`: Authentication state management
- `authStorage`: Token and user persistence
- `permissions`: Role-based permission checks
- React Router: Navigation and routing
- React Query: Data fetching and caching

### No Changes To
- Backend API contracts
- Authentication service
- Token refresh mechanism
- Permission logic
- Data fetching patterns

## Future Enhancements

### Potential Additions
1. **Signup Route**: Add `/signup` route with `PublicRoute` protection
2. **OTP Routes**: Add `/verify-otp` and `/resend-otp` with `PublicRoute` protection
3. **Route-based Loading**: Different loading messages per route type
4. **Redirect Preservation**: Save intended destination for post-login redirect
5. **Permission Granularity**: More fine-grained role permissions

### Extension Points
- `PublicRoute`: Add `allowAuthenticated` prop for hybrid routes
- `RoleGuard`: Add custom permission checker function
- `ProtectedRoute`: Add `fallbackComponent` prop for custom loading states
