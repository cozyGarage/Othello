# Contributing to Othello Game

Thank you for your interest in contributing to the Othello Game project! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Guidelines](#commit-guidelines)
- [Code Style](#code-style)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Code Review Guidelines](#code-review-guidelines)

## Code of Conduct

This project follows a code of conduct to ensure a welcoming environment for all contributors. By participating, you agree to:

- Be respectful and inclusive
- Focus on constructive feedback
- Accept responsibility for mistakes
- Show empathy towards other contributors

## Getting Started

### Prerequisites

- **Bun** (latest version recommended)
- **Node.js** 18+ (for compatibility)
- **Git**

### Setup

```bash
# Clone the repository
git clone https://github.com/cozyGarage/Othello.git
cd Othello

# Install dependencies
bun install

# Set up git hooks
bun run prepare

# Start development
bun run dev
```

## Development Workflow

### 1. Choose an Issue

- Check the [Issues](https://github.com/cozyGarage/Othello/issues) page
- Look for issues labeled `good first issue` or `help wanted`
- Comment on the issue to indicate you're working on it

### 2. Create a Branch

```bash
# Create and switch to a feature branch
git checkout -b feature/your-feature-name
# or for bug fixes
git checkout -b fix/issue-number-description
```

### 3. Make Changes

- Write clean, well-documented code
- Follow the established patterns in the codebase
- Add tests for new functionality
- Ensure all tests pass

### 4. Commit Changes

Follow conventional commit format:

```bash
git commit -m "feat: add new game feature"
git commit -m "fix: resolve board rendering bug"
git commit -m "docs: update API documentation"
```

### 5. Push and Create PR

```bash
git push origin your-branch-name
```

Then create a Pull Request using the provided template.

## Commit Guidelines

This project uses [Conventional Commits](https://conventionalcommits.org/) to ensure consistent commit messages.

### Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat: add move timer feature
fix: resolve memory leak in game engine
docs: update installation instructions
refactor: simplify board rendering logic
test: add unit tests for game validation
```

## Code Style

### TypeScript/JavaScript

- Use TypeScript for all new code
- Avoid `any` types - use proper type definitions
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### React Components

- Use functional components with hooks
- Follow the established component structure
- Use TypeScript interfaces for props
- Keep components focused on single responsibilities

### CSS/Styling

- Follow BEM methodology where applicable
- Use CSS custom properties (variables) for theming
- Keep styles modular and component-scoped

### Linting and Formatting

The project uses ESLint and Prettier for code quality:

```bash
# Check code style
bun run lint

# Auto-fix linting issues
bun run lint:fix

# Format code
bun run format

# Check formatting
bun run format:check

# Run all validation
bun run validate
```

## Testing

### Test Structure

- Unit tests for individual functions/components
- Integration tests for component interactions
- E2E tests for critical user flows

### Running Tests

```bash
# Run all tests
bun run test

# Run tests in watch mode
bun run test:watch

# Run specific test file
bun run test path/to/test.ts
```

### Writing Tests

- Use descriptive test names
- Test both positive and negative scenarios
- Mock external dependencies
- Keep tests focused and fast

## Pull Request Process

### Before Submitting

1. ✅ All tests pass (`bun run validate`)
2. ✅ Code follows style guidelines
3. ✅ Commit messages follow conventional format
4. ✅ Documentation updated if needed
5. ✅ Self-review completed

### PR Template

Use the provided PR template which includes:

- Description of changes
- Type of change (bug fix, feature, etc.)
- Testing information
- Checklist verification

### PR Size

- Keep PRs focused on single features or fixes
- Large changes should be broken into smaller PRs
- Use draft PRs for work-in-progress

## Code Review Guidelines

### For Reviewers

- **Be constructive**: Focus on code quality and learning
- **Explain reasoning**: Provide context for suggestions
- **Balance perfection**: Accept reasonable solutions
- **Timely response**: Review within 2-3 business days

### For Contributors

- **Address feedback**: Respond to all review comments
- **Explain decisions**: Clarify why certain approaches were chosen
- **Iterate quickly**: Make requested changes promptly
- **Ask questions**: Seek clarification when needed

### Review Checklist

- [ ] Code is readable and well-documented
- [ ] Tests are comprehensive and passing
- [ ] No breaking changes without discussion
- [ ] Performance implications considered
- [ ] Security concerns addressed
- [ ] Accessibility requirements met

## Additional Resources

- [Project Documentation](./PROJECT_STATUS.md)
- [Roadmap](./ROADMAP.md)
- [API Documentation](./packages/othello-engine/README.md)
- [React Component Documentation](./packages/othello-react/README.md)

## Questions?

If you have questions about contributing:

1. Check existing documentation
2. Search existing issues and discussions
3. Create a new discussion or issue
4. Reach out to maintainers

Thank you for contributing to Othello Game! 🎮
