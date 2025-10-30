# Bug Report Template

Use this template to report issues more effectively. Copy and fill out the relevant sections.

## 🐛 Bug Report

### Expected Behavior
**What should happen:**
- Example: "Tile should flip with animation when placing a piece"

### Actual Behavior  
**What actually happens:**
- Example: "No animation plays, piece just appears"

### Visual Issues Checklist
Use this to describe UI problems:

#### Layout
- [ ] **Alignment**: Elements not lined up properly
- [ ] **Spacing**: Too much/little space between elements
- [ ] **Size**: Component too big/small
- [ ] **Responsive**: Broken on mobile/desktop , the edge of the board is cut off on mobile
- [ ] **Overflow**: Content spilling outside container

#### Styling
- [ ] **Colors**: Wrong colors or invisible elements
- [ ] **Shadows**: Missing or too weak. maybe hard to see the pieces against the dark green background
- [ ] **Borders**: Missing, wrong size, or wrong color
- [ ] **Gradients**: Not showing or wrong direction
- [ ] **Transparency**: Too transparent or not transparent enough

#### Animations
- [ ] **Not triggering**: Animation should play but doesn't
- [ ] **Wrong speed**: Too fast or too slow
- [ ] **Glitchy**: Animation stutters or jumps
- [ ] **Wrong effect**: Different animation than expected

#### Interactions
- [ ] **Hover**: No hover effect or wrong effect
- [ ] **Click**: No click feedback
- [ ] **Focus**: Can't see which element is selected
- [ ] **Cursor**: Wrong cursor icon

### Steps to Reproduce
1. Open game
2. Click on specific tile at position [x, y]
3. Observe the issue

### Screenshots/Video
- [ ] I can provide a screenshot
- [ ] I can provide a screen recording

### Environment
- **Browser**: Chrome/Firefox/Safari/etc
- **Device**: Desktop/Mobile/Tablet
- **Screen size**: e.g., 1920x1080 or iPhone 14

---

## ✅ Feature Request

### Feature Description
**What feature do you want:**
- Clear description of the feature

### Why It's Needed
**Problem it solves:**
- Explain the problem or improvement

### Example
**How it should work:**
- Step by step description or mockup

---

## 📊 Your Recent Bug Report (Analyzed)

### What You Reported Well ✅
1. ✅ **No flip animation** - Clear, specific
2. ✅ **No last move golden glow** - Specific expected behavior
3. ✅ **All black pieces at start** - Specific data issue
4. ✅ **Pulse indicator works** - Positive confirmation helps!
5. ✅ **No 3D tile design** - Specific visual issue
6. ✅ **Spacing poorly executed** - Identified layout problem
7. ✅ **Board uneven with score box** - Specific alignment issue

### What Could Be More Specific 🔍

**"Drop shadows maybe too weak"**
- Better: "Drop shadows on tiles are barely visible, expected 3-5px dark shadow"

**"No hover effect with lift"**
- Better: "When hovering over valid moves, tiles don't lift up (expected 2-3px translateY)"

**"Okay contrast"**
- Better: "Contrast is acceptable BUT black pieces are hard to see on dark background"

**"No visual feedback on clicks"**
- Better: "When clicking a tile, there's no visual response (expected: tile to depress or scale down slightly)"

---

## 🎯 Perfect Bug Report Example

```
Bug: Flip animation not working

Expected: When I place a piece, the tile should rotate 
with a 0.6s animation showing the flip from empty to placed piece.

Actual: Piece just appears instantly, no animation.

Steps:
1. Start new game
2. Click any valid move (turquoise indicator)
3. Piece appears but no flip animation plays

Technical notes:
- Animation is defined in Tile.css (.tile-flip class)
- tile-flip class may not be added to element
- Or animation might be overridden by another CSS rule

Browser: Chrome 120
Device: MacBook Air, 1920x1080
```

---

## 🔍 How to Help Me Debug

### When Reporting Visual Issues:

1. **Use Browser DevTools**
   - Right-click element → Inspect
   - Check what CSS classes are applied
   - See if expected class is missing
   - Example: "Expected `.last-move` class but only seeing `.Tile .B`"

2. **Describe What You See vs. What You Expected**
   - ❌ "It looks wrong"
   - ✅ "Expected golden glow around tile, seeing no glow at all"

3. **Test Interactions**
   - Hover: Does anything happen?
   - Click: Any visual change?
   - After action: Does state update?

4. **Check Console**
   - Press F12 → Console tab
   - Any error messages? Copy them!

5. **Compare to Reference**
   - "Chess.com does [X], ours does [Y]"
   - Show me what you want it to look like

### When Reporting Functional Issues:

1. **Exact steps to reproduce**
2. **What data is wrong** (e.g., "Shows 8 black pieces, should show 2")
3. **When it happens** (always, sometimes, after specific action)
4. **What you tried** (refresh, restart, different browser)

---

## 🚀 Quick Test Checklist

Before reporting, test these:

### Visual
- [ ] Hard refresh (Cmd+Shift+R / Ctrl+Shift+F5)
- [ ] Try different browser
- [ ] Check on mobile view (DevTools responsive mode)

### Functional  
- [ ] Check browser console for errors
- [ ] Try restarting game
- [ ] Test with valid vs invalid moves

### Interaction
- [ ] Hover over different elements
- [ ] Click different types of tiles
- [ ] Try keyboard navigation (Tab, Enter)

---

**Remember**: More specific = Faster fix! 🎯

Your detailed feedback helps me:
1. Find the exact problem faster
2. Fix it correctly the first time  
3. Avoid breaking other things
4. Test the fix properly
