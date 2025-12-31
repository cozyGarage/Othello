# Testing Strategy

This monorepo uses a **hybrid testing approach** with different test runners for different packages based on their specific needs and compatibility requirements.

## Overview

- **Engine Package** (`packages/othello-engine`): Uses **Bun Test**
- **React Package** (`packages/othello-react`): Uses **Vitest**

## Why Hybrid Testing?

### Bun Test for Engine

- **Pure TypeScript/Logic**: No DOM dependencies, perfect for Bun's fast runtime
- **Performance**: Significantly faster than other test runners for pure logic tests
- **Simplicity**: Zero configuration, works out of the box
- **Coverage**: 83 tests covering game logic, AI algorithms, and core functionality

### Vitest for React App

- **DOM Testing**: Full jsdom compatibility for React component testing
- **Vite Integration**: Seamless integration with the Vite build system
- **Rich Ecosystem**: Extensive plugins, better debugging, and community support
- **React Compatibility**: Better handling of React-specific testing scenarios
- **Coverage**: 173 tests covering UI components, integration tests, and user interactions

## Test Results

**Combined Test Suite**: 256 tests passing (99.6% success rate)

- Engine: 83 tests ✅
- React: 173 tests ✅

## Running Tests

### All Tests (CI Mode)

```bash
bun run test
```

### Individual Packages

#### Engine Tests

```bash
# From root
bun run test:engine

# From engine package
cd packages/othello-engine
bun run test
```

#### React Tests

```bash
# From root (CI mode)
bun run test:react:ci

# From React package (watch mode)
cd packages/othello-react
bun run test:watch

# From React package (UI mode)
bun run test:ui
```

## Configuration

### Engine Package (`packages/othello-engine/package.json`)

```json
{
  "scripts": {
    "test": "bun test",
    "test:watch": "bun test --watch"
  }
}
```

### React Package (`packages/othello-react/package.json`)

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui"
  },
  "devDependencies": {
    "vitest": "^2.1.8",
    "@vitest/ui": "^2.1.8"
  }
}
```

### Vitest Configuration (`packages/othello-react/vitest.config.ts`)

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

## Migration History

### Why This Approach?

**Previous Setup**: All tests used Bun test

- ✅ Engine tests worked perfectly
- ❌ React integration tests failed due to jsdom incompatibility
- ❌ 1 test failure out of 249 tests

**Current Setup**: Hybrid approach

- ✅ Engine tests: Bun test (fast, reliable)
- ✅ React tests: Vitest (DOM-compatible, feature-rich)
- ✅ All 256 tests passing

### Compatibility Issues Resolved

1. **jsdom with Bun**: Bun's test runner has known compatibility issues with jsdom
2. **DOM Testing**: React components require proper DOM environment
3. **Integration Tests**: Full app rendering tests need reliable DOM simulation

## Benefits of This Approach

1. **Best Tool for Each Job**: Engine gets speed, React gets compatibility
2. **Future-Proof**: Can evolve each package's testing independently
3. **Developer Experience**: Fast feedback for engine changes, rich debugging for React
4. **CI Reliability**: All tests pass consistently
5. **Learning Opportunity**: Demonstrates real-world monorepo testing strategies

## Future Considerations

- Monitor Bun's jsdom compatibility improvements
- Consider unified testing if Bun resolves DOM testing issues
- Evaluate performance trade-offs as project grows
- Keep testing frameworks updated for security and features

## Troubleshooting

### Engine Tests

- Ensure you're in the correct directory
- Check for TypeScript compilation errors
- Verify import paths are correct

### React Tests

- Ensure Vitest dependencies are installed
- Check jsdom environment configuration
- Verify React component imports
- Check for Web Audio API warnings (expected in test environment)

### CI Pipeline

- Root `test` script runs both suites sequentially
- Failures in either suite will fail the entire pipeline
- Check individual test outputs for debugging
