

## Comprehensive App Improvements (13 Items)

This plan addresses all 13 requested fixes and improvements across the app. Here's what will change:

---

### 1. Desktop Responsive Layout

**New file: `src/components/SideNav.tsx`**
- Desktop-only vertical sidebar (`hidden md:flex`) with Home, Globe links and a Create (+) button
- Uses Phosphor icons and the vintage amber/teal color scheme
- Fixed to the left side, full viewport height

**Modified: `src/components/BottomNav.tsx`**
- Add `md:hidden` to hide on desktop screens

**Modified: `src/App.tsx`**
- Wrap layout in a flex container: SideNav on the left, main content on the right with `md:ml-[sidebar-width]`

**Modified: `src/pages/Index.tsx`**
- Add `max-w-6xl mx-auto` wrapper
- Polaroid strip becomes a responsive grid: `md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- Header text scales up with `md:text-3xl`

**Modified: `src/pages/GlobePage.tsx`**
- `max-w-6xl mx-auto` wrapper, globe min-height `md:min-h-[600px]`

**Modified: `src/pages/TripDetail.tsx`**
- `max-w-4xl mx-auto` wrapper, hero taller on desktop `md:h-72`

**Modified: `src/index.css`**
- `.pb-nav` padding removed on desktop via media query

---

### 2. Trip Sections -- Add/Edit Content

**New file: `src/components/SectionEditor.tsx`**
- A dialog to create new sections (pick type from dropdown, add title)
- For itinerary sections: a structured editor where each item has a time field and an activity/description field
- Users can add multiple items; content stored as JSON array in the `content` column
- Edit existing sections by clicking on them

**Modified: `src/hooks/useTrips.ts`**
- Add `useCreateSection` and `useUpdateSection` mutation hooks

**Modified: `src/pages/TripDetail.tsx`**
- Add "Add Section" button in the Sections tab
- Sections become clickable to open the editor

---

### 3. Itinerary Section -- Treasure Map Theme

**New file: `src/components/ItineraryView.tsx`**
- Renders itinerary items with a parchment/treasure-map background
- Uses X-marks as bullet points instead of standard bullets
- Applies a cartographic/hand-drawn font feel via Playfair Display (already loaded)
- Weathered edges, aged parchment gradient background

**Modified: `src/index.css`**
- Add `.parchment-bg` and `.treasure-map` CSS classes with aged texture, weathered borders

**Modified: `src/pages/TripDetail.tsx`**
- When displaying an itinerary section, render it using `ItineraryView` instead of raw JSON

---

### 4. Cover Photo Logic

**Modified: `src/hooks/useTrips.ts`**
- In `useUploadPhoto`, after inserting the photo record, check if the trip has no `cover_photo_url`. If not, update it with the new photo's public URL
- Invalidate both `trip_photos` and `trips` queries on success

**Modified: `src/components/PhotoGallery.tsx`**
- Add a "Set as Cover" button on each photo (visible on hover)
- Calls `useUpdateTrip` to set `cover_photo_url` on the trip

---

### 5. Trip Name Truncation Fix

**Modified: `src/components/PolaroidCard.tsx`**
- The trip name uses `truncate` CSS class which clips text. The card width `w-52` is too narrow for longer names. On desktop (grid layout), cards will be wider and names won't truncate. On mobile, ensure the `truncate` class doesn't cut off the year portion by slightly increasing card caption area or removing `truncate` from the name field.

This is a CSS issue -- the `truncate` class on `p.font-georgia` in the caption area is cutting the name. The fix is to allow wrapping for the name (`line-clamp-2` instead of `truncate`).

---

### 6. Destination Field Cleanup

**New utility: `src/lib/formatDestination.ts`**
- A `formatDestination(raw: string): string` function that extracts city + country from a full geocoded address
- Logic: split by comma, take first item (city) and last item (country), combine as "City, Country"

**Modified files:** `PolaroidCard.tsx`, `TripDetail.tsx`, `GlobeScene.tsx`, `PublicSharePage.tsx`
- All places that display `trip.destination` will use `formatDestination(trip.destination)` instead of the raw string

---

### 7. Hero Banner Placeholder

**Modified: `src/pages/TripDetail.tsx`**
- Replace the flat grey `bg-gradient-to-br from-amber/20 to-teal/20` with a warm parchment gradient: `bg-gradient-to-br from-amber/30 via-[hsl(38,30%,80%)] to-amber/20`
- Apply the vintage filter overlays (vignette, grain) to the placeholder too (already applied)
- Add a subtle compass or map illustration via CSS background pattern

**Modified: `src/pages/PublicSharePage.tsx`**
- Same parchment placeholder treatment

---

### 8. Polaroid Card Stacking

**Modified: `src/components/PolaroidCard.tsx`**
- The stacked card effect already exists in the current code (bottom card at +3.5deg, middle at -2.2deg, top at +0.8deg). However, the hover effect only does `group-hover:-translate-y-2.5`.
- Update hover to also straighten rotation: `group-hover:!rotate-0 group-hover:-translate-y-2.5`
- Verify the background colors match requested: bottom #DDD4BE, middle #E8DFC8, top uses `bg-polaroid` (should map to #FAF8F3)
- Ensure these render properly and aren't being overridden

---

### 9. Empty State on Home

**Modified: `src/pages/Index.tsx`**
- Replace the plain text empty state with a styled parchment card featuring:
  - A Compass icon (already imported)
  - "No adventures yet" in Georgia/Playfair font
  - "Tap the + button to plan your first trip" subtitle
  - Warm parchment background with vintage treatment

---

### 10. Share Link Visibility

**Modified: `src/pages/TripDetail.tsx`**
- Conditionally render the share bar: only show it when `sections.some(s => s.is_public === true)`
- When no sections are public, hide the share URL bar entirely

---

### 11. Miles Calculation Fix

**Modified: `src/lib/haversine.ts`**
- `totalMiles` currently calculates distance between consecutive trips, which doesn't match the desired behavior
- Change to: sum the distance from a fixed home base coordinate to each PAST trip's lat/lng
- Add a `HOME_BASE` constant (defaulting to a reasonable location -- will need user input or a sensible default like New York: 40.7128, -74.0060)
- Filter to only include past trips (where `end_date` exists and is before today)

**Modified: `src/pages/Index.tsx` and `src/pages/GlobePage.tsx`**
- Pass only past trips to `totalMiles` instead of all trips

---

### 12. Arrivals Tab -- Confirm Full Functionality

The `ArrivalTracker` component already has:
- Add arrival dialog with person name, flight number, arrival date/time, notes fields
- Delete functionality per row
- Table display with all fields

**Status: Already fully implemented.** No changes needed. The existing implementation covers add/delete with all required fields. Edit functionality is not currently present -- will add an edit button that opens the same dialog pre-filled with existing data.

**Modified: `src/components/ArrivalTracker.tsx`**
- Add edit functionality: clicking the pencil icon opens the dialog pre-filled with the arrival data
- Add `useUpdateArrival` hook

**Modified: `src/hooks/useTrips.ts`**
- Add `useUpdateArrival` mutation hook

---

### 13. Share Tab -- Public/Private Toggles

The `ShareSettings` component already has:
- Per-section toggle using Switch
- Always-private types (lodging, arrivals, packing_list, notes, photos) are locked with no toggle
- Toggle calls `useToggleSectionPublic` to save `is_public` to Supabase

**Status: Already implemented correctly.** The existing code checks `ALWAYS_PRIVATE_TYPES` and disables toggles for those types, showing a lock icon instead. No changes needed here.

---

### Summary of All Files

| File | Action |
|------|--------|
| `src/components/SideNav.tsx` | **New** -- desktop sidebar nav |
| `src/components/SectionEditor.tsx` | **New** -- create/edit trip sections |
| `src/components/ItineraryView.tsx` | **New** -- treasure map itinerary renderer |
| `src/lib/formatDestination.ts` | **New** -- destination string cleanup |
| `src/components/BottomNav.tsx` | Add `md:hidden` |
| `src/App.tsx` | Flex layout with SideNav |
| `src/pages/Index.tsx` | Responsive grid, empty state, max-width, miles fix |
| `src/pages/GlobePage.tsx` | Responsive sizing, miles fix |
| `src/pages/TripDetail.tsx` | Responsive, section editor, share link conditional, hero placeholder, itinerary view |
| `src/pages/PublicSharePage.tsx` | Hero placeholder, destination cleanup |
| `src/components/PolaroidCard.tsx` | Responsive sizing, name truncation fix, destination cleanup, hover fix |
| `src/components/GlobeScene.tsx` | Destination cleanup |
| `src/components/PhotoGallery.tsx` | "Set as Cover" button |
| `src/components/ArrivalTracker.tsx` | Add edit functionality |
| `src/hooks/useTrips.ts` | Cover photo auto-set, section CRUD hooks, arrival update hook |
| `src/lib/haversine.ts` | Fix miles calculation for past trips from home base |
| `src/index.css` | Desktop pb-nav fix, parchment/treasure-map CSS |

