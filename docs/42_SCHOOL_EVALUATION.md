# Othello - 42 School Evaluation Sheet

```
███████╗██╗   ██╗ █████╗ ██╗     ██╗   ██╗ █████╗ ████████╗██╗ ██████╗ ███╗   ██╗
██╔════╝██║   ██║██╔══██╗██║     ██║   ██║██╔══██╗╚══██╔══╝██║██╔═══██╗████╗  ██║
█████╗  ██║   ██║███████║██║     ██║   ██║███████║   ██║   ██║██║   ██║██╔██╗ ██║
██╔══╝  ╚██╗ ██╔╝██╔══██║██║     ██║   ██║██╔══██║   ██║   ██║██║   ██║██║╚██╗██║
███████╗ ╚████╔╝ ██║  ██║███████╗╚██████╔╝██║  ██║   ██║   ██║╚██████╔╝██║ ╚████║
╚══════╝  ╚═══╝  ╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝
```

**Evaluator**: **\*\*\*\***\_\_\_\_**\*\*\*\***  
**Evaluated Student**: **\*\*\*\***\_\_\_\_**\*\*\*\***  
**Date**: **\*\*\*\***\_\_\_\_**\*\*\*\***  
**Duration**: 45-60 minutes

---

## Introduction

Welcome! You are about to evaluate a peer's Othello project.

**Your role as evaluator**:

- Be rigorous but fair
- Test thoroughly (don't just trust what you see)
- Ask questions to verify understanding
- Help your peer learn from mistakes

**Evaluation Process**:

1. Clone the repository
2. Check submission format
3. Test each requirement systematically
4. Fill in this evaluation sheet
5. Calculate final grade
6. Provide constructive feedback

**Grading Scale**:

- **0-99 points**: Fail (major requirements missing)
- **100-110 points**: Pass (all mandatory features)
- **110-125 points**: Excellent (bonus features)
- **125+ points**: Outstanding (advanced bonuses)

---

## Preliminary Checks

### Submission Format (Mandatory)

Check each item. If ANY fail, evaluation stops immediately (grade = -42):

| Check                                          | Status        | Notes |
| ---------------------------------------------- | ------------- | ----- |
| Repository clones successfully                 | ☐ Pass ☐ Fail |       |
| No forbidden files (node_modules, .env, etc.)  | ☐ Pass ☐ Fail |       |
| README.md exists and is complete               | ☐ Pass ☐ Fail |       |
| package.json has all dependencies              | ☐ Pass ☐ Fail |       |
| TypeScript strict mode enabled (tsconfig.json) | ☐ Pass ☐ Fail |       |
| Git history is clean (meaningful commits)      | ☐ Pass ☐ Fail |       |

**If all Pass**: Continue evaluation ✅  
**If any Fail**: Stop here. Grade = -42 ❌

---

## Installation & Setup (5 minutes)

Follow these steps **exactly**:

```bash
# 1. Clone repository
git clone [repo_url] && cd Othello

# 2. Install dependencies
bun install
# OR: npm install / pnpm install / yarn install

# 3. Run tests
bun test
# Must see: "X pass, 0 fail" (X >= 100)

# 4. Run linter
bun run lint
# Must see: "No errors" or "✓ 0 problems"

# 5. Start dev server
bun run dev
# Must see: "Local: http://localhost:XXXX"
```

### Installation Checklist

| Step                                | Result     | Notes                  |
| ----------------------------------- | ---------- | ---------------------- |
| Dependencies install without errors | ☐ Yes ☐ No |                        |
| Tests run and pass (≥80% of tests)  | ☐ Yes ☐ No | Total: \_**\_ / \_\_** |
| Linter passes (zero errors)         | ☐ Yes ☐ No | Warnings: \_\_\_\_     |
| Dev server starts successfully      | ☐ Yes ☐ No | Port: \_\_\_\_         |
| Browser loads app correctly         | ☐ Yes ☐ No | URL: \***\*\_\_\*\***  |

**If any "No"**: Note the issue, deduct points from Code Quality section.

---

## Part 1: Core Game Engine (40 points)

Open the browser and start testing.

### 1.1 Initial Board State (5 points)

**Test**: Refresh the page and observe the board.

| Check                                        | Points | Status |
| -------------------------------------------- | ------ | ------ |
| Board is 8×8 grid                            | 1      | ☐      |
| 4 pieces in center (2 black, 2 white)        | 2      | ☐      |
| Correct starting position (diagonal pattern) | 1      | ☐      |
| Valid moves highlighted for Black player     | 1      | ☐      |

**Expected starting position**:

```
  a b c d e f g h
8 · · · · · · · ·
7 · · · · · · · ·
6 · · · · · · · ·
5 · · · ⚪ ⚫ · · ·
4 · · · ⚫ ⚪ · · ·
3 · · · · · · · ·
2 · · · · · · · ·
1 · · · · · · · ·
```

**Points Earned**: \_\_\_\_ / 5

---

### 1.2 Move Validation (10 points)

**Test**: Try these specific moves in a NEW game:

| Move                             | Expected    | Result        | Points |
| -------------------------------- | ----------- | ------------- | ------ |
| d3 (valid for Black)             | ✅ Allowed  | ☐ Pass ☐ Fail | 2      |
| d4 (occupied)                    | ❌ Rejected | ☐ Pass ☐ Fail | 2      |
| a1 (no flips)                    | ❌ Rejected | ☐ Pass ☐ Fail | 2      |
| d6 (valid for Black after d3)    | ✅ Allowed  | ☐ Pass ☐ Fail | 2      |
| Invalid move shows error message | ✅ Yes      | ☐ Pass ☐ Fail | 2      |

**Verification Questions** (ask the student):

1. "How does your code check all 8 directions?"
2. "What happens if you click an occupied square?"

**Points Earned**: \_\_\_\_ / 10

---

### 1.3 Piece Flipping (10 points)

**Test Scenario**: New game, make move at **d3** (Black)

| Check                                        | Points | Status |
| -------------------------------------------- | ------ | ------ |
| Move is accepted                             | 2      | ☐      |
| White piece at d4 flips to Black             | 3      | ☐      |
| Only affected pieces flip (not all)          | 2      | ☐      |
| Player turn switches to White                | 2      | ☐      |
| Score updates correctly (Black: 4, White: 1) | 1      | ☐      |

**Multi-Direction Test**: Continue game to create a move that flips in 2+ directions.

| Check                               | Points | Status |
| ----------------------------------- | ------ | ------ |
| Pieces flip in ALL valid directions | 3      | ☐      |

**Ask student**: "Show me in the code where you handle multi-directional flipping."

**Points Earned**: \_\_\_\_ / 10

---

### 1.4 Game State & Rules (15 points)

#### Pass Detection (5 points)

**Test**: Set up a scenario where a player has no valid moves.

| Check                                     | Points | Status |
| ----------------------------------------- | ------ | ------ |
| Player with no moves automatically passes | 3      | ☐      |
| Message indicates pass occurred           | 1      | ☐      |
| Turn switches to opponent                 | 1      | ☐      |

#### Game Over Detection (5 points)

**Test**: Play until game ends (or use console to force full board).

| Check                                     | Points | Status |
| ----------------------------------------- | ------ | ------ |
| Game ends when both players have no moves | 2      | ☐      |
| Winner is announced correctly             | 2      | ☐      |
| No more moves allowed after game over     | 1      | ☐      |

#### State Serialization (5 points)

**Test**: Open browser console, run:

```javascript
// Export state
const state = window.engine.exportState();
console.log(state);

// Make some moves
// ...

// Import state
window.engine.importState(state);
```

| Check                                     | Points | Status |
| ----------------------------------------- | ------ | ------ |
| exportState() returns complete game state | 2      | ☐      |
| importState() restores board exactly      | 2      | ☐      |
| importState() restores player turn        | 1      | ☐      |

**Points Earned**: \_\_\_\_ / 15

---

## Part 2: User Interface (30 points)

### 2.1 Board Display (10 points)

| Check                                      | Points | Status |
| ------------------------------------------ | ------ | ------ |
| Grid is clearly visible (borders/lines)    | 2      | ☐      |
| Black and White pieces are distinguishable | 2      | ☐      |
| Valid moves are highlighted                | 2      | ☐      |
| Last move is indicated (highlight/marker)  | 2      | ☐      |
| Responsive on mobile (test at 375px width) | 2      | ☐      |

**Responsive Test**: Resize browser to phone width (F12 → Device Toolbar).

**Points Earned**: \_\_\_\_ / 10

---

### 2.2 Game Controls (10 points)

| Control                                | Points | Status | Notes |
| -------------------------------------- | ------ | ------ | ----- |
| "New Game" button exists and works     | 2      | ☐      |       |
| Undo button (disabled when no history) | 2      | ☐      |       |
| Redo button (disabled appropriately)   | 2      | ☐      |       |
| Settings panel opens/closes            | 2      | ☐      |       |
| Clear player turn indicator            | 1      | ☐      |       |
| Score display updates in real-time     | 1      | ☐      |       |

**Test Undo/Redo**:

1. Make 3 moves
2. Click Undo → verify previous state restored
3. Click Redo → verify move re-applied
4. Make new move → verify redo stack cleared

**Points Earned**: \_\_\_\_ / 10

---

### 2.3 Move History & Feedback (10 points)

| Feature                              | Points | Status | Notes |
| ------------------------------------ | ------ | ------ | ----- |
| Move history displays all moves      | 3      | ☐      |       |
| Algebraic notation used (e.g., "d3") | 2      | ☐      |       |
| Timestamps shown for each move       | 1      | ☐      |       |
| Animation on piece flip              | 2      | ☐      |       |
| Error message for invalid moves      | 2      | ☐      |       |

**Test**: Make 5 moves and verify history shows all 5 with correct notation.

**Points Earned**: \_\_\_\_ / 10

---

## Part 3: AI Opponent (20 points)

### 3.1 AI Configuration (5 points)

**Test**: Open settings, find AI controls.

| Check                                    | Points | Status |
| ---------------------------------------- | ------ | ------ |
| Can enable/disable AI                    | 2      | ☐      |
| Can select AI player (Black or White)    | 2      | ☐      |
| Can choose difficulty (Easy/Medium/Hard) | 1      | ☐      |

---

### 3.2 Easy AI (5 points)

**Test**: Enable AI (Easy difficulty), play 10 moves against it.

| Check                                | Points | Status |
| ------------------------------------ | ------ | ------ |
| AI makes valid moves only            | 2      | ☐      |
| Moves appear random (not strategic)  | 2      | ☐      |
| Move time is reasonable (< 1 second) | 1      | ☐      |

**Ask student**: "How does Easy AI select moves?"  
**Expected answer**: "Randomly from valid moves"

---

### 3.3 Medium AI (5 points)

**Test**: Enable AI (Medium difficulty), play 10 moves.

| Check                                | Points | Status |
| ------------------------------------ | ------ | ------ |
| AI makes valid moves only            | 1      | ☐      |
| AI tends to maximize flips (greedy)  | 2      | ☐      |
| Same board position → same AI move   | 1      | ☐      |
| Move time is reasonable (< 1 second) | 1      | ☐      |

**Ask student**: "What algorithm does Medium AI use?"  
**Expected answer**: "Greedy algorithm - maximizes immediate piece flips"

---

### 3.4 Hard AI (5 points)

**Test**: Enable AI (Hard difficulty), play 10 moves.

| Check                                   | Points | Status |
| --------------------------------------- | ------ | ------ |
| AI makes valid moves only               | 1      | ☐      |
| AI plays strategically (corners, edges) | 2      | ☐      |
| Move time acceptable (< 3 seconds)      | 1      | ☐      |
| Hard AI beats Easy AI (spectate mode)   | 1      | ☐      |

**Ask student**:

1. "What algorithm powers Hard AI?"
2. "What is the search depth?"
3. "How do you evaluate positions?"

**Expected answers**:

1. "Minimax with alpha-beta pruning"
2. "At least 4 plies / moves ahead"
3. "Position-based heuristic (corners valuable, edges good, etc.)"

**Points Earned**: \_\_\_\_ / 20

---

## Part 4: Time Controls (10 points)

### 4.1 Time Control System (5 points)

**Test**: Enable time control in settings.

| Check                                               | Points | Status |
| --------------------------------------------------- | ------ | ------ |
| Time displays appear for both players               | 1      | ☐      |
| Can enable/disable time control                     | 1      | ☐      |
| Can select preset (Bullet, Blitz, Rapid, Classical) | 1      | ☐      |
| Correct initial times displayed                     | 1      | ☐      |
| Time counts down for active player                  | 1      | ☐      |

---

### 4.2 Time Control Features (5 points)

**Test**: Select Blitz preset (3+2), play game.

| Feature                                        | Points | Status | Notes               |
| ---------------------------------------------- | ------ | ------ | ------------------- |
| Time decreases while clock running             | 1      | ☐      |                     |
| Increment adds time after move (if applicable) | 1      | ☐      | 2 seconds for Blitz |
| Game ends when time expires (timeout)          | 1      | ☐      |                     |
| Timeout message is clear                       | 1      | ☐      |                     |
| Time preserved in undo/redo                    | 1      | ☐      |                     |

**Increment Test**:

- Start time: 3:00
- Make move when 2:58 remaining
- After move, time should be ~3:00 (2:58 + 2s increment)

**Points Earned**: \_\_\_\_ / 10

---

## Code Quality Evaluation (30 points)

### 5.1 TypeScript Type Safety (10 points)

**Check**: Open project in VSCode, review code.

| Check                                       | Points | Status |
| ------------------------------------------- | ------ | ------ |
| No `any` types (or justified with comments) | 3      | ☐      |
| All functions have return types             | 2      | ☐      |
| Interfaces/types well-defined               | 2      | ☐      |
| No `@ts-ignore` or `@ts-nocheck`            | 2      | ☐      |
| Strict mode enabled in tsconfig.json        | 1      | ☐      |

**Ask student**: "Why did you choose this type here?" (pick a complex type)

**Points Earned**: \_\_\_\_ / 10

---

### 5.2 Architecture & Organization (10 points)

| Check                                                     | Points | Status |
| --------------------------------------------------------- | ------ | ------ |
| Engine is separate from UI (no mixing)                    | 3      | ☐      |
| Files organized logically (folders for components, utils) | 2      | ☐      |
| Event-driven communication (Observer pattern)             | 2      | ☐      |
| No global variables/state                                 | 2      | ☐      |
| SOLID principles followed                                 | 1      | ☐      |

**Ask student**: "Walk me through your architecture. How do engine and UI communicate?"

**Points Earned**: \_\_\_\_ / 10

---

### 5.3 Documentation & Testing (10 points)

| Category                                | Points | Status | Notes           |
| --------------------------------------- | ------ | ------ | --------------- |
| **Documentation**                       |        |        |                 |
| README is comprehensive                 | 2      | ☐      |                 |
| JSDoc comments on public functions      | 2      | ☐      |                 |
| Inline comments for complex logic       | 1      | ☐      |                 |
| **Testing**                             |        |        |                 |
| Test coverage ≥ 80%                     | 2      | ☐      | Actual: \_\_\_% |
| Edge cases tested (corners, full board) | 2      | ☐      |                 |
| Tests are meaningful (not just mocks)   | 1      | ☐      |                 |

**Check test coverage**:

```bash
bun test --coverage
# OR: npm test -- --coverage
```

**Points Earned**: \_\_\_\_ / 10

---

## Correctness Testing (20 points)

### 6.1 Edge Cases (10 points)

Test these specific scenarios:

#### Corner Move (3 points)

**Test**: Make move at a1 (corner) when valid.

| Check                              | Points | Status |
| ---------------------------------- | ------ | ------ |
| Corner move accepted when valid    | 1      | ☐      |
| Flipping works correctly in corner | 1      | ☐      |
| No out-of-bounds errors            | 1      | ☐      |

#### Full Board (3 points)

**Test**: Play until board is completely full.

| Check                     | Points | Status |
| ------------------------- | ------ | ------ |
| Game ends when board full | 2      | ☐      |
| Correct winner announced  | 1      | ☐      |

#### Both Players Pass (4 points)

**Test**: Create scenario where both have no moves.

| Check                              | Points | Status |
| ---------------------------------- | ------ | ------ |
| First player passes automatically  | 1      | ☐      |
| Second player passes automatically | 1      | ☐      |
| Game ends after both pass          | 2      | ☐      |

**Points Earned**: \_\_\_\_ / 10

---

### 6.2 No Critical Bugs (10 points)

Play the game for 5 minutes, trying to break it.

| Area                                                 | Points | Issues Found          |
| ---------------------------------------------------- | ------ | --------------------- |
| No crashes                                           | 3      | ☐ None ☐ Some: **\_** |
| No infinite loops/freezes                            | 2      | ☐ None ☐ Some: **\_** |
| No console errors                                    | 2      | ☐ None ☐ Some: **\_** |
| No visual glitches                                   | 2      | ☐ None ☐ Some: **\_** |
| No data loss (refresh preserves state if applicable) | 1      | ☐ None ☐ Some: **\_** |

**Deduct 1 point per issue found (max deduction: 10)**

**Points Earned**: \_\_\_\_ / 10

---

## Bonus Features (up to +75 points)

### Level 1 Bonuses (+10 points)

| Feature                                      | Points | Status |
| -------------------------------------------- | ------ | ------ |
| Mobile responsive (portrait/landscape)       | 3      | ☐      |
| Keyboard shortcuts (arrow keys, undo hotkey) | 3      | ☐      |
| Dark mode toggle                             | 2      | ☐      |
| AI vs AI spectator mode                      | 2      | ☐      |

**Points Earned**: \_\_\_\_ / 10

---

### Level 2 Bonuses (+15 points)

| Feature                                 | Points | Status |
| --------------------------------------- | ------ | ------ |
| Game replay system (step through moves) | 5      | ☐      |
| Position analysis / move hints          | 4      | ☐      |
| Custom time controls (user input)       | 3      | ☐      |
| Game statistics tracking                | 3      | ☐      |

**Points Earned**: \_\_\_\_ / 15

---

### Level 3 Bonuses (+20 points)

| Feature                             | Points | Status |
| ----------------------------------- | ------ | ------ |
| Multiplayer (WebSocket online play) | 8      | ☐      |
| Tournament mode (bracket system)    | 5      | ☐      |
| Opening book database               | 4      | ☐      |
| Position editor                     | 3      | ☐      |

**Points Earned**: \_\_\_\_ / 20

---

### Expert Bonuses (+30 points)

| Feature                             | Points | Status |
| ----------------------------------- | ------ | ------ |
| Endgame solver (perfect play)       | 10     | ☐      |
| Machine learning AI                 | 10     | ☐      |
| 3D board rendering (Three.js/WebGL) | 5      | ☐      |
| Mobile app (React Native/PWA)       | 5      | ☐      |

**Points Earned**: \_\_\_\_ / 30

---

## Final Grading

### Mandatory Parts (Max 100 points)

| Section                | Possible | Earned       |
| ---------------------- | -------- | ------------ |
| Part 1: Core Engine    | 40       | \_\_\_\_     |
| Part 2: User Interface | 30       | \_\_\_\_     |
| Part 3: AI Opponent    | 20       | \_\_\_\_     |
| Part 4: Time Controls  | 10       | \_\_\_\_     |
| **Subtotal**           | **100**  | **\_\_\_\_** |

### Code Quality (Max 30 points)

| Section                 | Possible | Earned       |
| ----------------------- | -------- | ------------ |
| Type Safety             | 10       | \_\_\_\_     |
| Architecture            | 10       | \_\_\_\_     |
| Documentation & Testing | 10       | \_\_\_\_     |
| **Subtotal**            | **30**   | **\_\_\_\_** |

### Correctness (Max 20 points)

| Section          | Possible | Earned       |
| ---------------- | -------- | ------------ |
| Edge Cases       | 10       | \_\_\_\_     |
| No Critical Bugs | 10       | \_\_\_\_     |
| **Subtotal**     | **20**   | **\_\_\_\_** |

### Bonuses (Max 75 points)

| Level        | Possible | Earned       |
| ------------ | -------- | ------------ |
| Level 1      | 10       | \_\_\_\_     |
| Level 2      | 15       | \_\_\_\_     |
| Level 3      | 20       | \_\_\_\_     |
| Expert       | 30       | \_\_\_\_     |
| **Subtotal** | **75**   | **\_\_\_\_** |

---

## Final Score Calculation

```
Mandatory:    ____ / 100
Code Quality: ____ / 30
Correctness:  ____ / 20
Bonuses:      ____ / 75
─────────────────────
TOTAL:        ____ / 225
```

### Grade Interpretation

| Score   | Result                                             |
| ------- | -------------------------------------------------- |
| 0-99    | ❌ **FAIL** - Major requirements missing           |
| 100-110 | ✅ **PASS** - All mandatory features complete      |
| 110-125 | ⭐ **EXCELLENT** - Mandatory + good bonuses        |
| 125-150 | 🏆 **OUTSTANDING** - Advanced features implemented |
| 150+    | 💎 **EXCEPTIONAL** - Expert-level implementation   |

**Final Grade**: \***\*\_\_\_\_\*\***

**Pass/Fail**: ☐ PASS ☐ FAIL

---

## Evaluator Feedback

### What Worked Well

```
(Write 2-3 things the student did exceptionally well)




```

### Areas for Improvement

```
(Write 2-3 constructive suggestions)




```

### Most Impressive Feature

```
(What impressed you most about this project?)




```

### Questions/Concerns

```
(Any questions or concerns about the implementation?)




```

---

## Defense Discussion

### Questions to Ask Student

**Required Questions** (ask at least 3):

1. ☐ "Walk me through your move validation algorithm. How do you check all 8 directions?"
2. ☐ "Explain your AI's evaluation function. Why is a corner worth more than an edge?"
3. ☐ "How does your time control system handle pausing/resuming?"
4. ☐ "What was the most challenging bug you encountered? How did you fix it?"
5. ☐ "If you had more time, what would you improve first?"

### Student's Understanding

| Area             | ☐ Strong | ☐ Average | ☐ Weak | Notes |
| ---------------- | -------- | --------- | ------ | ----- |
| Game Rules       | ☐        | ☐         | ☐      |       |
| TypeScript/React | ☐        | ☐         | ☐      |       |
| Algorithms       | ☐        | ☐         | ☐      |       |
| Architecture     | ☐        | ☐         | ☐      |       |
| Testing          | ☐        | ☐         | ☐      |       |

---

## Sign-Off

**Evaluator Signature**: **\*\*\*\***\_\_\_\_**\*\*\*\***  
**Date**: **\*\*\*\***\_\_\_\_**\*\*\*\***  
**Time Spent**: **\_\_** minutes

**Evaluated Student Acknowledgment**: **\*\*\*\***\_\_\_\_**\*\*\*\***

---

**Thank you for your thorough evaluation! 🎓**

_Remember: The goal is to help each other learn and grow. Be honest but constructive._
