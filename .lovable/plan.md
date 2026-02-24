

## Migrate Itinerary to `itinerary_items` Table + Pirate Treasure Map Styling

### What changes

**Part 1: Data layer -- use `itinerary_items` table instead of JSONB**

The `itinerary_items` table already exists in Supabase with columns: `id`, `trip_id`, `day_number`, `item_time`, `activity`, `description`, `sort_order`, `created_at`. Currently the app stores itinerary data as JSON inside `trip_sections.content`. We'll switch to reading/writing from this dedicated table.

**Part 2: Treasure map visual overhaul**

Replace the current simple parchment styling with a full pirate treasure map aesthetic -- dashed SVG trail lines connecting items, hand-drawn X markers, cartographic Google Font (IM Fell English), deep sepia toning, and weathered edge effects.

**Part 3: UI/UX improvement suggestions** (analysis provided at the end)

---

### Technical Details

**File: `index.html`**
- Add Google Font import for "IM Fell English" (serif, cartographic feel)

**File: `src/hooks/useTrips.ts`**
- Define an `ItineraryItem` type manually (since the table isn't in the generated types, we'll use raw Supabase queries with explicit typing):
  ```
  { id: string; trip_id: string; day_number: number; item_time: string | null;
    activity: string; description: string | null; sort_order: number; created_at: string }
  ```
- Add `useItineraryItems(tripId)` -- fetches from `itinerary_items` where `trip_id = tripId`, ordered by `day_number`, then `sort_order`
- Add `useCreateItineraryItem()` -- inserts a row into `itinerary_items`
- Add `useUpdateItineraryItem()` -- updates a row by id
- Add `useDeleteItineraryItem()` -- deletes a row by id
- Add `useBulkUpsertItineraryItems()` -- for saving the entire editor state (delete removed items, upsert current items)

**File: `src/components/SectionEditor.tsx`**
- When editing an itinerary section, load items from `useItineraryItems(tripId)` instead of parsing `section.content`
- Editor fields per item: `day_number` (number input), `item_time` (text), `activity` (text), `description` (optional textarea)
- Group items by day in the editor UI with "Add Day" and "Add Item" buttons
- On save, bulk upsert items to `itinerary_items` table (delete removed, insert new, update existing)
- Non-itinerary sections continue using `trip_sections.content` JSONB as before

**File: `src/components/ItineraryView.tsx`** (major rewrite)
- Fetch items from `useItineraryItems(tripId)` instead of reading `section.content`
- Group items by `day_number` and render each day as a section
- Visual overhaul:
  - Full parchment background with CSS texture (layered radial gradients simulating stains/aging)
  - Weathered edges using `box-shadow` insets and a torn-paper border effect
  - Each item marked with a hand-drawn style dark ink X character
  - SVG dashed vertical line connecting each X to the next (like a dotted trail on a map)
  - Use "IM Fell English" font for all itinerary text
  - Sepia color palette: dark brown ink (#3B2F1E), faded amber accents
  - Day headers styled like map region labels with decorative underlines

**File: `src/pages/TripDetail.tsx`**
- Pass `tripId` to `ItineraryView` (it currently only receives `section`)
- Update the click handler for itinerary sections to pass both section and tripId context

**File: `src/pages/PublicSharePage.tsx`**
- Same update: pass `tripId` to `ItineraryView` for public display

**File: `src/index.css`**
- Enhanced `.parchment-bg` class with more realistic aged texture
- New `.treasure-map-text` class using "IM Fell English" font
- New `.weathered-edges` class for the torn/burned border effect
- CSS for the dashed trail connector

---

### Visual Design (Treasure Map Theme)

The itinerary view will look like an old explorer's map with:
- **Background**: Multi-layered parchment gradient with subtle stain spots (radial gradients)
- **Edges**: Inset shadows creating a burnt/weathered border appearance
- **X Markers**: Dark ink X characters (not emoji), styled large and slightly rotated for a hand-drawn feel
- **Trail Line**: An SVG with a dashed stroke connecting each X vertically, like a dotted path on a treasure map
- **Typography**: "IM Fell English" Google Font -- an old-style serif that looks hand-set
- **Day Headers**: Styled like map region labels with small decorative flourishes
- **Colors**: Deep brown ink (#3B2F1E), warm amber (#B8860B), faded parchment (#F5E6C8)

---

### UI/UX Improvement Suggestions

After analyzing the full app, here are best-practice improvements to consider for future iterations:

1. **Loading skeletons instead of italic text** -- Replace "Loading..." text with skeleton placeholder components (shimmer cards, skeleton rows) for a more polished perceived performance
2. **Toast feedback on all mutations** -- Some actions like "Set as Cover" and section toggles should show success/error toasts consistently
3. **Confirm dialogs for destructive actions** -- Deleting photos, sections, and arrivals should use an AlertDialog confirmation rather than instant deletion
4. **Keyboard accessibility** -- Many interactive elements use `<div onClick>` instead of `<button>`. These should be semantic buttons or have `role="button"` + `tabIndex` + `onKeyDown`
5. **Form validation** -- The Create Trip and Section Editor dialogs lack input validation (e.g., required trip name, date range validation). Add zod schemas with react-hook-form
6. **Optimistic updates** -- Mutations like toggling section visibility or reordering could use optimistic updates for snappier UX
7. **Drag-and-drop reordering** -- Itinerary items and sections would benefit from drag-to-reorder rather than manual sort_order
8. **Dark mode polish** -- The dark mode variables exist but some components (parchment bg, polaroid cards) may not adapt well. Test and adjust
9. **Image optimization** -- Cover photos are served at full resolution. Consider using Supabase image transforms or `srcSet` for responsive image loading
10. **Empty state illustrations** -- The globe and trip detail pages could use more engaging empty states with illustrations rather than plain text

---

### Summary of files changed

| File | Change |
|------|--------|
| `index.html` | Add IM Fell English Google Font |
| `src/hooks/useTrips.ts` | Add itinerary_items CRUD hooks + type |
| `src/components/SectionEditor.tsx` | Rewrite itinerary editing to use itinerary_items table, grouped by day |
| `src/components/ItineraryView.tsx` | Major rewrite: fetch from DB, treasure map styling with SVG trail |
| `src/pages/TripDetail.tsx` | Pass tripId to ItineraryView |
| `src/pages/PublicSharePage.tsx` | Pass tripId to ItineraryView |
| `src/index.css` | Enhanced parchment, weathered edges, treasure map font classes |

