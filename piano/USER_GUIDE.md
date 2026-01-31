# Piano Chord Application - User Guide

**Quick Reference for Features & Commands**

---

## 🚀 Quick Start

1. Start server: `.\start-server.ps1`
2. Open: `http://localhost:8000/frame.html`
3. Enter chords in **R2A** (top-left)
4. Click **B5 LR1** to send to R1
5. Click **LR3** in R1 to display in R3
6. Click **B7** on any R3 row to play

---

## 📝 R2A - Batch Input Panel (Top-Left)

### Buttons
| Button | Command | Function |
|--------|---------|----------|
| **B5 LR1** | Load to R1 | Send all chords to R1 validator |
| **B6 XR2A** | Clear R2A | Clear title + textarea + localStorage |
| **«** | Previous | Navigate to previous sample |
| **1/4** | Counter | Shows current sample index/total |
| **»** | Next | Navigate to next sample |
| **Log** | Download | Download parse log file |
| **XLog** | Clear Log | Wipe all log entries |

### Input Format
```
# Song Title - Artist
C G Am F
Lyric line one
C G Am F
Lyric line two
```

### Shortcuts
- Auto-saves on blur (when clicking away)
- Title starts with `#` or `!!!`
- Blank lines separate sections

---

## ✓ R1 - Validation Panel (Top-Right)

### Global Buttons
| Button | Command | Function |
|--------|---------|----------|
| **LR3** | Load R3 | Send all 24 chords to R3 display |
| **XR1** | Clear R1 | Clear all 24 input rows |

### Per-Row Buttons (24 rows)
| Button | Command | Function |
|--------|---------|----------|
| **L** | Load Row | Send this row's chord to R3 |
| **X** | Clear Row | Clear this row only |
| **B25** | Focus & Play | Scroll to row in R3 and play |

### Supported Chords
- **Basic:** C, D, E, F, G, A, B
- **Accidentals:** C#, Db, Bb (flats/sharps)
- **Quality:** maj, m, dim, aug, sus2, sus4
- **Extensions:** 2, 4, 5, 6, 7, 9, 11, 13
- **Altered:** #5, b5, #9, b9, #11, b13
- **Added:** add9, add11, add13
- **Slash:** C/E, G/B

### Examples
✅ Valid: `C`, `Am`, `G7`, `Cmaj7`, `Bb`, `F#m7b5`, `C/E`  
❌ Invalid: `H` (use B), `Cbb`, `X`, `123`

---

## 🎹 R3 - Piano Display (Bottom-Left)

### Per-Row Buttons (24 rows)
| Button | Command | Function |
|--------|---------|----------|
| **#N** | Row Number | Shows row 1-24 (display only) |
| **–** | Chord Name | Shows chord received from R1 |
| **B7** | Play | Play chord with piano highlight |
| **B8** | Triad | Set to 3-note mode |
| **B9** | Tetrad | Set to 4-note mode (7th chords) |
| **B10** | Invert | Cycle through inversions (0→1→2→3) |
| **B11** | Send R2B | Send chord to R2B for analysis |

### Modes
- **Triad:** Root + 3rd + 5th (3 notes)
- **Tetrad:** Root + 3rd + 5th + 7th (4 notes)
- **Auto-detect:** 7/9/11/13 extensions → Tetrad

### Inversions
- **0:** Root position (C-E-G)
- **1:** 1st inversion (E-G-C)
- **2:** 2nd inversion (G-C-E)
- **3:** 3rd inversion (B-D-F-A for tetrad)

---

## 📊 R2B - Analysis Panel (Bottom-Right)

### Controls
| Control | Range | Function |
|---------|-------|----------|
| **Duration** | 0.5s - 3.0s | Set chord playback length |
| **Volume** | 0% - 100% | Adjust playback volume |

### Features
- Click piano keys to play individual notes
- Displays chord notes from R3
- Duration syncs to R3 automatically
- Volume affects all playback

---

## 💾 Sample.html - Sample Manager

### Buttons
| Button | Function |
|--------|----------|
| **+ Add** | Create new sample |
| **📋 Copy** | Copy default sample |
| **🔄 Refresh** | Reload page |
| **✖ Close** | Close window |
| **✏️ Edit** | Edit default/saved sample |
| **🗑️ Delete** | Delete sample (requires password) |
| **Select** | Load sample to R2A |
| **📥 Import** | Bulk import from .txt file |

### Sample File Format (.txt)
```
# Forever Young, Alphaville
C G Am F
Let's dance in style
C G Am F
Heaven can wait

# Next Song
D A Bm G
More lyrics here
```
- Use `#` for titles
- Separate samples with blank line
- Upload via Import button

### Passwords
- Default import password: `admin123`
- Individual samples can have custom passwords
- Required for delete/edit operations

---

## 🔄 Common Workflows

### **Quick Play Single Chord**
1. Type chord in R2A (e.g., `Cmaj7`)
2. Click **B5 LR1**
3. Click **LR3** in R1
4. Click **B7** on row 1 in R3

### **Play Song from Samples**
1. Click **« »** in R2A to find song
2. Click **B5 LR1** to load
3. Click **LR3** in R1
4. Click **B7** on each row in R3

### **Import Song Samples**
1. Create `.txt` file with samples
2. Open Sample.html
3. Select file in Import section
4. Click **📥 Import Samples**
5. Navigate in R2A with **« »**

### **Adjust Playback**
1. Set duration in R2B (0.5s - 3.0s)
2. Adjust volume slider (0-100%)
3. Duration auto-syncs to R3
4. Play any chord in R3

### **Debug Chord Issues**
1. Click **XLog** to clear old data
2. Enter problematic chord
3. Click **B5 LR1** → **LR3**
4. Click **Log** to download
5. Check for VALID/FAILED/REJECTED

---

## 📋 Parse Log

### Log Entries
```
[timestamp] R2A | line 3 | ✓ VALID | token="Bb" → "Bb"
[timestamp] R1 | row 5 | → SENT TO R3 | chord="Bb"
[timestamp] R3 | row 5 | ✓ PROCESSED | chord="Bb" | notes=3
```

### Status Meanings
- **✓ VALID** - Chord passed R2A validation
- **✗ INVALID** - Chord failed regex (reason shown)
- **→ SENT** - R1 sent chord to R3
- **✓ PROCESSED** - R3 computed notes successfully
- **✗ FAILED** - R3 couldn't compute notes
- **✗ REJECTED** - R3 rejected invalid input

---

## 💡 Tips & Tricks

### Input
- R2A auto-saves when you click away
- Use `# Title` or `!!! Title` for song names
- Blank lines in R2A won't break parsing
- Copy/paste from text files works

### Navigation
- Sample counter shows position (1/4 = first of four)
- Wraps around (last → first when clicking »)
- Samples persist in localStorage

### Playback
- Duration affects ALL R3 chord plays
- Volume only affects R2B + future R3 plays
- Click individual piano keys in R2B for notes
- B7 highlights keys while playing

### Performance
- Clear parse log regularly (XLog button)
- Limit samples to ~50-100 for best performance
- Use bulk import for adding multiple songs
- localStorage limit ~5-10MB total

### Troubleshooting
- Chord won't play? Check parse log
- Bb not working? Log shows full flow
- Import failed? Check file format (# titles, blank lines)
- No sound? Check browser audio permissions

---

## 🎵 Chord Examples

### Basic Triads
```
C  Cm  C+  C°
D  Dm  D+  D°
E  Em  E+  E°
```

### Seventh Chords
```
Cmaj7  C7  Cm7  Cm7b5  C°7
Dmaj7  D7  Dm7  Dm7b5  D°7
```

### Extended Chords
```
C9  Cmaj9  Cm9
C11  Cmaj11  Cm11
C13  Cmaj13  Cm13
```

### Altered Chords
```
C7#5  C7b5  C7#9  C7b9
Cm7b5  C°7  Caug7
```

### Slash Chords
```
C/E  C/G  Am/C  G/B
D/F#  Em/B  F/A
```

### Special Cases
```
Csus2  Csus4  Cadd9
C6  Cm6  C6/9
Bb  Eb  Ab  Db  Gb  (flats work!)
```

---

## 🔗 URLs

- **Main App:** `http://localhost:8000/frame.html`
- **R2A Only:** `http://localhost:8000/R2A.html`
- **R1 Only:** `http://localhost:8000/R1.html`
- **R3 Only:** `http://localhost:8000/R3.html`
- **R2B Only:** `http://localhost:8000/R2B.html`
- **Samples:** `http://localhost:8000/Sample.html`

---

## 📁 Storage

All data stored in browser localStorage:
- `r2a-title` - Current song title
- `r2a-chords` - Current chord data
- `r2a-parse-log` - Debugging log entries
- `piano_sample_entries` - Saved samples array
- `piano_default_data` - Default sample content

**Clear Data:** Use browser DevTools → Application → localStorage → Clear

---

## 🐛 Known Limitations

- Max 24 chords per load (R1 limit)
- localStorage ~5-10MB total (browser dependent)
- Requires HTTP server (file:// won't work)
- Single-user only (no multi-user sync)
- No undo/redo (use B6 XR2A cautiously)

---

**Version:** 1.0.2  
**Last Updated:** 2026-01-31  
**Server:** PowerShell HTTP (port 8000)
