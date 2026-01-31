# Piano Chord Application - AI Build Instructions

**Detailed specifications for rebuilding the application from scratch**

---

## Project Overview

**Type:** Multi-panel iframe-based web application  
**Tech Stack:** Vanilla JavaScript, HTML5, CSS3, Web Audio API  
**Architecture:** Message-passing between 4 iframes via parent router  
**Storage:** Browser localStorage  
**Server:** Local HTTP (any static server)

---

## File Structure to Create

```
piano/
├── frame.html          # Main container & message router
├── R2A.html           # Batch chord input panel
├── R1.html            # Validation & distribution panel
├── R3.html            # Piano display & playback (24 rows)
├── R2B.html           # Analysis & controls panel
├── Sample.html        # Sample database manager
├── start-server.ps1   # PowerShell HTTP server
└── samples_add.txt    # Example sample file
```

---

## 1. BUILD: frame.html

### Purpose
Container that hosts 4 iframes and routes postMessage communication between them.

### Layout Structure
```
+------------------------+------------------------+
|         R2A            |          R1            |
|    (Batch Input)       |    (Validation)        |
+------------------------+------------------------+
         DRAGGABLE DIVIDER (resizable)
+------------------------+------------------------+
|         R3             |          R2B           |
|    (Piano Display)     |    (Analysis)          |
+------------------------+------------------------+
```

### CSS Requirements
- **Body:** `display: flex; flex-direction: column; height: 100vh`
- **Container:** CSS Grid with `grid-template-rows: var(--row1-height, 35%) 4px 1fr`
- **Grid columns:** `grid-template-columns: 1fr 1fr`
- **Divider:** Horizontal bar, 4px height, draggable cursor, background #555
- **Iframes:** `width: 100%; height: 100%; border: none`

### Draggable Divider Logic
```javascript
// On mousedown: start drag, disable iframe pointer-events
// On mousemove: calculate percentage, set CSS variable --row1-height
// On mouseup: save to localStorage 'frame-divider-position'
// On load: restore from localStorage
```

### Message Routing System
**Listen for these message types and route:**

| From | To | Message Type | Action |
|------|-----|--------------|--------|
| R2A | R1 | `R2A_LOAD_CHORDS` | Route to r1-frame |
| R1 | R3 | `R1_LOAD_CHORD` | Route to r3-frame (single) |
| R1 | R3 | `R1_LOAD_ALL` | Route to r3-frame (batch) |
| R1 | R3 | `R1_CLEAR_ROW` | Route to r3-frame |
| R1 | R3 | `R1_CLEAR_ALL` | Route to r3-frame |
| R1 | R3 | `R3_FOCUS_AND_PLAY` | Route to r3-frame |
| R3 | R2B | `R3_SEND_TO_R2B` | Route to r2b-frame |
| R2B | R3 | `SET_CHORD_DURATION` | Route to r3-frame |
| R2A | Sample | `EDIT_SAMPLE` | Route to sample window |

**Implementation:**
```javascript
window.addEventListener('message', (event) => {
    const targetFrame = document.getElementById('target-frame-id');
    if (targetFrame && targetFrame.contentWindow) {
        targetFrame.contentWindow.postMessage(event.data, '*');
    }
});
```

### Header Elements
- Title: "Piano Chord Application"
- Version number (display from query param)
- Timestamp (YY.MM.DD • HH.MM format, update every minute)
- Workflow description text

### Query Parameters
Support `?v=1.0.2` for cache busting on iframes.

---

## 2. BUILD: R2A.html

### Purpose
Multi-line text editor for chord/lyric input with sample navigation and parse logging.

### UI Components

**Top Button Row:**
```html
[B5 LR1] [B6 XR2A]  [«] 1/4 [»]  [Log] [XLog]
```

**Title Input:**
- Text input field, placeholder: "# Song Title - Artist"
- Auto-save on blur to `localStorage.r2a-title`

**Main Textarea:**
- Large textarea, monospace font
- White background, black text
- Auto-save on blur to `localStorage.r2a-chords`
- Flex: 1 (takes remaining space)

### Button Specifications

| ID | Label | Color | Function |
|-----|-------|-------|----------|
| r2a-b5 | B5 LR1 | Green border | Parse all chords, send to R1 |
| r2a-b6 | B6 XR2A | Red background | Clear title + textarea + localStorage |
| r2a-prev-sample | « | Gray border | Navigate to previous sample |
| r2a-sample-display | 1/4 | Gray text | Display current/total samples |
| r2a-next-sample | » | Gray border | Navigate to next sample |
| r2a-b7 | Log | Orange border | Download parse log file |
| r2a-b8-clearlog | XLog | Pink border | Clear parse log |

**Button styling:**
- Class: `r2a-btn-global`
- Padding: `8px 16px`
- Border: `2px solid`
- Font-size: `0.9rem` (nav buttons: `1.1rem`)
- Font-weight: `bold`
- Min-width: `100px` (nav: `50px`)
- Sample counter: `display: inline-flex; align-items: center`

### Chord Parsing Logic

**CHORD_REGEX:**
```javascript
/^(?=.{1,10}$)[A-GH](?:#|b)?(?:maj|m|dim|aug|sus(?:2|4)?)?(?:2|4|5|6|7|9|11|13)?(?:(?:#|b)(?:5|9|11|13))?(?:add(?:9|11|13))?(?:\/[A-GH](?:#|b)?)?$/i
```

**Parsing algorithm:**
```javascript
function parseAllChords() {
    const lines = textarea.value.split('\n');
    const allChords = [];
    
    for (const line of lines) {
        if (line.trim().startsWith('#') || line.trim().startsWith('!!!')) {
            continue; // Skip title lines
        }
        
        const tokens = line.trim().split(/\s+/);
        for (const token of tokens) {
            const result = validateChordDetailed(token);
            if (result.valid) {
                allChords.push(result.value);
                // Log valid chord
                appendParseLog({
                    ts: new Date().toISOString(),
                    token: token,
                    normalized: result.value,
                    status: 'valid',
                    lineNumber: lineIndex + 1,
                    lineText: line.trim()
                });
            } else {
                // Log invalid chord
                appendParseLog({
                    ts: new Date().toISOString(),
                    token: token,
                    reason: result.reason,
                    status: 'invalid',
                    lineNumber: lineIndex + 1,
                    lineText: line.trim()
                });
            }
        }
    }
    
    return allChords;
}
```

**Validation:**
```javascript
function validateChordDetailed(chord) {
    if (!chord.trim()) return { valid: false, reason: 'empty' };
    if (!CHORD_REGEX.test(chord)) return { valid: false, reason: 'regex' };
    
    // Check duplicate add/extension
    const match = chord.match(/(\d+).*add(\d+)/i);
    if (match && match[1] === match[2]) {
        return { valid: false, reason: 'duplicate-add' };
    }
    
    // Normalize H→B
    const normalized = chord.replace(/^H/i, 'B').replace(/\/(H)/i, '/B');
    return { valid: true, value: normalized };
}
```

### Sample Navigation

**Data structure:**
```javascript
let currentSampleIndex = 0; // 0-based index

function navigateSample(direction) {
    const entries = JSON.parse(localStorage.getItem('piano_sample_entries') || '[]');
    if (entries.length === 0) {
        alert('⚠️ No samples available');
        return;
    }
    
    currentSampleIndex += direction;
    
    // Wrap around
    if (currentSampleIndex < 0) {
        currentSampleIndex = entries.length - 1;
    } else if (currentSampleIndex >= entries.length) {
        currentSampleIndex = 0;
    }
    
    updateSampleDisplay();
    loadSampleByIndex(currentSampleIndex);
}

function updateSampleDisplay() {
    const entries = JSON.parse(localStorage.getItem('piano_sample_entries') || '[]');
    const total = entries.length > 0 ? entries.length : '?';
    document.getElementById('r2a-sample-display').textContent = 
        (currentSampleIndex + 1) + '/' + total;
}

function loadSampleByIndex(index) {
    const entries = JSON.parse(localStorage.getItem('piano_sample_entries') || '[]');
    const entry = entries[index];
    
    document.getElementById('r2a-main-textarea').value = entry.data;
    document.getElementById('r2a-title').value = '# ' + entry.title;
    
    saveToStorage();
}
```

### Parse Log System

**Storage key:** `r2a-parse-log`

**Log entry format:**
```javascript
{
    ts: '2026-01-31T12:34:56.789Z',
    token: 'Bb',
    normalized: 'Bb',  // for valid chords
    status: 'valid',   // or 'invalid'
    lineNumber: 3,
    lineText: 'C Bb Am F',
    reason: 'regex'    // for invalid chords
}
```

**Download log function:**
```javascript
function downloadParseLog() {
    const log = JSON.parse(localStorage.getItem('r2a-parse-log') || '[]');
    
    const content = log.map(item => {
        if (item.status === 'valid') {
            return `[${item.ts}] R2A | line ${item.lineNumber} | ✓ VALID | token="${item.token}" → "${item.normalized}" | lineText="${item.lineText}"`;
        } else if (item.status === 'invalid') {
            return `[${item.ts}] R2A | line ${item.lineNumber} | ✗ INVALID | token="${item.token}" | reason=${item.reason} | lineText="${item.lineText}"`;
        } else if (item.source === 'R1') {
            return `[${item.ts}] R1 | row ${item.rowIndex} | → SENT TO R3 | chord="${item.chord}"`;
        } else if (item.source === 'R3' && item.action === 'processed') {
            return `[${item.ts}] R3 | row ${item.rowIndex} | ✓ PROCESSED | chord="${item.chord}" | notes=${item.notes}`;
        } else if (item.source === 'R3' && item.action === 'failed') {
            return `[${item.ts}] R3 | row ${item.rowIndex} | ✗ FAILED | chord="${item.chord}" | reason=${item.reason}`;
        }
    }).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'r2a-parse-log.txt';
    a.click();
}
```

### B5 Click Handler
```javascript
function handleB5Click() {
    const allChords = parseAllChords();
    const titleLine = document.getElementById('r2a-title').value.trim();
    
    window.parent.postMessage({
        type: 'R2A_LOAD_CHORDS',
        chords: allChords,
        titleLine: titleLine
    }, '*');
}
```

### B6 Click Handler
```javascript
function handleB6Click() {
    document.getElementById('r2a-title').value = '';
    document.getElementById('r2a-main-textarea').value = '';
    localStorage.removeItem('r2a-title');
    localStorage.removeItem('r2a-chords');
}
```

### localStorage Keys
- `r2a-title` - Title input value
- `r2a-chords` - Textarea value
- `r2a-parse-log` - Array of log entries

---

## 3. BUILD: R1.html

### Purpose
24-row chord validation and distribution panel. Receives from R2A, sends to R3.

### UI Structure

**Top Buttons:**
```html
[LR3] [XR1]
```

**24 Rows (dynamically generated):**
```
#1  [Input Field]  [L] [X] [B25]
#2  [Input Field]  [L] [X] [B25]
...
#24 [Input Field]  [L] [X] [B25]
```

### Row Generation
```javascript
for (let i = 1; i <= 24; i++) {
    const row = document.createElement('div');
    row.className = 'r1-row';
    row.innerHTML = `
        <span class="r1-row-number">#${i}</span>
        <input type="text" 
               class="r1-textform" 
               id="r1-textform-${i}" 
               placeholder="Chord" />
        <button class="r1-btn r1-btn-load" 
                data-row="${i}" 
                onclick="handleB1Click(${i})">L</button>
        <button class="r1-btn r1-btn-clear" 
                data-row="${i}" 
                onclick="handleB2Click(${i})">X</button>
        <button class="r1-btn r1-btn-focus" 
                onclick="handleB25Click(${i})">B25</button>
    `;
    container.appendChild(row);
}
```

### Button Functions

**B1 - Load Single Row:**
```javascript
function handleB1Click(rowIndex) {
    const input = document.getElementById(`r1-textform-${rowIndex}`);
    const chord = input.value.trim();
    
    if (!chord) return;
    
    const validated = validateChord(chord);
    if (!validated) {
        input.value = '';
        return;
    }
    
    // Log to parse log
    const logEntry = {
        ts: new Date().toISOString(),
        source: 'R1',
        chord: validated,
        rowIndex: rowIndex,
        action: 'sent_to_R3'
    };
    const parseLog = JSON.parse(localStorage.getItem('r2a-parse-log') || '[]');
    parseLog.push(logEntry);
    localStorage.setItem('r2a-parse-log', JSON.stringify(parseLog));
    
    // Send to R3
    window.parent.postMessage({
        type: 'R1_LOAD_CHORD',
        chord: validated,
        rowIndex: rowIndex
    }, '*');
}
```

**B2 - Clear Single Row:**
```javascript
function handleB2Click(rowIndex) {
    document.getElementById(`r1-textform-${rowIndex}`).value = '';
    
    window.parent.postMessage({
        type: 'R1_CLEAR_ROW',
        rowIndex: rowIndex
    }, '*');
}
```

**B3 - Load All to R3:**
```javascript
function handleB3Click() {
    const chordArray = [];
    
    for (let i = 1; i <= 24; i++) {
        const input = document.getElementById(`r1-textform-${i}`);
        const chord = input.value.trim();
        
        if (chord) {
            const validated = validateChord(chord);
            if (validated) {
                chordArray.push(validated);
            } else {
                chordArray.push(null);
            }
        } else {
            chordArray.push(null);
        }
    }
    
    window.parent.postMessage({
        type: 'R1_LOAD_ALL',
        chords: chordArray
    }, '*');
}
```

**B4 - Clear All:**
```javascript
function handleB4Click() {
    for (let i = 1; i <= 24; i++) {
        document.getElementById(`r1-textform-${i}`).value = '';
    }
    
    window.parent.postMessage({
        type: 'R1_CLEAR_ALL'
    }, '*');
}
```

**B25 - Focus & Play:**
```javascript
function handleB25Click(rowIndex) {
    const chord = document.getElementById(`r1-textform-${rowIndex}`).value.trim();
    if (!chord) return;
    
    const validated = validateChord(chord);
    if (!validated) return;
    
    window.parent.postMessage({
        type: 'R3_FOCUS_AND_PLAY',
        rowIndex: rowIndex
    }, '*');
}
```

### Message Listener (Receive from R2A)
```javascript
window.addEventListener('message', (event) => {
    if (event.data.type === 'R2A_LOAD_CHORDS') {
        const chords = event.data.chords;
        
        // Clear all rows first
        for (let i = 1; i <= 24; i++) {
            document.getElementById(`r1-textform-${i}`).value = '';
        }
        
        // Fill with new chords (max 24)
        const clamped = chords.slice(0, 24);
        clamped.forEach((chord, index) => {
            document.getElementById(`r1-textform-${index + 1}`).value = chord;
        });
    }
});
```

### Validation Function
```javascript
function validateChord(chord) {
    const trimmed = chord.trim();
    if (!trimmed) return null;
    
    const CHORD_REGEX = /^(?=.{1,10}$)[A-GH](?:#|b)?(?:maj|m|dim|aug|sus(?:2|4)?)?(?:2|4|5|6|7|9|11|13)?(?:(?:#|b)(?:5|9|11|13))?(?:add(?:9|11|13))?(?:\/[A-GH](?:#|b)?)?$/i;
    
    if (!CHORD_REGEX.test(trimmed)) return null;
    
    // Check duplicate add/extension
    const match = trimmed.match(/(\d+).*add(\d+)/i);
    if (match && match[1] === match[2]) return null;
    
    // Normalize H→B
    return trimmed.replace(/^H/i, 'B').replace(/\/(H)/i, '/B');
}
```

---

## 4. BUILD: R3.html

### Purpose
24 piano keyboard groups with chord display, voicing computation, and audio playback.

### UI Structure (24 identical rows)

Each row contains:
```
[#N] [ChordName] [Piano SVG] [B7] [B8] [B9] [B10] [B11]
```

### State Management
```javascript
const groupStates = Array(24).fill(null).map((_, i) => ({
    rowIndex: i + 1,
    chordName: null,
    mode: 'triad',        // 'triad' or 'tetrad'
    inversion: 0,         // 0, 1, 2, 3
    notes: [],            // Array of note strings like ['C4', 'E4', 'G4']
    isEmpty: true
}));
```

### Piano SVG Generation

**Keys to draw:**
- White keys: C, D, E, F, G, A, B (7 keys)
- Black keys: C#, Eb, F#, Ab, Bb (5 keys, positioned between whites)

**SVG structure:**
```javascript
function renderPianoKeysForGroup(svg, rowIndex) {
    const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const blackKeys = [
        {note: 'C#', x: 12},
        {note: 'Eb', x: 35},
        {note: 'F#', x: 70},
        {note: 'Ab', x: 93},
        {note: 'Bb', x: 116}
    ];
    
    const whiteWidth = 200 / 7;
    
    // Draw white keys
    whiteKeys.forEach((note, i) => {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', i * whiteWidth);
        rect.setAttribute('y', 0);
        rect.setAttribute('width', whiteWidth - 1);
        rect.setAttribute('height', 60);
        rect.setAttribute('fill', '#fff');
        rect.setAttribute('stroke', '#000');
        rect.setAttribute('class', 'piano-key');
        rect.setAttribute('data-note', note);
        rect.setAttribute('onclick', `playNote('${note}4')`);
        svg.appendChild(rect);
    });
    
    // Draw black keys
    blackKeys.forEach(({note, x}) => {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', 0);
        rect.setAttribute('width', 14);
        rect.setAttribute('height', 40);
        rect.setAttribute('fill', '#000');
        rect.setAttribute('stroke', '#000');
        rect.setAttribute('class', 'piano-key');
        rect.setAttribute('data-note', note);
        rect.setAttribute('onclick', `playNote('${note}4')`);
        svg.appendChild(rect);
    });
}
```

### Chord Voicing Computation

**Note frequency table:**
```javascript
const NOTE_FREQUENCIES = {
    'C4': 261.63, 'C#4': 277.18, 'Db4': 277.18, 
    'D4': 293.66, 'D#4': 311.13, 'Eb4': 311.13,
    'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 
    'Gb4': 369.99, 'G4': 391.99, 'G#4': 415.30,
    'Ab4': 415.30, 'A4': 440.00, 'A#4': 466.16,
    'Bb4': 466.16, 'B4': 493.88,
    'C5': 523.25, 'C#5': 554.37, 'Db5': 554.37,
    'D5': 587.33, 'D#5': 622.25, 'Eb5': 622.25,
    'E5': 659.25, 'F5': 698.46, 'F#5': 739.99,
    'Gb5': 739.99, 'G5': 783.99, 'G#5': 830.61,
    'Ab5': 830.61, 'A5': 880.00, 'A#5': 932.33,
    'Bb5': 932.33, 'B5': 987.77
};
```

**Voicing algorithm:**
```javascript
function computeVoicing(chordName, mode, inversion) {
    // Parse chord name to extract root, quality, extensions
    const root = extractRoot(chordName);  // e.g., 'C', 'Bb', 'F#'
    const intervals = getIntervals(chordName, mode);  // e.g., [0, 4, 7] for major triad
    
    // Build notes array
    let notes = intervals.map(semitone => {
        return transposeNote(root + '4', semitone);
    });
    
    // Apply inversion
    for (let i = 0; i < inversion; i++) {
        const bottom = notes.shift();
        notes.push(transposeNote(bottom, 12)); // Move up one octave
    }
    
    return notes;
}

function transposeNote(note, semitones) {
    // Parse note (e.g., 'C4' → root='C', octave=4)
    const match = note.match(/^([A-G][#b]?)(\d)$/);
    const [, root, octave] = match;
    
    const semitoneMap = {
        'C':0, 'C#':1, 'Db':1, 'D':2, 'D#':3, 'Eb':3,
        'E':4, 'F':5, 'F#':6, 'Gb':6, 'G':7, 'G#':8,
        'Ab':8, 'A':9, 'A#':10, 'Bb':10, 'B':11
    };
    
    let semi = semitoneMap[root] + semitones;
    let oct = parseInt(octave);
    
    while (semi >= 12) { semi -= 12; oct++; }
    while (semi < 0) { semi += 12; oct--; }
    
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return noteNames[semi] + oct;
}

function getIntervals(chordName, mode) {
    // Simplified interval detection
    const lower = chordName.toLowerCase();
    
    if (mode === 'triad') {
        if (lower.includes('m') && !lower.includes('maj')) {
            return [0, 3, 7]; // Minor triad
        } else if (lower.includes('dim')) {
            return [0, 3, 6]; // Diminished
        } else if (lower.includes('aug')) {
            return [0, 4, 8]; // Augmented
        } else {
            return [0, 4, 7]; // Major triad
        }
    } else { // tetrad
        if (lower.includes('maj7')) {
            return [0, 4, 7, 11]; // Cmaj7
        } else if (lower.includes('m7')) {
            return [0, 3, 7, 10]; // Cm7
        } else if (lower.includes('7')) {
            return [0, 4, 7, 10]; // C7
        } else {
            return [0, 4, 7, 11]; // Default maj7
        }
    }
}
```

### Message Listener (Receive from R1)
```javascript
window.addEventListener('message', (event) => {
    if (event.data.type === 'R1_LOAD_CHORD') {
        const {chord, rowIndex} = event.data;
        receiveChordFromR1(chord, rowIndex);
    } else if (event.data.type === 'R1_LOAD_ALL') {
        const {chords} = event.data;
        chords.forEach((chord, index) => {
            if (chord) receiveChordFromR1(chord, index + 1);
        });
    } else if (event.data.type === 'R1_CLEAR_ROW') {
        clearPianoGroup(event.data.rowIndex);
    } else if (event.data.type === 'R1_CLEAR_ALL') {
        for (let i = 1; i <= 24; i++) clearPianoGroup(i);
    } else if (event.data.type === 'R3_FOCUS_AND_PLAY') {
        const {rowIndex} = event.data;
        // Scroll to row and play
        document.getElementById(`r3-pianogroup-${rowIndex}`)
            .scrollIntoView({behavior: 'smooth', block: 'center'});
        handleButton(rowIndex, 'play');
    } else if (event.data.type === 'SET_CHORD_DURATION') {
        window.chordDuration = event.data.duration;
    }
});
```

### Receive Chord Function
```javascript
function receiveChordFromR1(chordName, rowIndex) {
    if (!chordName || rowIndex < 1 || rowIndex > 24) {
        // Log rejection
        const logEntry = {
            ts: new Date().toISOString(),
            source: 'R3',
            chord: chordName,
            rowIndex: rowIndex,
            action: 'rejected',
            reason: 'invalid_input'
        };
        const parseLog = JSON.parse(localStorage.getItem('r2a-parse-log') || '[]');
        parseLog.push(logEntry);
        localStorage.setItem('r2a-parse-log', JSON.stringify(parseLog));
        return;
    }
    
    const state = groupStates[rowIndex - 1];
    state.chordName = chordName.replace(/H/gi, 'B');
    state.isEmpty = false;
    state.mode = /[679]|11|13/.test(chordName) ? 'tetrad' : 'triad';
    state.inversion = 0;
    state.notes = computeVoicing(state.chordName, state.mode, state.inversion);
    
    if (!state.notes || state.notes.length === 0) {
        // Log failure
        const logEntry = {
            ts: new Date().toISOString(),
            source: 'R3',
            chord: chordName,
            rowIndex: rowIndex,
            action: 'failed',
            reason: 'no_notes_computed'
        };
        const parseLog = JSON.parse(localStorage.getItem('r2a-parse-log') || '[]');
        parseLog.push(logEntry);
        localStorage.setItem('r2a-parse-log', JSON.stringify(parseLog));
    } else {
        // Log success
        const logEntry = {
            ts: new Date().toISOString(),
            source: 'R3',
            chord: chordName,
            rowIndex: rowIndex,
            action: 'processed',
            notes: state.notes.length
        };
        const parseLog = JSON.parse(localStorage.getItem('r2a-parse-log') || '[]');
        parseLog.push(logEntry);
        localStorage.setItem('r2a-parse-log', JSON.stringify(parseLog));
    }
    
    updateChordDisplay(rowIndex);
    playChord(state.notes);
}
```

### Audio Playback (Web Audio API)
```javascript
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function noteToFreq(note) {
    // Parse note like 'C4', 'Bb5', 'F#4'
    const match = note.match(/^([A-G])([#b]?)(\d)$/i);
    if (!match) return 440;
    
    const [, letter, accidental, octave] = match;
    const name = letter.toUpperCase();
    const key = (name + (accidental || '')).toUpperCase();
    
    const semis = {
        'C':0, 'C#':1, 'DB':1, 'D':2, 'D#':3, 'EB':3,
        'E':4, 'F':5, 'F#':6, 'GB':6, 'G':7, 'G#':8,
        'AB':8, 'A':9, 'A#':10, 'BB':10, 'Bb':10, 'B':11
    };
    
    const semi = semis[key];
    if (semi === undefined) return 440;
    
    const midi = (parseInt(octave) + 1) * 12 + semi;
    return 440 * Math.pow(2, (midi - 69) / 12);
}

function triggerTone(freq, duration = 0.8, when = 0, detune = 0) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = freq;
    osc.detune.value = detune;
    
    gain.gain.setValueAtTime(0.3, audioContext.currentTime + when);
    gain.gain.exponentialRampToValueAtTime(0.01, 
        audioContext.currentTime + when + duration);
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.start(audioContext.currentTime + when);
    osc.stop(audioContext.currentTime + when + duration);
}

function playChord(notes, duration = window.chordDuration || 2.0) {
    notes.forEach(note => {
        const freq = noteToFreq(note);
        triggerTone(freq, duration, 0, 0);
    });
}
```

### Button Handlers
```javascript
function handleButton(rowIndex, action) {
    const state = groupStates[rowIndex - 1];
    if (state.isEmpty) return;
    
    switch (action) {
        case 'play':
            playChord(state.notes, window.chordDuration);
            break;
        case 'triad':
            state.mode = 'triad';
            state.inversion = 0;
            state.notes = computeVoicing(state.chordName, 'triad', 0);
            updateChordDisplay(rowIndex);
            break;
        case 'tetrad':
            state.mode = 'tetrad';
            state.inversion = 0;
            state.notes = computeVoicing(state.chordName, 'tetrad', 0);
            updateChordDisplay(rowIndex);
            break;
        case 'invert':
            state.inversion = (state.inversion + 1) % 4;
            state.notes = computeVoicing(state.chordName, state.mode, state.inversion);
            updateChordDisplay(rowIndex);
            break;
        case 'send':
            sendToR2B(rowIndex);
            break;
    }
}
```

---

## 5. BUILD: R2B.html

### Purpose
Single piano display with interactive keys + duration/volume controls. Receives chord from R3.

### UI Components

**Piano SVG:** (same structure as R3)

**Duration Control:**
```html
<div class="r2b-duration-panel">
    <div class="r2b-duration-label">Duration:</div>
    <div class="r2b-duration-options">
        <label><input type="radio" name="duration" value="0.5" /> 0.5s</label>
        <label><input type="radio" name="duration" value="1.0" /> 1.0s</label>
        <label><input type="radio" name="duration" value="1.5" /> 1.5s</label>
        <label><input type="radio" name="duration" value="2.0" checked /> 2.0s</label>
        <label><input type="radio" name="duration" value="3.0" /> 3.0s</label>
    </div>
    <div class="r2b-duration-display">2.0s</div>
</div>
```

**Volume Control:**
```html
<div class="r2b-volume-panel">
    <div class="r2b-volume-label">Volume:</div>
    <input type="range" id="r2b-volume-slider" min="0" max="100" value="80" />
    <div class="r2b-volume-display">80%</div>
</div>
```

### Duration Change Handler
```javascript
document.querySelectorAll('input[name="duration"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        const duration = parseFloat(e.target.value);
        window.chordDuration = duration;
        
        // Update display
        document.querySelector('.r2b-duration-display').textContent = duration + 's';
        
        // Send to R3
        window.parent.postMessage({
            type: 'SET_CHORD_DURATION',
            duration: duration
        }, '*');
    });
});
```

### Volume Change Handler
```javascript
const slider = document.getElementById('r2b-volume-slider');
slider.addEventListener('input', (e) => {
    const volume = parseInt(e.target.value);
    window.chordVolume = volume / 100; // 0-1 scale
    
    // Update display
    document.querySelector('.r2b-volume-display').textContent = volume + '%';
});
```

### Message Listener (Receive from R3)
```javascript
window.addEventListener('message', (event) => {
    if (event.data.type === 'R3_SEND_TO_R2B') {
        const {payload} = event.data;
        setChord(payload);
    }
});

function setChord(payload) {
    const {chordName, notes, mode, rowIndex} = payload;
    
    // Update display
    document.getElementById('r2b-chord-name').textContent = chordName;
    
    // Highlight piano keys
    const svg = document.getElementById('r2b-piano-svg');
    highlightChordKeys(svg, notes, '#4fc3f7');
    
    // Play chord
    playChord(notes, window.chordDuration);
}

function highlightChordKeys(svg, notes, color) {
    // Clear previous highlights
    svg.querySelectorAll('.piano-key').forEach(key => {
        const isBlack = key.getAttribute('fill') === '#000';
        key.setAttribute('fill', isBlack ? '#000' : '#fff');
    });
    
    // Highlight new notes
    notes.forEach(note => {
        const root = note.replace(/\d/, ''); // Remove octave
        const key = svg.querySelector(`[data-note="${root}"]`);
        if (key) key.setAttribute('fill', color);
    });
}
```

### Interactive Piano Keys
```javascript
function playNote(note) {
    const freq = noteToFreq(note);
    const volume = window.chordVolume || 0.8;
    
    // Modify triggerTone to use volume
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = freq;
    
    gain.gain.setValueAtTime(volume * 0.3, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, 
        audioContext.currentTime + 0.5);
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.start();
    osc.stop(audioContext.currentTime + 0.5);
}
```

---

## 6. BUILD: Sample.html

### Purpose
CRUD interface for chord samples with bulk import capability.

### UI Sections

**1. Default Sample Display**
```html
<div class="section-header">
    📌 Default Sample Data
    <button onclick="openDefaultEditModal()">✏️ Edit</button>
</div>
<textarea id="sample-display" readonly></textarea>
```

**2. Bulk Import Section**
```html
<div class="section-header">📥 Bulk Import Samples</div>
<div class="import-section">
    <div class="file-input-wrapper">
        <input type="file" id="importFile" accept=".txt" />
        <button onclick="importSamples()">📥 Import Samples</button>
    </div>
    <div id="importFeedback" class="import-feedback"></div>
    <div class="info-text">
        ℹ️ Upload a .txt file with samples separated by blank lines. 
        Each sample should start with # title.
    </div>
</div>
```

**3. Sample List Display**
```html
<div class="section-header">💾 Your Saved Entries</div>
<div id="saved-entries" class="saved-entries">
    <!-- Dynamically generated sample cards -->
</div>
```

### Sample Card Generation
```javascript
function loadSavedEntries() {
    const entries = JSON.parse(localStorage.getItem('piano_sample_entries') || '[]');
    const container = document.getElementById('saved-entries');
    
    if (entries.length === 0) {
        container.innerHTML = '<div class="no-entries">No saved entries yet.</div>';
        return;
    }
    
    container.innerHTML = entries.map((entry, index) => `
        <div class="sample-card">
            <div class="sample-header">
                <div class="sample-title">${escapeHtml(entry.title)}</div>
                <div class="sample-date">${formatDate(entry.timestamp)}</div>
            </div>
            <div class="sample-preview">${escapeHtml(entry.data.substring(0, 100))}...</div>
            <div class="sample-buttons">
                <button class="select-btn" onclick="selectSample(${index})">Select</button>
                <button class="edit-btn" onclick="openEditModal(${index})">✏️ Edit</button>
                <button class="delete-btn" onclick="openDeleteModal(${index})">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
}
```

### Bulk Import Function
```javascript
async function importSamples() {
    const fileInput = document.getElementById('importFile');
    const file = fileInput.files[0];
    
    if (!file || !file.name.endsWith('.txt')) {
        showImportFeedback('Please select a .txt file', 'error');
        return;
    }
    
    const content = await file.text();
    const samples = parseSamplesFromText(content);
    
    if (samples.length === 0) {
        showImportFeedback('No samples found in file', 'error');
        return;
    }
    
    const entries = JSON.parse(localStorage.getItem('piano_sample_entries') || '[]');
    
    // Use pre-hashed password (bcrypt hash of "admin123")
    const defaultPasswordHash = '$2a$10$F9W8g1FZbzVxbVHeLHZNO.91exgen7em9RHBnuernVcffz5dFm.m';
    
    for (const sample of samples) {
        entries.push({
            title: sample.title,
            data: sample.data,
            passwordHash: defaultPasswordHash,
            timestamp: new Date().toISOString()
        });
    }
    
    localStorage.setItem('piano_sample_entries', JSON.stringify(entries));
    loadSavedEntries();
    
    showImportFeedback(`✅ Successfully added ${samples.length} sample${samples.length > 1 ? 's' : ''}`, 'success');
    fileInput.value = '';
}

function parseSamplesFromText(content) {
    const samples = [];
    const blocks = content.split(/\n\s*\n/); // Split by blank lines
    
    for (const block of blocks) {
        const trimmed = block.trim();
        if (!trimmed) continue;
        
        const lines = trimmed.split('\n');
        let title = 'Imported Sample';
        let data = trimmed;
        
        if (lines[0].startsWith('#')) {
            title = lines[0].substring(1).trim();
            data = lines.slice(1).join('\n').trim();
        }
        
        if (data) {
            samples.push({title, data});
        }
    }
    
    // If no blank lines, treat as single sample
    if (samples.length === 0 && content.trim()) {
        const lines = content.trim().split('\n');
        let title = 'Imported Sample';
        let data = content.trim();
        
        if (lines[0].startsWith('#')) {
            title = lines[0].substring(1).trim();
            data = lines.slice(1).join('\n').trim();
        }
        
        if (data) samples.push({title, data});
    }
    
    return samples;
}
```

### Select Sample Function
```javascript
function selectSample(index) {
    const entries = JSON.parse(localStorage.getItem('piano_sample_entries') || '[]');
    const entry = entries[index];
    
    // Open R2A and load sample
    const r2aWindow = window.open('', 'r2a-frame');
    if (r2aWindow) {
        r2aWindow.postMessage({
            type: 'LOAD_SAMPLE',
            title: entry.title,
            data: entry.data
        }, '*');
    }
}
```

### Delete with Password
```javascript
function confirmDelete() {
    const password = document.getElementById('deletePassword').value;
    const entries = JSON.parse(localStorage.getItem('piano_sample_entries') || '[]');
    const entry = entries[entryToDelete];
    
    // Use bcryptjs library (loaded via CDN)
    if (!bcrypt.compareSync(password, entry.passwordHash)) {
        alert('❌ Incorrect password');
        return;
    }
    
    entries.splice(entryToDelete, 1);
    localStorage.setItem('piano_sample_entries', JSON.stringify(entries));
    loadSavedEntries();
    closeDeleteModal();
    alert('✅ Entry deleted successfully');
}
```

### localStorage Structure
```javascript
// piano_sample_entries array:
[
    {
        title: "Forever Young, Alphaville",
        data: "C G Am F\nLet's dance in style...",
        passwordHash: "$2a$10$...",
        timestamp: "2026-01-31T12:00:00.000Z"
    },
    // ... more entries
]
```

---

## 7. Additional Files

### start-server.ps1
```powershell
$port = 8000
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host "Server running on http://localhost:$port/"
Write-Host "Press Ctrl+C to stop"

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response
    
    $path = $request.Url.LocalPath
    if ($path -eq '/') { $path = '/frame.html' }
    
    $filePath = Join-Path $PSScriptRoot $path.TrimStart('/')
    
    if (Test-Path $filePath) {
        $content = [System.IO.File]::ReadAllBytes($filePath)
        $response.ContentLength64 = $content.Length
        $response.OutputStream.Write($content, 0, $content.Length)
    } else {
        $response.StatusCode = 404
        $buffer = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
        $response.OutputStream.Write($buffer, 0, $buffer.Length)
    }
    
    $response.Close()
}
```

### samples_add.txt (Example)
```
# Forever Young, Alphaville
C                   G                     Am
Let's dance in style, let's dance for a while
           F                             G
Heaven can wait we're only watching the skies
                Dm                     F
Hoping for the best, but expecting the worst
                      Am          G
Are you gonna drop the bomb or not?

# Father and son, Cat Stevens
G                D/F#         C                Am7
It's not time to make a change, just relax and take it easy
             G                   Em               Am       Am7       D
You're still young, that's your fault, there's so much you have to know
        G            D/F#         C                Am7
Find a girl, settle down, if you want to, you can marry
         G        Em          Am   Am Am7 D
Look at me, I am old, but I'm happy
```

---

## Critical Implementation Notes

### 1. PostMessage Security
All iframes must be served from same origin (localhost). Use `'*'` for targetOrigin during development, but specify exact origin in production.

### 2. Web Audio Context
Create audioContext once globally. On iOS/Safari, user interaction required before audio plays.

### 3. localStorage Limits
Browser limit ~5-10MB. Implement size checking for large sample imports.

### 4. Bb Chord Support
Critical mappings in noteToFreq:
```javascript
'Bb': 10  // Lowercase b
'BB': 10  // Uppercase B
```

### 5. Parse Log Storage
Clear regularly to prevent localStorage bloat. Implement auto-cleanup after 1000 entries.

### 6. Chord Regex Edge Cases
- H → B normalization (European notation)
- Duplicate add/extension detection (C9add9 = invalid)
- Slash bass validation (C/E valid, C/ invalid)

### 7. Sample Import Format
- Title marker: `#` at start of line
- Separator: blank line (`\n\n`)
- Auto-detect: split by blank lines, fallback to single sample

### 8. CSS Flexbox Layout
- Use `flex: 1` for expanding sections
- `min-height: 0` to prevent flex overflow bugs
- Row divider needs `position: relative` for drag calculations

---

## Testing Checklist

- [ ] R2A → R1 chord loading (B5 button)
- [ ] R1 → R3 single chord (B1 button)
- [ ] R1 → R3 all chords (B3 button)
- [ ] R3 audio playback (B7 button)
- [ ] R3 → R2B chord analysis (B11 button)
- [ ] R2B duration control → R3 sync
- [ ] R2B volume slider functionality
- [ ] Sample navigation (« » buttons)
- [ ] Sample import from .txt file
- [ ] Parse log download (Log button)
- [ ] Parse log clear (XLog button)
- [ ] Bb chord playback verification
- [ ] Frame divider drag & persist
- [ ] localStorage persistence across refresh
- [ ] Password-protected delete in Sample.html

---

**Build Time Estimate:** 8-12 hours for experienced developer  
**Complexity Level:** Medium-High (message routing, audio API, SVG manipulation)  
**Browser Support:** Modern browsers (Chrome, Firefox, Edge, Safari 14+)

