// ===== SHARED MESSAGE ROUTING LOGIC =====
// Used by frame.html, frame-tablet.html, and frame-mobile.html

function setupMessageRouting() {
    window.addEventListener('message', (event) => {
        // Route messages between iframes
        console.log('[Frame Router] Received message:', event.data.type);
        
        // Route SAMPLES_UPDATED from Sample.html to R2A
        if (event.data.type === 'SAMPLES_UPDATED') {
            const r2aFrame = document.getElementById('r2a-frame');
            if (r2aFrame && r2aFrame.contentWindow) {
                r2aFrame.contentWindow.postMessage(event.data, '*');
                console.log('[Frame Router] Sample.html→R2A: samples updated');
            }
            return;
        }
        
        if (event.data.type === 'R2A_LOAD_TO_R3') {
            // B5: Direct R2A→R3 (bypasses R1)
            const convertedMessage = {
                type: 'R1_LOAD_ALL',
                chords: event.data.chords
                // titleLine discarded (R3 doesn't display title)
            };
            
            const r3Frame = document.getElementById('r3-frame');
            if (r3Frame && r3Frame.contentWindow) {
                r3Frame.contentWindow.postMessage(convertedMessage, '*');
                console.log('[Frame Router] R2A→R3 direct: sent', event.data.chords.length, 'chords');
            }
        }
        else if (event.data.type === 'R2A_LOAD_CHORDS') {
            // Device-aware routing: R2A B5
            // Tablet (≤1024px): Convert to R1_LOAD_ALL format, route to R3
            // Desktop (>1024px): Route to R1 as-is
            
            const isTablet = window.innerWidth <= 1024;
            
            if (isTablet) {
                // Convert R2A_LOAD_CHORDS to R1_LOAD_ALL format and send to R3
                const convertedMessage = {
                    type: 'R1_LOAD_ALL',
                    chords: event.data.chords
                    // titleLine discarded on tablet (no R1 to display it)
                };
                
                const r3Frame = document.getElementById('r3-frame');
                if (r3Frame && r3Frame.contentWindow) {
                    r3Frame.contentWindow.postMessage(convertedMessage, '*');
                    console.log('[Frame Router] R2A→R3 (tablet): converted R2A_LOAD_CHORDS to R1_LOAD_ALL, sent', event.data.chords.length, 'chords');
                }
            } else {
                // Route to R1 on desktop (user can manipulate)
                const r1Frame = document.getElementById('r1-frame');
                if (r1Frame && r1Frame.contentWindow) {
                    r1Frame.contentWindow.postMessage(event.data, '*');
                    console.log('[Frame Router] R2A→R1 (desktop): chords loaded');
                }
            }
        }
        else if (event.data.type === 'R1_LOAD_CHORD') {
            // Route R1→R3 (B1: Load single chord)
            const r3Frame = document.getElementById('r3-frame');
            if (r3Frame && r3Frame.contentWindow) {
                r3Frame.contentWindow.postMessage(event.data, '*');
                console.log('[Frame Router] R1→R3: chord loaded', event.data.chord);
            }
        }
        else if (event.data.type === 'R1_LOAD_ALL') {
            // Route R1→R3 (B3: Load all chords)
            const r3Frame = document.getElementById('r3-frame');
            if (r3Frame && r3Frame.contentWindow) {
                r3Frame.contentWindow.postMessage(event.data, '*');
                console.log('[Frame Router] R1→R3: all chords loaded');
            }
        }
        else if (event.data.type === 'R1_CLEAR_ALL') {
            // Route R1→R3 (B4: Clear all)
            const r3Frame = document.getElementById('r3-frame');
            if (r3Frame && r3Frame.contentWindow) {
                r3Frame.contentWindow.postMessage(event.data, '*');
                console.log('[Frame Router] R1→R3: cleared');
            }
        }
        else if (event.data.type === 'R3_SEND_TO_R2B') {
            // Route R3→R2B (BR3: Send chord analysis)
            const r2bFrame = document.getElementById('r2b-frame');
            if (r2bFrame && r2bFrame.contentWindow) {
                r2bFrame.contentWindow.postMessage(event.data, '*');
                console.log('[Frame Router] R3→R2B: chord sent for analysis');
            }
        }
        else if (event.data.type === 'R3_CLEAR_ALL') {
            // Route R2A→R3 (B6: Clear all)
            const r3Frame = document.getElementById('r3-frame');
            if (r3Frame && r3Frame.contentWindow) {
                r3Frame.contentWindow.postMessage(event.data, '*');
                console.log('[Frame Router] R2A→R3: clear all chords');
            }
        }
        else if (event.data.type === 'R3_FOCUS_AND_PLAY') {
            // Route R1→R3 (B25: Focus row and play)
            const r3Frame = document.getElementById('r3-frame');
            if (r3Frame && r3Frame.contentWindow) {
                r3Frame.contentWindow.postMessage(event.data, '*');
                console.log('[Frame Router] R1→R3: focus and play', event.data.rowIndex);
            }
        }
        else if (event.data.type === 'LOAD_CHORD_DATA') {
            // Route Sample.html→R2A (Load chord data into R2A)
            const r2aFrame = document.getElementById('r2a-frame');
            if (r2aFrame && r2aFrame.contentWindow) {
                r2aFrame.contentWindow.postMessage(event.data, '*');
                console.log('[Frame Router] Sample→R2A: chord data loaded');
            }
        }
        else if (event.data.type === 'SET_CHORD_DURATION') {
            // Route R2B→R3 (Set chord duration)
            const r3Frame = document.getElementById('r3-frame');
            if (r3Frame && r3Frame.contentWindow) {
                r3Frame.contentWindow.postMessage(event.data, '*');
                console.log('[Frame Router] R2B→R3: duration set to', event.data.duration);
            }
        }
        else if (event.data.type === 'EDIT_SAMPLE') {
            // Route R2A→Sample (Edit existing sample)
            const sampleFrame = document.getElementById('sample-frame');
            if (sampleFrame && sampleFrame.contentWindow) {
                sampleFrame.contentWindow.postMessage(event.data, '*');
                console.log('[Frame Router] R2A→Sample: Edit mode with data:', event.data.data);
            }
        }
    });
}

function setupResizeDivider(containerId, dividerId) {
    const divider = document.getElementById(dividerId);
    const container = document.getElementById(containerId);
    let isDragging = false;

    // Load saved position
    function loadDividerPosition() {
        const saved = localStorage.getItem('frame-divider-position');
        if (saved) {
            const percentage = parseFloat(saved);
            document.documentElement.style.setProperty('--row1-height', percentage + 'fr');
            document.documentElement.style.setProperty('--row2-height', (1 - percentage) + 'fr');
        }
    }

    // Save position
    function saveDividerPosition(percentage) {
        localStorage.setItem('frame-divider-position', percentage);
    }

    loadDividerPosition();

    if (!divider) return;

    divider.addEventListener('mousedown', (e) => {
        isDragging = true;
        divider.classList.add('dragging');
        document.body.style.cursor = 'ns-resize';
        document.body.style.userSelect = 'none';
        
        document.querySelectorAll('iframe').forEach(iframe => {
            iframe.style.pointerEvents = 'none';
        });
        
        e.preventDefault();
    });

    divider.addEventListener('touchstart', (e) => {
        isDragging = true;
        divider.classList.add('dragging');
        document.body.style.userSelect = 'none';
        
        document.querySelectorAll('iframe').forEach(iframe => {
            iframe.style.pointerEvents = 'none';
        });
        
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        e.preventDefault();
        
        const containerRect = container.getBoundingClientRect();
        const mouseY = e.clientY - containerRect.top;
        const containerHeight = containerRect.height;
        
        let percentage = mouseY / containerHeight;
        percentage = Math.max(0.05, Math.min(0.95, percentage));
        
        const row1 = percentage;
        const row2 = 1 - percentage;
        
        document.documentElement.style.setProperty('--row1-height', row1 + 'fr');
        document.documentElement.style.setProperty('--row2-height', row2 + 'fr');
    });

    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        
        e.preventDefault();
        
        const touch = e.touches[0];
        const containerRect = container.getBoundingClientRect();
        const touchY = touch.clientY - containerRect.top;
        const containerHeight = containerRect.height;
        
        let percentage = touchY / containerHeight;
        percentage = Math.max(0.05, Math.min(0.95, percentage));
        
        const row1 = percentage;
        const row2 = 1 - percentage;
        
        document.documentElement.style.setProperty('--row1-height', row1 + 'fr');
        document.documentElement.style.setProperty('--row2-height', row2 + 'fr');
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            divider.classList.remove('dragging');
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            
            const row1Value = getComputedStyle(document.documentElement).getPropertyValue('--row1-height');
            const percentage = parseFloat(row1Value);
            if (!isNaN(percentage)) {
                saveDividerPosition(percentage);
            }
            
            document.querySelectorAll('iframe').forEach(iframe => {
                iframe.style.pointerEvents = '';
            });
        }
    });

    document.addEventListener('touchend', () => {
        if (isDragging) {
            isDragging = false;
            divider.classList.remove('dragging');
            document.body.style.userSelect = '';
            
            const row1Value = getComputedStyle(document.documentElement).getPropertyValue('--row1-height');
            const percentage = parseFloat(row1Value);
            if (!isNaN(percentage)) {
                saveDividerPosition(percentage);
            }
            
            document.querySelectorAll('iframe').forEach(iframe => {
                iframe.style.pointerEvents = '';
            });
        }
    });
}

function setupHorizontalResizeDivider(containerId, dividerId) {
    const hDivider = document.getElementById(dividerId);
    const container = document.getElementById(containerId);
    let isHDragging = false;

    if (!hDivider) return;

    hDivider.addEventListener('mousedown', (e) => {
        isHDragging = true;
        hDivider.classList.add('dragging');
        document.body.style.cursor = 'ew-resize';
        document.body.style.userSelect = 'none';
        
        document.querySelectorAll('iframe').forEach(iframe => {
            iframe.style.pointerEvents = 'none';
        });
        
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isHDragging) return;
        
        e.preventDefault();
        
        const containerRect = container.getBoundingClientRect();
        const mouseX = e.clientX - containerRect.left;
        const containerWidth = containerRect.width;
        
        const r1Width = 0.125;
        const gap = 0.03;
        const newR2aWidth = mouseX / containerWidth - r1Width - gap;
        const newR2bWidth = 1 - r1Width - gap - newR2aWidth;
        
        const clampedR2a = Math.max(0.2, Math.min(0.6, newR2aWidth));
        const clampedR2b = 1 - r1Width - gap - clampedR2a;
        
        container.style.gridTemplateColumns = `0.125fr ${clampedR2a}fr 6px ${clampedR2b}fr`;
    });

    document.addEventListener('mouseup', () => {
        if (isHDragging) {
            isHDragging = false;
            hDivider.classList.remove('dragging');
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            
            document.querySelectorAll('iframe').forEach(iframe => {
                iframe.style.pointerEvents = '';
            });
        }
    });
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    setupMessageRouting();
    setupResizeDivider('frame-container', 'resize-divider');
    setupHorizontalResizeDivider('frame-container', 'h-resize-divider');
});
