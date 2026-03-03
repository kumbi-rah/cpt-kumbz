

# Combined Plan: All Pending Changes

This plan consolidates every outstanding request into a single implementation pass.

---

## 1. Supabase Database: Crew Visibility + Photo Access (Migration)

Add RLS policies so crew members can actually see and interact with trips they've been added to.

**New policies to create via migration:**

- **trips table** -- crew SELECT: Allow crew members to view trips where they exist in `trip_crew`
- **trip_photos table** -- crew SELECT, INSERT, DELETE: Allow crew to view all trip photos, upload their own, and delete their own
- **arrivals table** -- crew SELECT: Allow crew members to view arrivals for trips they belong to
- **trip_sections table** -- crew SELECT: Allow crew members to view trip sections

**Storage bucket** -- Add policies on `storage.objects` for the `trip-photos` bucket so crew members can upload and read files.

---

## 2. Cover Photo Text Readability

Make trip titles always readable regardless of background image.

**File: `src/index.css`**
- Add a `.text-shadow-cover` utility class with multi-layer shadows

**File: `src/pages/TripDetail.tsx`**
- Add `text-shadow-cover` class to the `h1` trip name and destination `p` tag
- Strengthen the gradient overlay to go darker at the bottom (increase from 0.88 to 0.95)

**File: `src/components/HeroCard.tsx`**
- Add `text-shadow-cover` class to the trip name `h2` and destination `p` tag

---

## 3. Delete Trip Feature

**File: `src/components/TripDetails.tsx`**
- Add a "Danger Zone" section at the bottom (owner-only) with a red "Delete Trip" button
- Use `AlertDialog` for confirmation before deletion
- On confirm: delete related records from `arrivals`, `trip_sections`, `itinerary_items`, `trip_lodging`, `trip_messages`, `message_reactions`, `trip_crew`, and `trip_photos`, then delete the trip itself
- Navigate to `/trips` after successful deletion
- New imports: `AlertDialog` components, `useNavigate`, `Trash` icon

---

## 4. Mobile-Friendly Popup Dialogs for Editing

Replace cramped inline forms with full-width popup dialogs.

### File: `src/components/TripItinerary.tsx`
- Replace inline add-activity form (the dashed border card in the timeline) with a `Dialog`
- "Add Activity" and "Add Day" buttons open the dialog instead of showing inline inputs
- Dialog contains: Time input, Activity name, Notes textarea, Save/Cancel
- Uses `max-w-md w-[95vw] max-h-[85vh] overflow-y-auto` for mobile comfort

### File: `src/components/TripLodging.tsx`
- Replace both the inline "add" and "edit" form blocks with a single `Dialog`
- "Add Lodging" / edit pencil icon opens the dialog
- Dialog contains all fields: Name, Address, Check-in/out times, Listing Link, Notes
- Same responsive sizing as above

### File: `src/components/TripPacking.tsx`
- Replace the inline textarea editing mode with a `Dialog`
- "Edit" / "Create Packing List" opens the dialog with the full-height textarea
- Save/Cancel buttons in the dialog footer

---

## Summary of All Changes

| Resource | Change |
|---|---|
| Supabase migration | RLS policies for crew on `trips`, `trip_photos`, `arrivals`, `trip_sections`, `storage.objects` |
| `src/index.css` | Add `.text-shadow-cover` CSS utility |
| `src/pages/TripDetail.tsx` | Apply text shadow + stronger gradient on cover |
| `src/components/HeroCard.tsx` | Apply text shadow to title/destination |
| `src/components/TripDetails.tsx` | Add Delete Trip with AlertDialog confirmation |
| `src/components/TripItinerary.tsx` | Move add-activity form into Dialog |
| `src/components/TripLodging.tsx` | Move add/edit lodging form into Dialog |
| `src/components/TripPacking.tsx` | Move edit packing list into Dialog |

