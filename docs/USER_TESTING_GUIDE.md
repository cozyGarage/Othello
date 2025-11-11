# Time Control Feature - User Testing Guide

**Version**: 1.0  
**Date**: November 11, 2025  
**Status**: Ready for Alpha Testing  
**Test Duration**: 15-20 minutes per session

---

## 🎯 Testing Objectives

This guide will help you evaluate the **Time Control** feature for the Othello game. We want your feedback on:

1. **Usability** - Is it easy to understand and use?
2. **Audio Feedback** - Are sounds helpful or annoying?
3. **Visual Feedback** - Do animations enhance or distract?
4. **Performance** - Does it feel smooth and responsive?
5. **Preferences** - Does localStorage work as expected?

---

## 📋 Pre-Test Setup

### System Requirements

- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Audio**: Speakers or headphones (required for sound testing)
- **Screen**: 1024x768 minimum resolution
- **Connection**: Local development server

### Access the Application

1. Open terminal and navigate to project: `cd Othello/packages/othello-react`
2. Start dev server: `bun run dev`
3. Open browser to: **http://localhost:3000/Othello/**
4. Verify app loads (you should see the Othello board)

### Initial State Check

- [ ] Board displays correctly (8x8 grid, 4 pieces in center)
- [ ] Sidebar visible on right side
- [ ] Settings button (⚙️) visible in navbar
- [ ] No console errors (F12 → Console tab)

---

## 🧪 Test Scenarios

### Test 1: Enable Time Control

**Goal**: Verify basic enable/disable functionality

**Steps**:

1. Click settings button (⚙️) in navbar
2. Scroll to "Time Control" section
3. Toggle "Enable Time Control" to ON
4. Observe the sidebar

**Expected Results**:

- [ ] Two time displays appear (one for Black, one for White)
- [ ] Times show "3:00" (default Blitz preset)
- [ ] Time displays have clock emoji (⏱️)
- [ ] Settings panel closes when you click outside it

**Questions for Tester**:

- Was it clear where to enable time control?
- Did the time displays appear in a logical location?
- Were the default values intuitive?

---

### Test 2: Preset Selection

**Goal**: Test all four time presets

**Steps**:

1. Open settings (⚙️)
2. Verify "Enable Time Control" is ON
3. Select each preset from dropdown:
   - **Bullet** (1+0)
   - **Blitz** (3+2)
   - **Rapid** (10+5)
   - **Classical** (30+0)
4. For each preset, check the time display

**Expected Results**:
| Preset | Initial Time | Increment | Display Shows |
|--------|--------------|-----------|---------------|
| Bullet | 1 minute | None | 1:00 |
| Blitz | 3 minutes | 2 seconds | 3:00 |
| Rapid | 10 minutes | 5 seconds | 10:00 |
| Classical | 30 minutes | None | 30:00 |

**Questions for Tester**:

- Are the preset names clear (Bullet, Blitz, etc.)?
- Do you understand what "3+2" means?
- Would you like tooltips explaining each preset?

---

### Test 3: Time Countdown

**Goal**: Verify time decreases correctly

**Steps**:

1. Ensure time control enabled with **Bullet** preset (fastest)
2. Start a new game (refresh page or click "New Game")
3. Make a move (click any valid square)
4. Watch the time displays

**Expected Results**:

- [ ] **Before move**: Black's time shows green, counting down
- [ ] **After move**: White's time shows green, counting down
- [ ] Black's time **stops** when you make the move
- [ ] Time format changes when < 60s: "3:45" → "59" (no minutes)
- [ ] Countdown is smooth (updates ~10 times per second)

**Questions for Tester**:

- Is it clear whose clock is running?
- Does the countdown feel smooth or choppy?
- Is the color coding helpful (green = normal, yellow = warning)?

---

### Test 4: Increment Behavior (Blitz Preset)

**Goal**: Verify Fischer increment adds time

**Steps**:

1. Select **Blitz** preset (3+2)
2. Note Black's starting time: **3:00**
3. Make a move as Black
4. Observe Black's time after the move

**Expected Results**:

- [ ] Black's time **increases** by 2 seconds after move
- [ ] Example: 2:58 (before move) → 3:00 (after move)
- [ ] **Sound**: Subtle "ding" plays when time is added
- [ ] **Visual**: Brief yellow flash on time display

**Questions for Tester**:

- Did you notice time was added?
- Was the increment sound too loud/quiet/just right?
- Was the flash animation helpful or distracting?

---

### Test 5: Time Warning (Low Time)

**Goal**: Test 10-second warning system

**Steps**:

1. Select **Bullet** preset (1 minute, no increment)
2. Play slowly until Black's time drops below **10 seconds**
3. Listen and watch carefully as time passes 10s

**Expected Results**:

- [ ] **Sound**: Two-tone beep plays ONCE at 10s (not repeatedly)
- [ ] **Visual**: Time display turns **red** (critical urgency)
- [ ] **Animation**: Time display **pulses** with red glow
- [ ] Time format shows seconds only: "9" not "0:09"

**Questions for Tester**:

- Did the warning sound startle you or feel appropriate?
- Is the pulsing animation helpful or anxiety-inducing?
- Would you prefer a different warning threshold (5s? 15s?)?
- Did the sound play only once? (Important!)

---

### Test 6: Timeout Scenario

**Goal**: Verify game ends when time runs out

**Steps**:

1. Select **Bullet** preset
2. Make moves slowly as Black until time reaches **0:00**
3. Wait for time to expire completely

**Expected Results**:

- [ ] Game ends immediately when time hits 0
- [ ] **Message**: "Game Over! Black ran out of time. White wins!"
- [ ] **Sound**: Alarm sound plays (distinct from normal game over)
- [ ] Both timers stop
- [ ] Can't make any more moves

**Questions for Tester**:

- Was it clear WHY the game ended?
- Was the timeout sound too harsh/appropriate?
- Did you feel rushed (good!) or stressed (bad!)?

---

### Test 7: Persistence (localStorage)

**Goal**: Verify preferences save across sessions

**Steps**:

1. Open settings, enable time control
2. Select **Rapid** preset (10+5)
3. Close settings
4. **Refresh the page** (F5 or Ctrl+R)
5. Check time displays

**Expected Results**:

- [ ] Time control still enabled after refresh
- [ ] **Rapid** preset still selected (shows 10:00)
- [ ] No need to re-enable or re-select

**Steps (Disable Test)**:

1. Open settings, **disable** time control
2. Refresh page
3. Time displays should **not** appear

**Questions for Tester**:

- Did preferences persist as expected?
- Is "remember my settings" a feature you appreciate?
- Any surprises with this behavior?

---

### Test 8: Undo/Redo with Time Control

**Goal**: Verify time state preserved in undo/redo

**Steps**:

1. Enable time control (any preset)
2. Make 3-4 moves
3. Note current time for both players
4. Click "Undo" button
5. Click "Redo" button

**Expected Results**:

- [ ] Time values restore correctly on undo
- [ ] Time values restore correctly on redo
- [ ] No time loss/gain from undo/redo operations
- [ ] Current player's clock resumes correctly

**Questions for Tester**:

- Did undo/redo work as expected?
- Any confusion about whose clock is running?

---

### Test 9: Settings Panel Time Controls

**Goal**: Verify all time control settings work together

**Steps**:

1. Enable time control
2. Select different presets while time is running
3. Disable time control mid-game
4. Re-enable with different preset

**Expected Results**:

- [ ] Changing presets mid-game resets time to new preset
- [ ] Disabling mid-game stops all timers
- [ ] Re-enabling creates fresh game with new times
- [ ] Game state (board, moves) preserved during toggling

**Questions for Tester**:

- Any unexpected behavior when changing settings?
- Is it clear that changing presets resets the game?

---

### Test 10: Visual Urgency States

**Goal**: Evaluate time display color coding

**Setup**: Use Bullet preset, play until you experience all states

**Time Ranges to Test**:

1. **> 20 seconds**: Normal (green/teal)
2. **10-20 seconds**: Warning (yellow/amber)
3. **< 10 seconds**: Critical (red + pulse)

**Questions for Tester**:

- Are the color transitions smooth?
- Do the colors effectively communicate urgency?
- Is the color coding accessible (colorblind-friendly)?
- Suggestions for better visual indicators?

---

## 🐛 Bug Reporting

If you encounter issues, please note:

### Critical Bugs (App Broken)

- [ ] Time doesn't count down at all
- [ ] Game doesn't end when time expires
- [ ] Settings don't save/load
- [ ] Crashes or console errors

### Major Bugs (Feature Impaired)

- [ ] Sounds don't play
- [ ] Animations don't work
- [ ] Wrong time displayed
- [ ] Undo/redo breaks time state

### Minor Bugs (Polish Issues)

- [ ] Visual glitches
- [ ] Typos or unclear labels
- [ ] Sound timing issues
- [ ] Animation too fast/slow

### Format for Bug Reports

```
**What I did**: [steps to reproduce]
**What I expected**: [expected behavior]
**What happened**: [actual behavior]
**Browser**: [Chrome/Firefox/Safari/Edge + version]
**Screenshot**: [if applicable]
```

---

## 💭 Feedback Questions

### Overall Experience

1. On a scale of 1-10, how would you rate the time control feature?
2. Did time controls make the game more engaging?
3. Would you use this feature regularly?

### Audio Feedback

1. Were sounds helpful, annoying, or neutral?
2. Volume levels appropriate? (Too loud / Too quiet / Just right)
3. Favorite sound: **\_** | Least favorite: **\_**
4. Should there be a "mute time sounds" option?

### Visual Feedback

1. Were animations helpful or distracting?
2. Pulse animation: (Too intense / Just right / Too subtle)
3. Flash animation: (Too intense / Just right / Too subtle)
4. Color urgency system: (Clear / Confusing / Needs improvement)

### Usability

1. Was it easy to find time control settings?
2. Were preset names (Bullet, Blitz, etc.) intuitive?
3. Did you understand the "X+Y" notation? (e.g., "3+2")
4. Any features missing that you expected?

### Performance

1. Did the app feel responsive?
2. Any lag or stuttering?
3. Battery drain concerns (mobile users)?

### Suggestions

1. What would you change?
2. What worked really well?
3. Any additional features you'd like?

---

## 📊 Testing Checklist Summary

Copy this checklist for quick status tracking:

### Functionality

- [ ] Enable/disable time control works
- [ ] All 4 presets selectable
- [ ] Time counts down correctly
- [ ] Increment adds time (Blitz/Rapid)
- [ ] Warning plays at 10 seconds
- [ ] Timeout ends game
- [ ] Preferences persist across refresh

### Audio

- [ ] Flip sound plays on move
- [ ] Increment "ding" plays (if increment > 0)
- [ ] Warning beep plays at 10s
- [ ] Timeout alarm plays on expiration
- [ ] Sounds don't overlap unpleasantly

### Visual

- [ ] Time displays appear/disappear correctly
- [ ] Countdown animation smooth
- [ ] Color changes (green → yellow → red)
- [ ] Pulse animation on critical time
- [ ] Flash animation on increment

### Edge Cases

- [ ] Works after undo/redo
- [ ] Works after game restart
- [ ] Handles preset switching mid-game
- [ ] No errors in console (F12)

---

## 🚀 Next Steps

After completing testing:

1. **Fill out feedback form** (or send notes to developer)
2. **Rate severity** of any bugs found
3. **Suggest improvements** for next iteration
4. **Share**: Would you recommend this to other players?

---

## 📞 Support

**Questions during testing?**

- Check console for errors (F12)
- Try refreshing the page
- Clear localStorage: `localStorage.clear()` in console
- Restart dev server: `Ctrl+C`, then `bun run dev`

**Contact**:

- GitHub Issues: [Create detailed bug report]
- Developer: [Your contact info]

---

**Thank you for testing! 🎮**

Your feedback helps make this feature better for everyone.
