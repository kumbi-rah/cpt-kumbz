

## Add Sign Out Button to Home Screen Header

A small change to the Home screen header to add a sign out button.

### What will change

The header in `src/pages/Index.tsx` will get a sign out icon button (using Phosphor Icons `SignOut` icon, duotone style) aligned to the right side of the header row. Tapping it will call `signOut()` from the `AuthContext`.

### Technical details

**File: `src/pages/Index.tsx`**
- Import `SignOut` from `@phosphor-icons/react`
- Import `signOut` from `useAuth()` (already imported)
- Add a sign out button to the right side of the existing header flex container using `justify-between`
- Button styled as a ghost icon button with `text-muted-foreground hover:text-ink` to keep it subtle

