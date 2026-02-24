

## Fix: Mobile Zoom Issue After Login

### Problem
After logging in on mobile, the page is wider than the viewport, forcing you to zoom out. This happens because several elements extend beyond the screen width:

- **Polaroid card stacks** use CSS transforms (rotation + translation) that push content outside their containers
- **The horizontal trip strip** on the Home page can bleed past the edges
- **No overflow guard** exists on the main page wrapper to clip these elements

### Solution
Add `overflow-x-hidden` to the main content wrapper in `App.tsx` to prevent any child content from expanding the page width beyond the viewport.

---

### Technical Details

**File: `src/App.tsx`**

Update the `<main>` element in `AppLayout` to include `overflow-x-hidden`:

```tsx
<main className={`flex-1 overflow-x-hidden animate-page-enter ${user ? "md:ml-[200px]" : ""}`}>
```

This single change clips any overflowing content (rotated cards, scrollable strips) at the main content boundary, preventing the browser from expanding the viewport width on mobile.

No other files need to change — the root cause is simply a missing overflow guard on the layout wrapper.

