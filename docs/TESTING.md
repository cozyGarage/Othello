# Othello Testing Guide

**Version**: 2.1  
**Last Updated**: January 2, 2026  
**Status**: Stable ✅

---

## 📋 Table of Contents

1. [Testing Overview](#testing-overview)
2. [Test Architecture](#test-architecture)
3. [Running Tests](#running-tests)
4. [Test Coverage](#test-coverage)
5. [User Testing Guide](#user-testing-guide)
6. [Bug Reporting](#bug-reporting)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Testing Overview

This monorepo uses a **hybrid testing approach** with different test runners optimized for each package's specific requirements.

### Test Suite Summary

| Package          | Runner   | Tests                   | Status |
| ---------------- | -------- | ----------------------- | ------ |
| `othello-engine` | Bun Test | 144 passing             | ✅     |
| `othello-react`  | Vitest   | 169 passing (1 skipped) | ✅     |
| **Total**        | -        | **313 passing**         | ✅     |

> All tests passing. Core game functionality fully tested.

---

## 🏗️ Test Architecture

### Why Hybrid Testing?

#### Bun Test for Engine (`packages/othello-engine`)

- **Pure TypeScript/Logic**: No DOM dependencies, perfect for Bun's fast runtime
- **Performance**: Significantly faster than other test runners for pure logic tests
- **Simplicity**: Zero configuration, works out of the box
- **Coverage**: Game logic, AI algorithms, time control, and core functionality

#### Vitest for React App (`packages/othello-react`)

- **DOM Testing**: Full jsdom compatibility for React component testing
- **Vite Integration**: Seamless integration with the Vite build system
- **Rich Ecosystem**: Extensive plugins, better debugging, and community support
- **React Compatibility**: Better handling of React-specific testing scenarios
- **Coverage**: UI components, integration tests, and user interactions

### Configuration Files

#### Engine Package (`packages/othello-engine/package.json`)

```json
{
  "scripts": {
    "test": "bun test",
    "test:watch": "bun test --watch"
  }
}
```

#### React Package (`packages/othello-react/package.json`)

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

#### Vitest Configuration (`packages/othello-react/vitest.config.ts`)

```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
    globals: true,
    css: true,
  },
});
```

---

## 🚀 Running Tests

### All Tests (From Root)

```bash
# Run all tests sequentially
bun run test

# Or run individually
bun run test:engine
bun run test:react
```

### Engine Tests

```bash
# From root
bun run test:engine

# From engine package
cd packages/othello-engine
bun test

# Watch mode
bun test --watch

# Specific test file
bun test src/OthelloBot.test.ts
```

### React Tests

```bash
# From root
bun run test:react

# From React package
cd packages/othello-react
bun run test

# Watch mode (interactive)
bun run test:watch

# UI mode (browser-based)
bun run test:ui
```

---

## 📊 Test Coverage

### Engine Package Tests

| Category       | Tests | Description                                        |
| -------------- | ----- | -------------------------------------------------- |
| Game Logic     | 27    | Core Othello rules, scoring, valid moves           |
| Bot AI         | 48    | Easy/Medium/Hard difficulty, minimax, opening book |
| Game Engine    | 29    | Event-driven engine, state management, undo/redo   |
| Time Control   | 20    | Clock management, timeout detection, increment     |
| Pass Scenarios | 10    | Edge cases for turn passing                        |
| Opening Book   | 10    | Book lookups, move notation conversion             |

**Key Test Files:**

- `index.test.ts` - Basic game logic
- `index.advanced.test.ts` - Complex scenarios
- `OthelloBot.test.ts` - AI algorithms
- `OthelloGameEngine.test.ts` - Engine integration
- `TimeControl.test.ts` - Time management
- `pass-scenario.test.ts` - Pass edge cases
- `openingBook.test.ts` - Opening book

### React Package Tests

| Category          | Tests | Description                              |
| ----------------- | ----- | ---------------------------------------- |
| Board Component   | 28    | Rendering, interactions, animations      |
| Sidebar Component | 30    | Score display, move history, time        |
| Settings Panel    | 25    | Configuration, presets, feature toggles  |
| Integration       | 20    | Full app workflows                       |
| Features          | 40    | Feature flags, defaults, toggle behavior |
| UI Components     | 26    | Sound effects, time control, messages    |

**Key Test Files:**

- `Board.test.tsx` - Board rendering and interactions
- `Sidebar.test.tsx` - Sidebar components
- `SettingsPanel.test.tsx` - Settings functionality
- `integration.test.ts` - End-to-end flows
- `features.test.ts` - Feature flag system
- `soundEffects.test.ts` - Audio system
- `ui.test.tsx` - UI component tests

---

## 🧪 User Testing Guide

This section provides manual testing scenarios for evaluating the Othello game features.

### Pre-Test Setup

#### System Requirements

- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Audio**: Speakers or headphones (required for sound testing)
- **Screen**: 320px minimum width (responsive design)
- **Connection**: Local development server

#### Access the Application

1. Navigate to project: `cd Othello/packages/othello-react`
2. Start dev server: `bun run dev`
3. Open browser to: **http://localhost:3000/Othello/** (or port shown)
4. Verify app loads (8x8 board, 4 pieces in center)

#### Initial State Check

- [ ] Board displays correctly (8x8 grid, all columns visible)
- [ ] Sidebar visible with score and controls
- [ ] Settings button (⚙️) accessible
- [ ] No console errors (F12 → Console tab)

---

### Test Scenarios

#### Test 1: Basic Gameplay

**Goal**: Verify core game mechanics work correctly

**Steps**:

1. Click any highlighted valid move position
2. Observe piece placement and flipping animation
3. Check score updates
4. Verify turn indicator changes

**Expected Results**:

- [ ] Piece appears with flip animation
- [ ] Opponent pieces flip to your color
- [ ] Score updates immediately
- [ ] Turn passes to opponent

---

#### Test 2: AI Opponent

**Goal**: Test AI difficulty levels

**Steps**:

1. Open settings (⚙️)
2. Select AI difficulty: Easy → Medium → Hard
3. Play against each level

**Expected Results**:

| Difficulty | Behavior                          |
| ---------- | --------------------------------- |
| Easy       | Random valid moves                |
| Medium     | Maximizes immediate score         |
| Hard       | Strategic, considers future moves |

---

#### Test 3: Time Control

**Goal**: Verify chess-style time control system

**Steps**:

1. Open settings (⚙️)
2. Enable "Time Control"
3. Select preset (Bullet/Blitz/Rapid/Classical)
4. Play and observe time countdown

**Expected Results**:

| Preset    | Initial Time | Increment | Display |
| --------- | ------------ | --------- | ------- |
| Bullet    | 1 minute     | None      | 1:00    |
| Blitz     | 3 minutes    | 2 seconds | 3:00    |
| Rapid     | 10 minutes   | 5 seconds | 10:00   |
| Classical | 30 minutes   | None      | 30:00   |

**Time Visual States**:

- **> 20 seconds**: Normal (green/teal)
- **10-20 seconds**: Warning (yellow/amber)
- **< 10 seconds**: Critical (red + pulse animation)

**Time Audio Cues**:

- **10 seconds**: Two-tone warning beep (plays once)
- **Increment**: Pleasant chime when time added
- **Timeout**: Urgent alarm sound

---

#### Test 4: Undo/Redo

**Goal**: Verify move history functionality

**Steps**:

1. Make 3-4 moves
2. Click Undo (↶) button
3. Click Redo (↷) button
4. Test keyboard shortcuts (Ctrl+Z / Ctrl+Y)

**Expected Results**:

- [ ] Undo restores previous board state
- [ ] Redo reapplies undone move
- [ ] Score and turn update correctly
- [ ] Time values preserved (if time control enabled)

---

#### Test 5: Responsive Layout

**Goal**: Verify UI works on all screen sizes

**Steps**:

1. Test on desktop (1400px+)
2. Resize to tablet (768px-1024px)
3. Resize to mobile (320px-480px)
4. Test on actual mobile device

**Expected Results**:

| Width      | Layout                         | Board                 |
| ---------- | ------------------------------ | --------------------- |
| 1400px+    | Side-by-side (board + sidebar) | All 8 columns visible |
| 768-1024px | Side-by-side/Stacked           | All 8 columns visible |
| 480-768px  | Stacked (board above sidebar)  | All 8 columns visible |
| 320-480px  | Stacked, compact elements      | All 8 columns visible |
| < 320px    | Ultra-compact                  | All 8 columns visible |

---

#### Test 6: Sound Effects

**Goal**: Verify audio feedback system

**Steps**:

1. Enable sound in settings
2. Make moves (listen for flip sound)
3. With time control: wait for 10-second warning
4. Let time expire (timeout sound)

**Expected Results**:

- [ ] Flip sound plays on piece placement
- [ ] Time warning beep at 10 seconds (once only)
- [ ] Increment "ding" when time added (Blitz/Rapid)
- [ ] Timeout alarm when time expires
- [ ] Sounds don't overlap unpleasantly

---

#### Test 7: Persistence (localStorage)

**Goal**: Verify settings save across sessions

**Steps**:

1. Configure settings (theme, time control, AI difficulty)
2. Refresh the page (F5)
3. Verify settings restored

**Expected Results**:

- [ ] Theme preference persists
- [ ] Time control enabled/disabled persists
- [ ] Time preset selection persists
- [ ] Sound preferences persist

---

#### Test 8: Light/Dark Theme

**Goal**: Test theme switching

**Steps**:

1. Toggle theme in settings
2. Verify all UI elements update
3. Test readability in both themes

**Expected Results**:

- [ ] Board colors adapt appropriately
- [ ] Text is readable in both themes
- [ ] Settings panel text visible (including descriptions)
- [ ] No visual glitches during switch

---

#### Test 9: Game Replay

**Goal**: Test the game replay feature

**Steps**:

1. Play a complete game (or several moves)
2. Click "Replay" button in action bar
3. Use replay controls to navigate

**Expected Results**:

- [ ] Replay modal opens
- [ ] Can step through moves forward/backward
- [ ] Board updates correctly at each step
- [ ] Can close replay and return to game

---

#### Test 10: Edge Cases

**Test these scenarios**:

- [ ] Rapid clicking during AI turn (should be ignored)
- [ ] Browser tab sleep/resume mid-game
- [ ] Window resize during animation
- [ ] Undo at game start (should be disabled)
- [ ] Pass scenarios (when player has no valid moves)
- [ ] Full board (game end detection)
- [ ] Both players unable to move (immediate game end)

---

## 🐛 Bug Reporting

### Severity Levels

#### Critical (App Broken)

- Game crashes or freezes
- Board doesn't render
- Time control completely broken
- Data loss on refresh

#### Major (Feature Impaired)

- Sounds don't play when enabled
- Animations don't work
- Wrong score displayed
- Undo/redo corrupts game state

#### Minor (Polish Issues)

- Visual glitches
- Typos or unclear labels
- Animation timing issues
- Minor layout problems

### Bug Report Format

```markdown
**Summary**: [Brief description]
**Severity**: [Critical/Major/Minor]

**Steps to Reproduce**:

1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result**: [What should happen]
**Actual Result**: [What actually happens]

**Environment**:

- Browser: [Chrome 120 / Firefox 122 / Safari 17]
- OS: [Windows 11 / macOS 14 / iOS 17]
- Screen size: [1920x1080 / 375x667]

**Screenshot**: [If applicable]
**Console Errors**: [Copy any errors from F12 → Console]
```

---

## 🔧 Troubleshooting

### Engine Tests

| Issue             | Solution                                   |
| ----------------- | ------------------------------------------ |
| Tests not found   | Ensure you're in `packages/othello-engine` |
| TypeScript errors | Run `bun install` to update dependencies   |
| Import errors     | Check relative paths in test files         |
| Timeout failures  | Some bot tests are slow; this is expected  |

### React Tests

| Issue               | Solution                                      |
| ------------------- | --------------------------------------------- |
| jsdom errors        | Verify Vitest environment config              |
| Component not found | Check import paths                            |
| Web Audio warnings  | Expected in test environment (safe to ignore) |
| Feature flag errors | Known issue with import paths                 |

### Development Server

| Issue             | Solution                         |
| ----------------- | -------------------------------- |
| Port in use       | Server will auto-select new port |
| Build errors      | Run `bun install` then retry     |
| Hot reload broken | Restart with `bun run dev`       |

### Common Fixes

```bash
# Clear cache and reinstall
rm -rf node_modules
bun install

# Reset localStorage (in browser console)
localStorage.clear()

# Check for build errors
bun run build
```

---

## 🔄 Migration History

### Previous Setup

- All tests used Bun test
- ✅ Engine tests worked perfectly
- ❌ React integration tests failed due to jsdom incompatibility

### Current Setup (Hybrid)

- ✅ Engine tests: Bun test (fast, reliable)
- ✅ React tests: Vitest (DOM-compatible, feature-rich)
- Benefits: Best tool for each job, future-proof, better developer experience

### Future Considerations

- Monitor Bun's jsdom compatibility improvements
- Consider unified testing if Bun resolves DOM testing issues
- Add E2E tests with Playwright for critical user flows
- Keep testing frameworks updated

---

## 📞 Support

**Questions during testing?**

1. Check browser console for errors (F12)
2. Try refreshing the page
3. Clear localStorage: `localStorage.clear()` in console
4. Restart dev server: `Ctrl+C`, then `bun run dev`

**Resources**:

- GitHub Issues: Create detailed bug reports
- Documentation: `/docs` folder
- Live Demo: https://cozygarage.github.io/Othello/

---

**Thank you for testing! 🎮**

Your feedback helps make Othello better for everyone.
