# 🎹 Piano Chords & Lyrics Analyse & View

A web-based piano chord visualization and analysis tool with multi-panel interface for chord input, validation, display, and harmonic analysis.

## Features

### Core Functionality
- **24-Row Chord Management**: Handle up to 24 chords simultaneously
- **Real-time Piano Visualization**: Interactive SVG piano keyboards showing chord notes
- **Web Audio Playback**: Play individual notes or full chords with accurate pitch
- **Chord Validation**: Automatic chord syntax checking with support for complex voicings
- **Mode Detection**: Automatic triad/tetrad detection based on chord extensions
- **Inversion Support**: Cycle through chord inversions (root, 1st, 2nd, 3rd)
- **Cross-Panel Communication**: Seamless message routing between all interface panels

### Panel Overview

#### R1 - Chord Input (Single Row)
- 24 individual chord input rows
- Per-row load and clear functionality
- Global load/clear operations
- Quick focus & play navigation

#### R2A - Batch Input
- Multi-chord text input
- Batch validation and loading to R1
- Support for chord lists and lyrics

#### R3 - Piano Display (24 Rows)
- 24 independent piano keyboards (always visible)
- Red key highlighting during playback
- Green key highlighting for loaded chords
- Compact scrollable layout
- Per-row chord information display

#### R2B - Analysis
- Chord harmonic analysis
- Interval and voicing information
- Musical theory details

## Button Reference

### R1 Controls

| Button | Label | Function |
|--------|-------|----------|
| B1 | L | Load single chord to corresponding R3 row |
| B2 | X | Clear current row input |
| B3 | LR3 | Load all valid R1 chords to R3 |
| B4 | XR1 | Clear all R1 inputs |
| B25 | > | Focus R3 row and play chord (smooth scroll + audio) |

**B25 Behavior:**
- Validates chord before action
- Ignores empty rows
- Scrolls R3 to center target row
- Plays chord using current voicing mode
- Red key highlight during playback

### R3 Controls (Per Row)

| Button | Function |
|--------|----------|
| Row # | Row number indicator (orange, disabled) |
| Chord | Current chord display (blue, disabled) |
| B7 | Play chord with red key highlight |
| B8 | Set to triad mode and send to R2B |
| B9 | Set to tetrad mode and send to R2B |
| B10 | Cycle inversion (0→1→2→3→0) and send to R2B |
| B11 | Send current voicing to R2B for analysis |

## Keyboard Shortcuts

Currently no keyboard shortcuts implemented. All interactions are button-based.

## Chord Syntax

### Supported Formats
- **Basic triads**: `C`, `Dm`, `E7`, `F#m`
- **Extended chords**: `Cmaj7`, `Dm9`, `G13`, `Am11`
- **Alterations**: `C#`, `Db`, `F#m7`, `Bbmaj7`
- **Slash chords**: `C/E`, `Dm7/A`, `G/B`
- **Special notation**: `H` (accepted as `B` in German notation)

### Validation Rules
- Maximum 10 characters
- Must start with note name (A-G or H)
- Supports `#` (sharp) and `b` (flat)
- Regex: `/^(?=.{1,10}$)[A-GH](?:#|b)?(?:maj|min|m|sus|aug|dim)?(?:\d{1,2})?(?:\/[A-GH](?:#|b)?)?$/i`

### Mode Auto-Detection
- **Triad**: Default for basic chords (C, Dm, E7)
- **Tetrad**: Auto-selected for extended chords containing `6`, `7`, `9`, `11`, `13`

## Message Flow

### R1 → R3 (Load Chord)
```javascript
{
  type: 'R1_LOAD_CHORD',
  chord: 'Cmaj7',
  rowIndex: 1
}
```

### R1 → R3 (Focus & Play)
```javascript
{
  type: 'R3_FOCUS_AND_PLAY',
  rowIndex: 1
}
```

### R1 → R3 (Load All)
```javascript
{
  type: 'R1_LOAD_ALL',
  chords: ['C', 'Dm', 'Em', ...] // 24-element array
}
```

### R3 → R2B (Send for Analysis)
```javascript
{
  type: 'R3_SEND_TO_R2B',
  chord: 'Cmaj7',
  mode: 'tetrad',
  inversion: 0,
  notes: ['C3', 'E3', 'G3', 'B3']
}
```

### R2A → R1 (Load Chords)
```javascript
{
  type: 'R2A_LOAD_CHORDS',
  chords: ['C', 'Dm', 'G7', ...]
}
```

## Layout Specifications

### Frame Layout
- **R1**: 12.5% width (chord input)
- **R2A**: 30% width (batch input)
- **R2B**: 57.5% width (analysis display)
- **R3**: Full width below R2A/R2B (piano keyboards)
- **Divider**: Resizable horizontal split between top and bottom rows

### Styling
- **Theme**: Dark mode (#1a1a1a background)
- **Accent color**: Blue (#0d47a1)
- **Button height**: 24px (compact)
- **Row gap (R1)**: 1px vertical, 1px horizontal
- **Row gap (R3)**: 4px vertical, 3px horizontal
- **Frame borders**: 2px radius, 6px gap

### Piano Keys
- **White keys**: 20px wide, 80px tall, #f5f5f5 fill
- **Black keys**: 12px wide, 50px tall, #1a1a1a fill
- **Active (loaded)**: #8fd694 (green) fill
- **Playing**: #ff0000 (red) fill

## Technical Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Audio**: Web Audio API (OscillatorNode with exponential ramping)
- **Graphics**: SVG for piano keyboard rendering
- **Layout**: CSS Grid with flexbox components
- **Communication**: PostMessage API for iframe routing
- **Storage**: LocalStorage for divider position persistence

## File Structure

```
Piano/
├── frame.html          # Main container with 4-panel layout
├── R1.html            # Single-row chord input (24 rows)
├── R2A.html           # Batch chord input
├── R2B.html           # Chord analysis display
├── R3.html            # Piano keyboard display (24 rows)
└── README.md          # This file
```

## Setup & Usage

### Local Development
1. Clone repository
2. Open `frame.html` in a modern browser
3. No build process or dependencies required

### Browser Requirements
- Modern browser with ES6 support
- Web Audio API support
- SVG rendering capability
- PostMessage API support

### Recommended
- Chrome 90+
- Firefox 88+
- Edge 90+

## Usage Guide

### Basic Workflow
1. **Enter chord** in R1 input field (e.g., "Cmaj7")
2. **Click B1** (Load) to send to R3
3. **View piano** in R3 with green highlighted notes
4. **Click B7** to play chord (red highlight)
5. **Click B25** (>) to focus and play from R1

### Batch Workflow
1. **Enter multiple chords** in R2A (one per line or space-separated)
2. **Click B5/B7** to validate and load to R1
3. **Click R1 B3** to load all to R3
4. **Navigate** using B25 buttons

### Analysis Workflow
1. **Load chord** to R3
2. **Click B8/B9** to set mode (triad/tetrad)
3. **Click B10** to cycle inversions
4. **Click B11** to send to R2B for detailed analysis

## Keyboard Layout

Each piano shows one octave (C3-B3):
- **7 white keys**: C, D, E, F, G, A, B
- **5 black keys**: C#, D#, F#, G#, A#
- **Clickable**: Individual notes trigger audio playback
- **Labeled**: Note names on white keys, sharps on black keys

## Color Coding

| Color | Meaning |
|-------|---------|
| Green (#8fd694) | Chord notes loaded (default state) |
| Red (#ff0000) | Currently playing notes |
| Orange (#ff9800) | Row number indicator |
| Blue (#4fc3f7) | Chord name display |
| Light Blue (#87ceeb) | Focus button (B25) |
| Pink (#f4a6a6) | Clear button |

## Known Limitations

- Maximum 24 chords
- Single octave piano display (C3-B3)
- No MIDI support
- No chord progression playback
- No export functionality
- Browser audio permissions required

## Future Enhancements

- [ ] Keyboard shortcuts
- [ ] MIDI input/output
- [ ] Chord progression playback
- [ ] Export to MIDI/MusicXML
- [ ] Custom voicing editor
- [ ] Scale highlighting
- [ ] Multi-octave display
- [ ] Lyrics synchronization
- [ ] Session save/load

## Version History

### Current Version (2026-01-31)
- 24-row architecture fully implemented
- B25 focus & play button added
- Compact layout with reduced spacing
- Red/green color coding for playback states
- Frame header simplified
- Row number and chord display in buttons
- Horizontal scroll for R1 content preservation

## License

[Specify license here]

## Contributing

[Contribution guidelines here]

## Contact

[Contact information here]

---

**Last Updated**: January 31, 2026
**Status**: Active Development
