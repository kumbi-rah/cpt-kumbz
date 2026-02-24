

# Pirate / Explorer Iconography Overhaul

A comprehensive visual theming pass to weave pirate and explorer elements throughout the entire Cpt. Kumbz Adventures app.

---

## 1. New Shared Components and Assets

### SVG Components (new files)
- **`src/components/icons/CompassRose.tsx`** -- Custom SVG compass rose with N/S/E/W in amber and ink, replacing the Phosphor `Compass` icon in the header, auth page, and public share page.
- **`src/components/icons/WaxSeal.tsx`** -- Small circular SVG with anchor/compass motif, used on polaroid cards and share link bar.
- **`src/components/icons/RopeDivider.tsx`** -- Horizontal rope/knot SVG used as a decorative divider in multiple spots.

### Utility: Roman Numerals
- **`src/lib/romanNumerals.ts`** -- Helper `toRoman(n: number): string` for converting day numbers (1 -> I, 2 -> II, etc.) used in itinerary day headers.

---

## 2. CSS and Tailwind Changes

### `src/index.css`
- Change skeleton pulse color from grey (`bg-muted`) to amber-tinted pulse
- Add `@keyframes scroll-unfold` for page transition (content slides in like a scroll opening)
- Add `.animate-scroll-unfold` utility class
- Add `.rope-border` class for a repeating rope pattern border image
- Add `.section-header-line` style for `-- TITLE --` amber line decoration

### `tailwind.config.ts`
- Add `scroll-unfold` keyframe and animation to the config

### `src/components/ui/skeleton.tsx`
- Change default skeleton color from `bg-muted` to an amber-tinted pulse: `bg-amber/20` with amber shimmer

---

## 3. Navigation Overhaul

### `src/components/SideNav.tsx`
- Replace `House` icon with inline `CompassRose` SVG (smaller)
- Replace `GlobeHemisphereWest` with `Anchor` from Phosphor (ship's wheel: `SteeringWheel` from Phosphor)  
- Replace `Plus` in "New Trip" button with `Anchor` icon
- Brand logo: swap `Compass` for the new `CompassRose` component

### `src/components/BottomNav.tsx`
- Same icon swaps as SideNav: compass rose for Home, steering wheel for Globe, anchor for New Trip

---

## 4. Auth Page (Split Layout)

### `src/pages/Auth.tsx`
- Convert to split layout: left half shows a parchment-toned panel with the compass rose, app title, and a decorative quote ("Every voyage begins with a single step...") 
- Right half keeps the login card, enlarged
- Replace `Compass` icon with `CompassRose` component
- Add subtle jolly roger / anchor watermark behind title at low opacity

---

## 5. Home Dashboard (`src/pages/Index.tsx`)

- Replace `Compass` icon in mobile header with `CompassRose`
- Add a "Next Adventure" spotlight card above the trip grid showing the nearest upcoming trip with:
  - Anchor icon prefix: "X days until departure"
  - Aged parchment corner fold decoration (CSS pseudo-elements)
- Add `RopeDivider` between the spotlight and the trip cards section
- Add scroll-unfold entrance animation to main content
- Section headers get `-- TITLE --` amber decorative line style

---

## 6. Polaroid Cards (`src/components/PolaroidCard.tsx`)

- Add a small wax seal stamp (amber circle with anchor silhouette) in the bottom-right corner of the photo area using the `WaxSeal` component
- Empty state (in Index.tsx): replace the simple compass empty state with a full parchment illustration showing a "message in a bottle" motif and ocean-toned background

---

## 7. Globe Page

### `src/pages/GlobePage.tsx`
- Add "Here Be Dragons" text in small italic Cinzel font below the globe
- Add `RopeDivider` above the stats footer

### `src/components/GlobeScene.tsx`
- Add dashed route lines (nautical chart style) between pinned trip destinations using `THREE.Line` with a dashed material connecting sequential trip pins

---

## 8. Trip Detail (`src/pages/TripDetail.tsx`)

- Update `SECTION_ICONS` mapping to pirate-themed Phosphor icons:
  - itinerary -> `Scroll` (or `MapTrifold`)
  - recommendations -> `Star` (keep, gold star)
  - packing_list -> `Treasure` (or `Package`)
  - lodging -> `Anchor`
  - arrivals -> `Binoculars`
  - notes -> `Scroll`
  - photos -> `Camera` (keep)
- Share link bar: add `WaxSeal` icon next to URL
- Public badge: replace globe emoji text with `Flag` icon from Phosphor
- Rename "Arrivals" tab to "The Crew"
- Section headers get the `-- TITLE --` amber line treatment

---

## 9. Arrivals / "The Crew" (`src/components/ArrivalTracker.tsx`)

- Rename heading from "Arrivals" to "The Crew"
- Each arrival card: add a small `Anchor` icon next to the person name (replacing `AirplaneTakeoff`)
- Empty state text: "No crew members yet -- who's joining the voyage?" with anchor icon
- Sheet title: "Add Crew Member" / "Edit Crew Member"

---

## 10. Itinerary View (`src/components/ItineraryView.tsx`)

- Day headers: convert "Day 1" to "Day I" using Roman numerals via `toRoman()` helper
- Day headers: use Cinzel font (already present) with amber `-- Day I --` decorative line style

---

## 11. Toast Notifications

### `src/components/ui/sonner.tsx` or toast integration
- Add a small anchor icon (unicode or inline SVG) as a prefix to toast messages via the Sonner `icon` prop or custom toast styling

---

## 12. Page Transitions

### `src/App.tsx`
- Wrap route content in an animated container that applies the `animate-scroll-unfold` class on mount for a subtle scroll-opening effect

---

## 13. Typography Accents (global)

- Section headers throughout (`TripDetail`, `ArrivalTracker`, `PhotoGallery`, `ShareSettings`) get the amber decorative line treatment: a reusable `SectionHeader` component or CSS class that renders `-- TITLE --` with thin amber lines on each side

---

## Files Changed Summary

| File | Action |
|------|--------|
| `src/components/icons/CompassRose.tsx` | Create |
| `src/components/icons/WaxSeal.tsx` | Create |
| `src/components/icons/RopeDivider.tsx` | Create |
| `src/lib/romanNumerals.ts` | Create |
| `src/index.css` | Modify (new animations, rope border, section header styles, amber skeleton) |
| `tailwind.config.ts` | Modify (new keyframes) |
| `src/components/ui/skeleton.tsx` | Modify (amber pulse) |
| `src/components/SideNav.tsx` | Modify (icon swaps) |
| `src/components/BottomNav.tsx` | Modify (icon swaps) |
| `src/pages/Auth.tsx` | Modify (split layout + compass rose) |
| `src/pages/Index.tsx` | Modify (next adventure card, rope divider, compass rose, empty state) |
| `src/components/PolaroidCard.tsx` | Modify (wax seal) |
| `src/pages/GlobePage.tsx` | Modify (Here Be Dragons, rope divider) |
| `src/components/GlobeScene.tsx` | Modify (route lines between pins) |
| `src/pages/TripDetail.tsx` | Modify (icons, tab rename, wax seal, section headers) |
| `src/components/ArrivalTracker.tsx` | Modify (rename, icons, empty state) |
| `src/components/ItineraryView.tsx` | Modify (Roman numerals, header style) |
| `src/components/PhotoGallery.tsx` | Modify (section header style) |
| `src/components/ShareSettings.tsx` | Modify (section header style) |
| `src/App.tsx` | Modify (page transition wrapper) |
| `src/components/ui/sonner.tsx` | Modify (anchor icon in toasts) |

