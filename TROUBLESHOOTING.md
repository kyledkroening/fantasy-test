# 🛠️ Troubleshooting Guide - Fantasy Football League Central

Having issues? Don't worry! This guide covers the most common problems and their solutions.

## 🆘 Most Common Issues

### 1. **"npm is not recognized" or "command not found"**

**What you see:**
```
'npm' is not recognized as an internal or external command
```
**OR**
```
npm: command not found
```

**What this means:** Node.js isn't installed or isn't in your system PATH.

**Fix it:**
1. **Download Node.js** from https://nodejs.org
2. **Install it completely** - click through all the setup steps
3. **Important:** Restart your computer completely
4. **Open a new terminal/command prompt**
5. **Try again** from Step 3 in the setup guide

**Test if it worked:**
```bash
node --version
npm --version
```
You should see version numbers like `v18.17.0` and `9.6.7`.

---

### 2. **"Cannot find package.json"**

**What you see:**
```
npm ERR! code ENOENT
npm ERR! path /Users/yourname/package.json
npm ERR! errno -2
```

**What this means:** You're not in the correct folder.

**Fix it:**
1. **Open your file manager** (Windows Explorer or Mac Finder)
2. **Find your fantasy football app folder** (it should contain `package.json`)
3. **Look at the address bar** - copy the full path
4. **In your terminal, type:** `cd ` (with a space after "cd")
5. **Paste the path** and press Enter

**Example:**
```bash
cd C:\Users\YourName\Desktop\fantasy-football-app
```

**Verify you're in the right place:**
```bash
ls package.json    # Mac/Linux
dir package.json   # Windows
```
You should see the `package.json` file listed.

---

### 3. **"Port 3000 is already in use"**

**What you see:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**What this means:** Another program is using port 3000.

**Fix it:**

**Option 1: Use a different port**
```bash
npm run dev -- --port 3001
```
Then open: http://localhost:3001

**Option 2: Find and stop the other program**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Mac/Linux  
lsof -ti:3000 | xargs kill -9
```

**Option 3: Restart everything**
1. Close all terminals and browsers
2. Restart your computer
3. Try again

---

### 4. **"Module not found" errors**

**What you see:**
```
Error: Cannot resolve module './components/Dashboard'
```

**What this means:** Missing dependencies or corrupted installation.

**Fix it:**
```bash
# Delete and reinstall everything
rm -rf node_modules package-lock.json  # Mac/Linux
# OR
rmdir /s node_modules & del package-lock.json  # Windows

# Reinstall fresh
npm install
```

**If that doesn't work:**
```bash
# Clear npm cache
npm cache clean --force

# Try installing again
npm install
```

---

### 5. **Blank white screen in browser**

**What you see:** Browser loads but shows nothing or an error page.

**Fix it:**

**Step 1: Check the terminal**
- Look for error messages in red
- Make sure it says "Local: http://localhost:3000/"
- The terminal should still be running (not returned to a prompt)

**Step 2: Check the browser console**
1. **Right-click** on the blank page
2. **Select "Inspect"** or "Developer Tools"
3. **Click the "Console" tab**
4. **Look for error messages** (usually in red)

**Step 3: Common fixes**
```bash
# Try building first
npm run build
npm run dev

# Or try clearing cache
npm run dev -- --force
```

**Step 4: Try different browsers**
- Chrome: `chrome://flags/#enable-javascript`
- Firefox: Check if JavaScript is enabled
- Safari: Preferences > Security > Enable JavaScript

---

### 6. **"Permission denied" errors**

**What you see:**
```
EACCES: permission denied, mkdir '/usr/local/lib/node_modules'
```

**What this means:** Insufficient permissions.

**Fix it:**

**For Mac/Linux:**
```bash
# Don't use sudo! Instead, fix npm permissions:
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

**For Windows:**
- Right-click Command Prompt
- Select "Run as Administrator"
- Try the npm commands again

---

### 7. **"gyp ERR!" or Python errors**

**What you see:**
```
gyp ERR! stack Error: Can't find Python executable "python"
```

**What this means:** Some packages need build tools.

**Fix it:**

**For Windows:**
```bash
npm install --global windows-build-tools
```

**For Mac:**
```bash
xcode-select --install
```

**For Linux:**
```bash
sudo apt-get install build-essential
```

**Alternative:** Use the `--ignore-scripts` flag:
```bash
npm install --ignore-scripts
```

---

### 8. **Charts/visualizations not showing**

**What you see:** App loads but charts are blank or missing.

**Fix it:**

**Check console for errors:**
1. Open browser developer tools (F12)
2. Look for JavaScript errors
3. Common issues:
   - Missing Recharts dependency
   - Data format problems
   - Browser compatibility

**Reinstall chart dependencies:**
```bash
npm uninstall recharts
npm install recharts
npm run dev
```

---

### 9. **ESPN API authentication errors**

**What you see:** "Failed to fetch ESPN data" or authentication errors.

**Fix it:**

**For private ESPN leagues:**
1. **Get your cookies:**
   - Log into ESPN Fantasy
   - Open browser developer tools (F12)
   - Go to Application/Storage tab
   - Find `SWID` and `espn_s2` cookies
   - Copy the values

2. **Add to Data Management:**
   - Go to Management tab
   - Add ESPN data source
   - Check "Private League"
   - Paste your cookie values

**For public leagues:**
- Ensure the League ID is correct
- Try different ESPN endpoints in the app

---

### 10. **Build fails with TypeScript errors**

**What you see:**
```
Type 'string' is not assignable to type 'number'
```

**Fix it:**

**Quick fix:**
```bash
# Skip type checking for build
npm run build -- --mode development
```

**Proper fix:**
1. Check the specific TypeScript errors
2. Most are data type mismatches
3. Common fixes are in the component files
4. Or temporarily add `// @ts-ignore` above the error line

---

## 🔧 **Advanced Troubleshooting**

### **Complete Reset (Nuclear Option)**
If nothing works, start fresh:

```bash
# 1. Delete everything
rm -rf node_modules package-lock.json  # Mac/Linux
rmdir /s node_modules & del package-lock.json  # Windows

# 2. Clear all npm caches
npm cache clean --force

# 3. Reinstall Node.js from scratch
# Download from https://nodejs.org and reinstall

# 4. Restart your computer

# 5. Try the setup again from Step 1
```

### **Check Your Environment**
```bash
# Verify your setup
node --version    # Should be 18.0.0 or higher
npm --version     # Should be 8.0.0 or higher
npx --version     # Should work

# Check your PATH
echo $PATH        # Mac/Linux
echo %PATH%       # Windows
```

### **Alternative Installation Methods**

**Using Yarn instead of npm:**
```bash
# Install Yarn
npm install -g yarn

# Use Yarn commands
yarn install
yarn dev
```

**Using different Node.js versions:**
```bash
# Install nvm (Node Version Manager)
# Then use a specific Node version
nvm install 18
nvm use 18
npm install
```

---

## 📱 **Browser-Specific Issues**

### **Safari (Mac)**
- **Enable JavaScript:** Safari > Preferences > Security
- **Allow local files:** Develop menu > Disable local file restrictions

### **Internet Explorer/Edge Legacy**
- **Not supported** - use Chrome, Firefox, or modern Edge instead

### **Firefox**
- **Privacy settings** may block localhost
- **about:config** → set `network.proxy.allow_hijacking_localhost` to `true`

### **Chrome**
- **CORS issues:** Start with `--disable-web-security --user-data-dir=/tmp/chrome`
- **Extension conflicts:** Try incognito mode

---

## 🌐 **Network and Firewall Issues**

### **Corporate/School Networks**
- **Blocked ports:** Try `npm run dev -- --port 8080`
- **Proxy settings:** Ask IT for npm proxy configuration
- **VPN conflicts:** Try disconnecting VPN temporarily

### **Antivirus Software**
- **Windows Defender:** Add project folder to exclusions
- **McAfee/Norton:** Allow Node.js and npm in firewall settings

---

## 📊 **Data Issues**

### **ESPN Data Not Loading**
1. **Check League ID** - should be numeric (e.g., `123456`)
2. **Verify season year** - ESPN has different endpoints for different years
3. **Private league** - need SWID and espn_s2 cookies
4. **League deleted** - some old leagues are no longer accessible

### **Sleeper Data Issues**
1. **League ID format** - should be long string (e.g., `123456789012345678`)
2. **Public vs private** - most Sleeper leagues are public
3. **Season availability** - Sleeper only has recent data

---

## 🆘 **When All Else Fails**

### **Get Help Steps:**
1. **Document the exact error** - copy/paste error messages
2. **Note your environment:**
   - Operating system (Windows 10, macOS Monterey, etc.)
   - Node.js version (`node --version`)
   - Browser and version
3. **Try the nuclear reset** (complete reinstall)
4. **Ask your league's tech-savvy member** for help

### **Alternative Solutions:**
- **Use a different computer** (friend's laptop, work computer)
- **Cloud development environment** (GitHub Codespaces, Replit)
- **Ask someone else** to run it and share screenshots

---

## ✅ **Prevention Tips**

### **Future Updates:**
```bash
# Keep dependencies current
npm update

# Check for security issues
npm audit
npm audit fix
```

### **Backup Strategy:**
- **Keep a working copy** of your app folder
- **Document your working setup** (Node version, etc.)
- **Save your ESPN cookies** in a secure location

### **Best Practices:**
- **Don't install globally** unless absolutely necessary
- **Use exact Node.js versions** that you know work
- **Test changes** before important league events
- **Keep backups** of your working configuration

---

## 🎯 **Success Validation**

### **How to Know Everything is Working:**
- [ ] Terminal shows `Local: http://localhost:3000/`
- [ ] Browser loads the fantasy football app
- [ ] All 10 tabs are clickable and show content
- [ ] No red error messages in browser console
- [ ] Charts and data display properly
- [ ] App is responsive on mobile

### **If You're Still Stuck:**
Remember: **Your app is designed to work!** These troubleshooting steps solve 99% of issues. The most common problem is simply being in the wrong folder or needing to restart after installing Node.js.

**Keep trying - your league will be amazed when they see this professional fantasy football central hub!** 🏈🏆

---

*Most issues are simple fixes. Don't give up - you're closer than you think!*