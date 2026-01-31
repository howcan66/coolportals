# Handheld Optimization Testing Strategy (v2.1.0-dev)

## Overview
Testing protocol for dev branch handheld device optimization before merging to main branch (v2.0.0 stable).

**Critical:** Main branch live at https://howcan66.github.io/coolportals/piano/frame.html must NOT be affected.

---

## Testing Phases

### Phase 1: Local Testing (DevTools Simulation)

#### Setup:
1. Open dev branch locally or via localhost
2. Press **F12** to open DevTools (Chrome/Firefox/Edge)
3. Press **Ctrl+Shift+M** to activate Device Toolbar
4. Set viewport to **1024px width** (handheld breakpoint)

#### Testing Environment Options:
- **Responsive mode:** Custom 1024px, 768px, 375px widths
- **Device presets:** iPad (1024px), iPhone 12 (390px)
- **Orientation:** Test both portrait and landscape

---

## Handheld Testing Checklist (≤1024px)

### A. Button Consolidation (Task #2)
- [ ] Header shows R2A control buttons (B5, B6, ER, --, « 1/4 »)
- [ ] Original R2A buttons NOT visible in R2A panel (hidden)
- [ ] Buttons have Font Awesome icons + text labels
- [ ] All buttons have tooltips on hover (title attribute)
- [ ] **B5 Click:** Chords load to R3 (message in console: "R2A→R3")
- [ ] **B6 Click:** R2A clears successfully
- [ ] **ER Click:** Error log displays
- [ ] **-- Click:** Log clears
- [ ] **« / » Buttons:** Sample navigation (1/4 → 2/4, etc.)

### B. Touch Drag Support (Task #3)
- [ ] R2A/R3 divider visible and responsive
- [ ] Can drag divider up/down with mouse (desktop simulation)
- [ ] Position changes: R2A expands/contracts, R3 adjusts
- [ ] Drag clamped between 5%-95% (can't collapse completely)
- [ ] Position saved to localStorage (refresh → remembers)
- [ ] Smooth dragging, no lag or stuttering
- [ ] Console shows no drag-related errors

### C. Layout & Content Display
- [ ] R2A textarea visible and scrollable
- [ ] R3 piano display visible and scrollable
- [ ] No overlapping UI elements
- [ ] Header buttons don't cover content
- [ ] Scrollbars visible (R2A, R3)
- [ ] Text readable (font sizes appropriate)

### D. Browser Console (F12 → Console Tab)
- [ ] **No red errors** ❌ (stop if found)
- [ ] **No warnings** about missing elements
- [ ] Button clicks show console messages:
  - `[Frame Router] Routing R2A button: b5`
  - `[R2A] Button click from frame header: b5`
- [ ] No iframe communication errors
- [ ] No undefined variable warnings

---

## Desktop Testing Checklist (>1024px)

### A. Layout Unchanged
- [ ] All 4 panels visible: **R1 | R2A | R2B | R3**
- [ ] Button consolidation header NOT visible (hidden)
- [ ] Original R2A buttons visible in R2A panel
- [ ] Desktop layout identical to before (no regressions)

### B. Desktop Button Functionality
- [ ] **B5 (in R2A):** Routes to R1 for validation, then R3 (NOT direct to R3)
- [ ] **B6, ER, -- buttons:** Work as before
- [ ] **B3, B4 (in R1):** Load/clear functionality intact
- [ ] **BR3 button (in R3):** Analysis functionality works
- [ ] All buttons respond to clicks

### C. Console
- [ ] No errors on desktop
- [ ] Button routing shows: `[Frame Router] R2A→R1 (desktop)`
- [ ] No handheld-specific code running on desktop

### D. Divider Drag (Desktop)
- [ ] Mouse drag between R1/R3 still works
- [ ] Horizontal divider between R2A/R2B works
- [ ] Positions save normally

---

## Testing Progression

### Stage 1: Manual Testing (Required Before Merge)
1. **Handheld simulation (DevTools)**
   - [ ] Button consolidation works
   - [ ] Touch drag responsive
   - [ ] No console errors
   - [ ] Content readable

2. **Desktop verification (DevTools or direct)**
   - [ ] 4-panel layout intact
   - [ ] Buttons in original locations
   - [ ] Functionality unchanged
   - [ ] No regressions

### Stage 2: Device Testing (Optional but Recommended)
- [ ] Test on actual tablet device (if available)
- [ ] Test on actual mobile phone (if available)
- [ ] Test on actual desktop monitor (sanity check)
- [ ] Test on different browsers (Chrome, Firefox, Safari, Edge)

### Stage 3: Pre-Merge Checklist
- [ ] All handheld tests pass ✓
- [ ] All desktop tests pass ✓
- [ ] No console errors ✓
- [ ] Screenshots/notes of issues (if any) ✓
- [ ] Performance acceptable (no lag, smooth dragging) ✓

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Buttons not responding | postMessage not working | Check console for errors, verify R2A iframe loaded |
| Drag is laggy | Too many iframes rendering | Normal on DevTools, test on real device |
| Scrollbars invisible | CSS not applied | Check media query in CSS |
| Desktop layout broken | 4-panel grid lost | Verify media query is ≤1024px only |
| Console errors | Missing elements | Check IDs match between frame.html and R2A.html |

---

## Merge to Main Decision Criteria

**READY TO MERGE if:**
- ✅ All handheld tests pass
- ✅ All desktop tests pass
- ✅ No console errors on either
- ✅ No visual regressions
- ✅ Performance acceptable

**DO NOT MERGE if:**
- ❌ Console shows errors
- ❌ Desktop 4-panel layout broken
- ❌ Buttons unresponsive
- ❌ Drag is broken
- ❌ Any functionality lost

---

## Testing Documentation Template

```
TEST DATE: [Date]
TESTER: [Name]
ENVIRONMENT: [DevTools / Real Device]
DEVICE/BROWSER: [iPad / iPhone 12 / Chrome / Firefox]
VIEWPORT: [1024px / 768px / custom]

HANDHELD RESULTS:
✓ Button consolidation
✓ Touch drag
✓ Layout
✓ Console clean

DESKTOP RESULTS:
✓ 4-panel intact
✓ Buttons working
✓ No regressions
✓ Console clean

ISSUES FOUND:
- [Issue 1: Description]
- [Issue 2: Description]

READY FOR MERGE: YES / NO
APPROVED BY: [Name]
```

---

## Next Steps After Merge

1. **Monitor live site:** 2-3 hours after merge
2. **User feedback:** Collect handheld user feedback
3. **Performance monitoring:** Check GitHub Pages analytics
4. **Hotfix protocol:** If issues found, revert or hotfix

---

## Related Tasks

- Task #4: Scrollbar optimization (pending)
- Task #5: Icon minimization (pending)
- Task #6: Handheld device testing (in progress)
- Task #7: Desktop regression testing (in progress)
- Task #8: Merge dev → main (pending)

---

## Quick Reference: Testing Commands

**To test locally:**
```bash
# Check current branch
git branch

# View dev branch commits
git log dev --oneline -5

# Switch between branches
git checkout dev      # Switch to dev
git checkout main     # Switch to main
```

**DevTools Shortcuts:**
- F12 = Open DevTools
- Ctrl+Shift+M = Toggle Device Toolbar
- Ctrl+Shift+C = Inspect Element
- Ctrl+Shift+J = Console Tab

---

Last Updated: 2026-01-31
Status: Testing Phase (Pre-Merge)
