

## Plan

### 1. Improve Trip Title Readability

**Problem**: The trip title/destination text over cover photos is hard to read, as shown in the uploaded screenshot (e.g., "Colombia 2026" blending into a dark background).

**Solution**: Add a semi-transparent dark card/backdrop behind the text in both places where trip titles overlay cover images:

- **`src/pages/TripDetail.tsx`** (lines 103-112): Wrap the title + destination text block in a rounded container with a dark semi-transparent background (`bg-black/50 backdrop-blur-sm`) and padding. This creates a frosted-glass card effect that ensures legibility regardless of the cover photo.

- **`src/components/HeroCard.tsx`** (lines 86-105): Apply the same frosted-glass card treatment to the bottom text content area (trip name, destination, countdown badge).

The card style will use: `bg-black/45 backdrop-blur-sm rounded-xl px-4 py-3` -- subtle enough to feel integrated with the pirate/vintage theme but providing strong contrast for text.

### 2. Add Admin "Manage Users" Page

**Problem**: No way for the admin to view all registered users, their profiles, and invite status.

**Solution**: Create a new "Users" page accessible from the side nav (admin only) that queries `user_profiles` and `auth.users` metadata via a Supabase edge function.

#### Database Changes
- Create a `user_roles` table following the security guidelines (enum `app_role` with values `admin`, `moderator`, `user`), a `has_role()` security definer function, and seed the current user as admin.

#### Edge Function
- **`supabase/functions/admin-users/index.ts`**: A secure edge function that:
  - Verifies the caller has the `admin` role via `has_role()`
  - Queries `auth.admin.listUsers()` using the service role key to get all users with their email, created_at, last_sign_in_at, and confirmation status
  - Joins with `user_profiles` for display names and avatars
  - Returns a combined user list

#### Frontend Changes
- **`src/pages/AdminUsers.tsx`**: New page with a table showing each user's display name, email, sign-up date, last sign-in, and confirmation/invite status. Uses the admin edge function to fetch data.
- **`src/components/SideNav.tsx`**: Add a "Users" nav item (with a `UsersThree` icon) that only appears when the current user has the `admin` role. This requires a small hook or query to check the user's role.
- **`src/components/BottomNav.tsx`**: Similarly add the Users link for mobile if admin.
- **`src/App.tsx`**: Add a protected route for `/admin/users`.

---

### Technical Details

**Title card CSS approach:**
```
bg-black/45 backdrop-blur-sm rounded-xl px-4 py-3 inline-block
```
Applied as a wrapper `<div>` around the text content, positioned at the bottom-left of the cover area.

**User roles table (migration SQL):**
```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
CREATE TABLE public.user_roles (...);
-- RLS + has_role() security definer function
-- Seed current user as admin
```

**Edge function** uses `supabase.auth.admin.listUsers()` (requires `SUPABASE_SERVICE_ROLE_KEY`) and cross-references `user_profiles` for display data. Only callable by users with the `admin` role.

**Files to create:**
- `supabase/functions/admin-users/index.ts`
- `src/pages/AdminUsers.tsx`

**Files to modify:**
- `src/pages/TripDetail.tsx` -- add backdrop card around title
- `src/components/HeroCard.tsx` -- add backdrop card around title
- `src/components/SideNav.tsx` -- add admin-only Users nav item
- `src/components/BottomNav.tsx` -- add admin-only Users nav item
- `src/App.tsx` -- add /admin/users route
- New migration for `user_roles` table + `has_role()` function

