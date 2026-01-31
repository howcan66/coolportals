# R3 Standard Layout Documentation
**Date:** January 30, 2026  
**Status:** Current Standard for Single Row Chord Display

---

## Visual Layout

```
┌─────────────────────────────────────────┐
│  [#3]  [Cmaj7]  B7 B8 B9 B10 B11       │  ← Header Row
│                                         │
│  ████████████████████████████████████  │  ← Piano Graphics (80px)
│  C D E F G A B C D E F G A B           │     with note labels
│  ▌ ▌ ▌ ▌ ▌ ▌ ▌ ▌ ▌ ▌ ▌ ▌ ▌ ▌ ▌       │     (black keys wider)
│                                         │
└─────────────────────────────────────────┘
```

---

## Component Breakdown

### 1. Row Number Box
- **Format:** `[#3]` (from R1 row index)
- **Color:** Orange (#ff9800) border + text
- **Size:** 30px min-width, 12px font
- **Display:** Only shown when chord loaded from R1
- **Purpose:** Visual reference to source row in R1

### 2. Chord Name Box
- **Format:** `[Cmaj7]` or `[C (1st inv)]`
- **Color:** Light blue (#4fc3f7) border + text
- **Size:** 14px font, centered
- **Dynamic Updates:**
  - Shows chord with inversion suffix: "C (1st inv)", "C (2nd inv)", etc.
  - Updates when B8/B9/B10 clicked

### 3. Piano Graphics
- **Size:** 80px height, 100% width
- **Keys:** 7 white keys (C, D, E, F, G, A, B)
- **Black Keys:** 5 black keys, 55% of white key width
- **Note Labels:** 
  - White keys: 18px bold text
  - Black keys: 14px bold text, white color
- **Highlighting:** Chord notes highlighted in green (#8fd694)

### 4. Control Buttons (Header Row)
Arranged left-to-right with 6px gap:

| Button | Function | Trigger |
|--------|----------|---------|
| **B7** | Play R3 | Play current chord |
| **B8** | Triad | Switch to 3-note voicing, send to R2B |
| **B9** | Tetrad | Switch to 4-note voicing, send to R2B |
| **B10** | Inversion | Cycle through 0→1st→2nd→3rd→0, send to R2B |
| **B11** | Play to R2B | Send chord to R2B for analysis |

---

## Data Flow

### Loading a Chord
```
R1 (user types chord) 
  ↓ clicks B1 (Load Chord)
  ↓ postMessage → frame.html
  ↓ routes R1_LOAD_CHORD → R3
  ↓ R3.receiveChordFromR1()
  ↓ Auto-detects mode (triad/tetrad based on chord suffix)
  ↓ Displays: [#rowIndex] [chordName] + piano + plays sound
```

### Mode Auto-Detection
- **Tetrad mode** if chord contains: 6, 7, 9, 11, 13
  - Examples: C7, Cmaj7, F6, C9, Cadd9
- **Triad mode** otherwise
  - Examples: C, Cm, Csus4, Caug, C/E

### Inversion Cycling (B10)
```
Root Position (inversion=0) 
  ↓ click B10
Inversion 1 (inversion=1) → display "C (1st inv)"
  ↓ click B10
Inversion 2 (inversion=2) → display "C (2nd inv)"
  ↓ click B10
Inversion 3 (inversion=3) → display "C (3rd inv)" [tetrad only]
  ↓ click B10
Back to Root (inversion=0)
```

---

## Chord Note Highlighting

When a chord is displayed:
- **White keys with notes:** Highlighted GREEN (#8fd694)
- **Black keys with notes:** Highlighted GREEN (#8fd694)
- **Inactive keys:** Default color (white/black)

Example for C major chord (C, E, G):
```
C [GREEN]  D  E [GREEN]  F  G [GREEN]  A  B
```

---

## Extended Chord Support

**Supported Chords:**
- Basic triads: C, Cm, Cdim, Caug
- Sus chords: Csus2, Csus4
- 7th chords: C7, Cmaj7, Cm7, Cm7b5, Cdim7
- Extended chords: C9, C11, C13, Cadd9
- 6th chords: C6, Cm6, F6
- Slash chords: C/E, Am/G, etc.

**Voicing Rules:**
- Slash chords: Bass note moved to front (lowest position)
- Extended chords: Automatically use tetrad mode

---

## Interaction Flow

### User Workflow
1. Type chord in R1 row, click B1
2. R3 displays with [#rowIndex] [chordName] + piano
3. Click B8 (Triad) / B9 (Tetrad) to change voicing
4. Click B10 (Inv) to cycle inversions
5. Each B8/B9/B10 click sends updated chord to R2B
6. Click B11 to explicitly send to R2B (or use B8/B9/B10)

### R2B Integration
- B8/B9/B10/B11 automatically send chord data to R2B
- R2B receives: chord name + notes + mode + inversion
- R2B displays chord in 2-octave piano with red highlighting
- R2B plays the chord sound (Web Audio API)

---

## Styling Details

### Colors
- **Chord Label:** Light blue #4fc3f7
- **Row Number:** Orange #ff9800
- **Piano Background:** White #f5f5f5
- **Active Keys:** Green #8fd694
- **Black Keys:** Black #1a1a1a
- **Panel Background:** Dark gray #2b2b2b

### Typography
- **Chord label font:** 14px, bold
- **Row number font:** 12px, bold
- **Piano note labels:** 18px (white) / 14px (black), bold

### Spacing
- Row label gap: 6px
- Button gap: 6px
- Piano height: 80px
- Overall padding: 12px

---

## Performance Notes

- Piano SVG renders 7 white + 5 black keys
- Note labels scale with piano height (fixed at 80px)
- Auto-detection regex: `/[679]|11|13/` for extended chords
- Inversion calculation: Array slice/concat O(n)

---

## Known Limitations

- Single group prototype (not yet scaled to 24 groups)
- Octave clamped to 4 for 1-octave piano
- Inversion cycles 0-3, not full inversions for all voicings
- No chord validation error display (silent fail)

---

## Testing Checklist

- [ ] Load C from R1 → shows [#1] [C] in R3
- [ ] Click B8 → tetrad mode, same notes (C is triad-only)
- [ ] Click B10 → inversions cycle, display shows "1st inv", "2nd inv"
- [ ] Load Cmaj7 → auto-detects tetrad (4 notes)
- [ ] Load C/E → bass E moves to front
- [ ] B8/B9/B10 click → updates R2B and plays sound
- [ ] Black keys display wider and readable

---

**End of Documentation**
