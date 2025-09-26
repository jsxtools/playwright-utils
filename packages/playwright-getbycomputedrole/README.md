# @jsxtools/playwright-getbycomputedrole

A Playwright extension that adds a `getByComputedRole` method for locating elements by their computed ARIA roles, including roles from Shadow DOM and ElementInternals.

## Features

- **Computed Role Detection**: Finds elements by their actual computed ARIA role, not just explicit `role` attributes.
- **Shadow DOM Support**: Works with elements inside Shadow DOM boundaries.
- **ElementInternals Support**: Handles roles set via ElementInternals API.
- **Accessible Name Matching**: Filter by accessible name, description, and other ARIA properties.
- **W3C Compliant**: Follows W3C Accessible Name and Description Computation specification.
- **Type Safe**: Full TypeScript support with enhanced locator types.

## Installation

```shell
npm install @jsxtools/playwright-getbycomputedrole
```

## Usage

### Basic Setup

Import and use the extended test from this package instead of the default Playwright test:

```typescript
import { test, expect } from '@jsxtools/playwright-getbycomputedrole';

test('find button by computed role', async ({ page }) => {
  await page.goto('https://example.com');

  // Find element by computed ARIA role
  await page.getByComputedRole('button').click();

  // Find with accessible name
  await page.getByComputedRole('button', { name: 'Submit' }).click();

  // Find with description
  await page.getByComputedRole('textbox', {
    name: 'Email',
    description: 'Enter your email address'
  }).fill('user@example.com');
});
```

### Advanced Usage

```typescript
import { test, expect } from '@jsxtools/playwright-getbycomputedrole';

test('complex role matching', async ({ page }) => {
  await page.goto('https://example.com');

  // Find elements with exact name matching
  const submitButton = page.getByComputedRole('button', {
    name: 'Submit Form',
    exact: true
  });

  // Chain with other locators
  const formSection = page.locator('form')
    .getByComputedRole('textbox', { name: 'Username' });

  // Use with expect assertions
  await expect(page.getByComputedRole('alert')).toBeVisible();

  // Find elements in Shadow DOM
  const shadowButton = page.getByComputedRole('button', {
    name: 'Shadow Button'
  });
});
```

### Working with Custom Elements

This package is particularly useful for testing custom elements that use ElementInternals or Shadow DOM:

```typescript
test('custom element with ElementInternals', async ({ page }) => {
  await page.goto('/custom-elements');

  // Custom element that sets role via ElementInternals
  await page.getByComputedRole('slider', { name: 'Volume' }).click();

  // Custom element in Shadow DOM
  await page.getByComputedRole('tab', { name: 'Settings' }).click();
});
```

## API Reference

### `page.getByComputedRole(role, options?)`

Locates elements by their computed ARIA role.

**Parameters:**
- `role`: The ARIA role to search for (e.g., 'button', 'textbox', 'heading')
- `options`: Optional configuration object

**Options:**
- `name?: string`: Match by accessible name
- `description?: string`: Match by accessible description
- `exact?: boolean`: Whether to match name/description exactly (default: false)

**Returns:**
- `Locator`: A Playwright locator for the matching element(s)

### `locator.getByComputedRole(role, options?)`

Same as the page method, but scoped to the current locator.

## How It Works

This package extends Playwright by:

1. **Registering a custom selector engine** that computes ARIA roles according to W3C specifications.
2. **Tracking Shadow DOM and ElementInternals** through monkey-patching during page initialization.
3. **Computing accessible names and descriptions** following the Accessible Name and Description Computation spec.
4. **Providing enhanced locator methods** that work seamlessly with Playwright's existing API.

## Differences from `getByRole`

While Playwright's built-in `getByRole` method works well for explicit roles, `getByComputedRole` provides additional capabilities:

| Feature | `getByRole` | `getByComputedRole` |
|---------|-------------|---------------------|
| Explicit role attributes | ✅ | ✅ |
| Implicit HTML roles | ✅ | ✅ |
| ElementInternals roles | ❌ | ✅ |
| Shadow DOM computation | ❌ | ✅ |

## License

MIT-0
