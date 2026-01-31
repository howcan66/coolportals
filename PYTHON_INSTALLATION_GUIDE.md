# Python Installation Guide for Windows

## Purpose
Install Python so you can run a local web server (`python -m http.server`) for testing the Piano application locally without relying on external GitHub URLs.

---

## Method 1: Microsoft Store (Easiest, Recommended)

### Step-by-Step:

**Step 1: Open Microsoft Store**
```
1. Press Windows key
2. Type: "Microsoft Store"
3. Click to open (or click Windows Start Menu → Microsoft Store)
```

**Step 2: Search for Python**
```
1. Click search icon (magnifying glass) at top
2. Type: "Python"
3. Press Enter
```

**Step 3: Select Python Version**
```
1. Look for "Python 3.x" (latest version, e.g., Python 3.11 or 3.12)
2. Published by "Python Software Foundation"
3. Click on it
```

**Step 4: Click Install**
```
1. Click blue "Install" button
2. Wait 2-3 minutes for download/installation
3. You'll see "Installed" when done
```

**Step 5: Verify Installation**
```
1. Open Command Prompt (Windows key → type "cmd")
2. Type: python --version
3. Should show: Python 3.x.x
4. If successful, you're done! ✓
```

**If Error: "Python was not found"**
- Close and reopen Command Prompt
- Restart computer if still not found

---

## Method 2: Direct Download from python.org

### Step-by-Step:

**Step 1: Download Python Installer**
```
1. Go to: https://www.python.org/downloads/
2. Click large yellow "Download Python 3.x" button (latest version)
3. Save file to Downloads folder
4. File will be named: python-3.x.x-amd64.exe
```

**Step 2: Run the Installer**
```
1. Open Downloads folder
2. Double-click: python-3.x.x-amd64.exe
3. Wait for installer window to open
```

**Step 3: Configure Installation**
```
IMPORTANT: Check this box at bottom:
☑ "Add python.exe to PATH"

This is CRITICAL - it lets you run python from Command Prompt
```

**Step 4: Choose Install Type**
```
Option A (Recommended): "Install Now"
- Simple, automated setup
- Installs to default location

Option B: "Customize Installation"
- More control over install location
- For advanced users only
```

**Step 5: Click Install**
```
1. Click "Install Now"
2. Wait 1-2 minutes
3. Should see "Setup was successful"
```

**Step 6: Close and Verify**
```
1. Close installer
2. Open Command Prompt (Windows key → type "cmd")
3. Type: python --version
4. Should show: Python 3.x.x
5. If successful, you're done! ✓
```

---

## Verify Installation (Both Methods)

**In Command Prompt:**
```cmd
C:\Users\YourName> python --version
Python 3.12.1

C:\Users\YourName> python
Python 3.12.1 (main, Dec 7 2024, 14:52:26) [MSC v.1929 64 bit (AMD64)] on win32
Type "help", "copyright", "credits" or "license" for more information.
>>>
```

**To exit Python interactive mode:**
```
Type: exit()
Press Enter
```

---

## Using Python for Local Testing

### Start Local Server:

**Step 1: Open Command Prompt**
```
Windows key → type "cmd" → Enter
```

**Step 2: Navigate to Piano Folder**
```cmd
cd c:\Git\coolportals
```

**Step 3: Start HTTP Server**
```cmd
python -m http.server 8000
```

**Output should show:**
```
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
```

**Step 4: Open Browser**
```
Go to: http://localhost:8000/piano/frame.html
```

**Step 5: Test Your Changes**
```
- Use F12 for DevTools
- Ctrl+Shift+M for mobile simulation
- Test handheld features
```

**Step 6: Stop Server**
```
In Command Prompt window:
Press: Ctrl+C
Message: "Keyboard interrupt received, exiting."
```

---

## Troubleshooting

### Issue: "python is not recognized as an internal or external command"

**Cause:** Python not in PATH or not installed

**Solutions:**
1. **Restart computer** (often fixes after fresh install)
2. **Reinstall Python:**
   - Uninstall via Settings → Apps
   - Reboot
   - Reinstall with "Add to PATH" checked
3. **Manual PATH addition (Advanced):**
   - Settings → Search "environment variables"
   - Edit System Environment Variables
   - Add: `C:\Users\YourName\AppData\Local\Programs\Python\Python312`

### Issue: "Port 8000 already in use"

**Solution:**
```
Use different port:
python -m http.server 8001
# Then go to: http://localhost:8001/piano/frame.html
```

### Issue: "Permission denied"

**Solution:**
1. Run Command Prompt as Administrator
2. Right-click cmd → "Run as administrator"
3. Try again

---

## Quick Reference: Local Server

**Start server:**
```cmd
cd c:\Git\coolportals
python -m http.server 8000
```

**Access application:**
```
http://localhost:8000/piano/frame.html
```

**Main panel:**
```
http://localhost:8000/piano/frame.html
```

**Individual panels:**
```
http://localhost:8000/piano/R1.html
http://localhost:8000/piano/R2A.html
http://localhost:8000/piano/R2B.html
http://localhost:8000/piano/R3.html
http://localhost:8000/piano/help.html
```

**Stop server:**
```cmd
Ctrl+C in Command Prompt
```

---

## When to Use Local Server vs Direct File

### Use Local Server (`http://localhost:8000`):
✅ Testing cross-origin requests (iframes)
✅ Testing real network conditions
✅ Professional development
✅ Consistent with production environment

### Use Direct File (`c:\Git\coolportals\piano\frame.html`):
✅ Quick testing (no setup)
✅ Testing basic UI/layout
✅ When server not needed
✅ Fast iteration

---

## Python Uninstall (If Needed)

**Microsoft Store Version:**
```
1. Settings → Apps → Installed apps
2. Search: "Python"
3. Click → "Uninstall"
4. Confirm
```

**Direct Download Version:**
```
1. Control Panel → Programs → Programs and Features
2. Find: "Python 3.x"
3. Click → "Uninstall"
4. Confirm
```

---

## Additional Resources

- **Python Official:** https://www.python.org
- **Python Documentation:** https://docs.python.org
- **http.server docs:** https://docs.python.org/3/library/http.server.html

---

## Summary

| Step | Action |
|------|--------|
| 1 | Install Python (Microsoft Store or python.org) |
| 2 | Verify: `python --version` |
| 3 | Navigate: `cd c:\Git\coolportals` |
| 4 | Start: `python -m http.server 8000` |
| 5 | Open: `http://localhost:8000/piano/frame.html` |
| 6 | Test: F12 → DevTools → Test handheld |
| 7 | Stop: Ctrl+C in Command Prompt |

---

Last Updated: 2026-01-31
Status: Complete
Difficulty: Beginner-friendly
Time to Install: 5-10 minutes
