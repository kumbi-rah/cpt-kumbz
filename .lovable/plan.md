

## Replace Destination Input with Location Search Dropdown

Replace the separate Destination + Lat/Long fields in the Create Trip dialog with a searchable location dropdown that auto-fills all three values.

### How it works

- The Destination field becomes a searchable combobox (using the existing `cmdk` / Command component already installed)
- As the user types, it queries the **OpenStreetMap Nominatim** geocoding API (free, no API key required)
- Results appear in a dropdown showing place names
- Selecting a result auto-fills `destination`, `lat`, and `lng`
- The Lat/Long fields are removed from the form since they're handled automatically

### User experience

1. User types "Paris" in the destination field
2. A dropdown appears with results like "Paris, France", "Paris, Texas, USA", etc.
3. User selects one -- destination name, latitude, and longitude are all set
4. The rest of the form (trip name, dates) stays the same

### Technical details

**File: `src/components/CreateTripDialog.tsx`**
- Remove the separate Lat/Long input fields
- Replace the Destination `<Input>` with a `<Popover>` + `<Command>` combobox pattern
- Add a debounced search state that calls `https://nominatim.openstreetmap.org/search?q=...&format=json&limit=5`
- On selection, set `destination` (display name), `lat`, and `lng` in form state
- Add a `useEffect` with a ~400ms debounce for the API call to avoid excessive requests

**No new dependencies needed** -- `cmdk` is already installed, and the Popover + Command UI components already exist in the project.

