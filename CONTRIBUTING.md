# Contributing to CARBON·LEDGER

Thank you for your interest in contributing to CARBON·LEDGER!

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/Carbon-Footprint-Awareness-Software.git`
3. Install dependencies: `npm install`
4. Start the dev server: `npm run dev`

## Development Guidelines

### Code Quality
- All code must be written in TypeScript with explicit type annotations
- Add JSDoc comments to all exported functions
- Use `safeNumber()` for any arithmetic to prevent NaN propagation
- All state flows through `CarbonContext` — never use local component state for shared data

### Testing
- Write tests for all new functions in `lib/__tests__/`
- Run `npx vitest run` before submitting a PR
- Aim for deterministic, pure-function tests (no mocking needed)

### Accessibility
- All interactive elements must have `aria-label` attributes
- Use semantic HTML elements (`<section>`, `<nav>`, `<main>`)
- Test with keyboard navigation (Tab, Enter, Escape)
- Respect `prefers-reduced-motion`

### Security
- Never store sensitive data in localStorage
- All numeric inputs must be clamped to valid ranges via `onBlur`
- No external API keys or secrets in client-side code

## Reporting Issues

Please open a GitHub Issue with:
- Steps to reproduce
- Expected vs. actual behavior
- Browser and OS version
