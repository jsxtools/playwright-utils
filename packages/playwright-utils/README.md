# @jsxtools/playwright-utils

A collection of utilities for extending Playwright with custom functionality and enhanced type safety.

## Features

- **Extension Creation**: Create custom Playwright test extensions with additional fixtures.
- **Locator Registration**: Register custom selector engines with enhanced locator methods.
- **Type Safety**: Enhanced TypeScript types for better development experience.

## Installation

```shell
npm install @jsxtools/playwright-utils
```

## Usage

### Creating Extensions

Use `createExtension` to create custom test extensions with additional fixtures:

```typescript
import { createExtension } from '@jsxtools/playwright-utils';

const { extend, test } = createExtension<{ customPage: Page }>({
  customPage: async ({ page }, use) => {
    // Add custom setup logic
    await page.goto('https://example.com');
    await use(page);
    // Add custom teardown logic
  },
});

// Use the extended test
test('my test', async ({ customPage }) => {
  await customPage.click('button');
});
```

### Registering Custom Locators

Use `registerLocator` to add custom selector engines with additional methods:

```typescript
import { registerLocator } from '@jsxtools/playwright-utils';

await registerLocator(
  'my-selector',
  page,
  () => ({
    query: (root, selector) => {
      // Custom selector logic
      return root.querySelector(selector);
    },
    queryAll: (root, selector) => {
      // Custom selector logic
      return Array.from(root.querySelectorAll(selector));
    },
  }),
  {
    // Additional methods to add to locators
    customMethod(this: Locator): Locator {
      return this.locator('custom-selector');
    },
  }
);
```

## API Reference

### `createExtension<T, W>(fixtures)`

Creates a new test extension with custom fixtures.

**Parameters:**
- `fixtures`: Playwright fixtures object defining additional test and worker fixtures

**Returns:**
- `extend`: Function to extend a base test with the fixtures
- `test`: Pre-extended test instance ready to use

### `registerLocator(name, page, selectorScript, additionalMethods?)`

Registers a custom selector engine and patches locator methods.

**Parameters:**
- `name`: Name of the selector engine
- `page`: Playwright page instance
- `selectorScript`: Function returning the selector engine implementation
- `additionalMethods`: Optional object with additional methods to add to locators

**Returns:**
- `Promise<void>`: Resolves when the selector is registered

### Re-exported APIs

The following Playwright APIs are re-exported for convenience:

- `devices`: Browser device configurations
- `expect`: Playwright expect assertions
- `request`: API request utilities
- `selectors`: Selector engine utilities

### Types

Enhanced TypeScript types are available:

- `Extension<T, W>`: Type for test extensions
- `TestType<T, W>`: Enhanced test type with custom fixtures
- `Page<Locator>`: Enhanced page type with custom locator support
- `Locator`: Enhanced locator type with additional methods
- `BrowserContext`: Re-exported browser context type
- `Fixtures`: Re-exported fixtures type

## License

MIT-0
