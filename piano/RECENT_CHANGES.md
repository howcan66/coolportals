# Recent Changes - v2.1.0-dev (Jan 31, 2026)

## Bug Fixes

### 1. Default Song Data Corruption - FIXED
**Problem:** Mismatched title "Let It Be" with "Forever Young" lyrics
**Solution:** 
- Cleared DEFAULT_TITLE and DEFAULT_CHORDS (now empty strings)
- Added automatic one-time cleanup in R2A.html (clears old corrupted localStorage on load)
- Cleared Sample.html default data

**Files Modified:**
- R2A.html (lines 231-232, 250-258)
- Sample.html (line 465)

### 2. Sample Counter Not Updating - FIXED
**Problem:** After importing samples in Sample.html, the counter in R2A header didn't update
**Solution:**
- Sample.html sends `SAMPLES_UPDATED` message after import
- frame.html routes message to R2A
- R2A listens and calls `updateSampleDisplay()`

**Files Modified:**
- Sample.html (lines 526-530)
- frame.html (lines 667-675)
- R2A.html (lines 791-796)

### 3. Single-Letter Chord Bug - FIXED (Earlier)
**Problem:** G, D, C chords rejected by minimum length check
**Solution:** Removed bad length validation

### 4. B6 Clear R3 - COMPLETED
**Problem:** B6 only cleared R2A, not R3
**Solution:** Added R3_CLEAR_ALL message routing

## Testing Checklist (Handheld Mode - Edge DevTools)

### Setup
1. Open Edge browser
2. F12 → DevTools
3. Toggle device toolbar (Ctrl+Shift+M)
4. Set to iPad or similar (≤1024px width)
5. Navigate to: `file:///c:/Git/coolportals/piano/frame.html`
6. **First load will auto-clear old data** (check Console for "Force clearing old data")

### Test 1: Empty Default
- [ ] R2A textarea should be EMPTY (no "Let It Be" or "Forever Young")
- [ ] Sample counter shows `?/?` (no samples yet)

### Test 2: Import Samples
- [ ] Click Sample Management icon
- [ ] Import a .txt file with samples
- [ ] Check "Successfully added X samples" message
- [ ] **CRITICAL:** Sample counter in R2A header should update to `1/X`
- [ ] Navigate with « » buttons, counter should change

### Test 3: B5 Direct Load to R3
- [ ] Paste chord data in R2A (e.g., `C G Am F`)
- [ ] Click B5 (📤 icon in header)
- [ ] Chords should appear in R3 rows
- [ ] No errors in Console

### Test 4: B6 Clear R3
- [ ] With chords loaded in R3
- [ ] Click B6 (🧹 icon in header)
- [ ] R2A textarea should clear
- [ ] R3 rows should clear (all show `–`)

### Test 5: Single-Letter Chords
- [ ] Paste: `G D C Am`
- [ ] Click B5
- [ ] All chords should load (G, D, C not rejected)

### Test 6: Enharmonic Chords
- [ ] Paste: `Bb Eb F#dim`
- [ ] Click B5
- [ ] All should load (Bb→A#, Eb→D#, F#dim computed)

## Known Issues to Track

1. **Chord preview not displaying** - Function exists but not updating (non-critical)
2. **Sample editor** - User reported issue, details unclear
3. **Parse log (ER button)** - Not yet implemented for handheld

## Files Changed
- R2A.html
- R3.html  
- frame.html
- Sample.html

## Next Steps
- Test all checklist items in Edge handheld mode
- If tests pass, commit changes
- Merge dev → main
- Deploy to GitHub Pages
