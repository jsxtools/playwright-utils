import type {
	Locator as BaseLocator,
	Page as BasePage,
	TestType as BaseTestType,
	BrowserContext,
	Fixtures,
	PlaywrightTestArgs,
	PlaywrightTestOptions,
	PlaywrightWorkerArgs,
	PlaywrightWorkerOptions,
} from "@playwright/test"

export type { BrowserContext, Fixtures }

export interface TestType<T extends {}, W extends {}> extends BaseTestType<T & TestArgs, W & WorkerArgs> {}

export interface Test extends BaseTestType<TestArgs, WorkerArgs> {}

export interface TestArgs extends PlaywrightTestArgs, PlaywrightTestOptions {}

export interface WorkerArgs extends PlaywrightWorkerArgs, PlaywrightWorkerOptions {}

export interface Locator extends BaseLocator {
	/**
	 * Allows locating elements by their alt text.
	 *
	 * **Usage**
	 *
	 * For example, this method will find the image by alt text "Playwright logo":
	 *
	 * ```html
	 * <img alt='Playwright logo'>
	 * ```
	 *
	 * ```js
	 * await page.getByAltText('Playwright logo').click();
	 * ```
	 *
	 * @param text Text to locate the element for.
	 * @param options
	 */
	getByAltText(text: LocatorText, options?: GetterOptions): this

	/**
	 * Allows locating input elements by the text of the associated `<label>` or `aria-labelledby` element, or by the
	 * `aria-label` attribute.
	 *
	 * **Usage**
	 *
	 * For example, this method will find inputs by label "Username" and "Password" in the following DOM:
	 *
	 * ```html
	 * <input aria-label="Username">
	 * <label for="password-input">Password:</label>
	 * <input id="password-input">
	 * ```
	 *
	 * ```js
	 * await page.getByLabel('Username').fill('john');
	 * await page.getByLabel('Password').fill('secret');
	 * ```
	 *
	 * @param text Text to locate the element for.
	 * @param options
	 */
	getByLabel(text: LocatorText, options?: GetterOptions): this

	/**
	 * Allows locating input elements by the placeholder text.
	 *
	 * **Usage**
	 *
	 * For example, consider the following DOM structure.
	 *
	 * ```html
	 * <input type="email" placeholder="name@example.com" />
	 * ```
	 *
	 * You can fill the input after locating it by the placeholder text:
	 *
	 * ```js
	 * await page
	 *     .getByPlaceholder('name@example.com')
	 *     .fill('playwright@microsoft.com');
	 * ```
	 *
	 * @param text Text to locate the element for.
	 * @param options
	 */
	getByPlaceholder(text: LocatorText, options?: GetterOptions): this

	/**
	 * Allows locating elements by their [ARIA role](https://www.w3.org/TR/wai-aria-1.2/#roles),
	 * [ARIA attributes](https://www.w3.org/TR/wai-aria-1.2/#aria-attributes) and
	 * [accessible name](https://w3c.github.io/accname/#dfn-accessible-name).
	 *
	 * **Usage**
	 *
	 * Consider the following DOM structure.
	 *
	 * ```html
	 * <h3>Sign up</h3>
	 * <label>
	 *   <input type="checkbox" /> Subscribe
	 * </label>
	 * <br/>
	 * <button>Submit</button>
	 * ```
	 *
	 * You can locate each element by it's implicit role:
	 *
	 * ```js
	 * await expect(page.getByRole('heading', { name: 'Sign up' })).toBeVisible();
	 *
	 * await page.getByRole('checkbox', { name: 'Subscribe' }).check();
	 *
	 * await page.getByRole('button', { name: /submit/i }).click();
	 * ```
	 *
	 * **Details**
	 *
	 * Role selector **does not replace** accessibility audits and conformance tests, but rather gives early feedback
	 * about the ARIA guidelines.
	 *
	 * Many html elements have an implicitly [defined role](https://w3c.github.io/html-aam/#html-element-role-mappings)
	 * that is recognized by the role selector. You can find all the
	 * [supported roles here](https://www.w3.org/TR/wai-aria-1.2/#role_definitions). ARIA guidelines **do not recommend**
	 * duplicating implicit roles and attributes by setting `role` and/or `aria-*` attributes to default values.
	 * @param role Required aria role.
	 * @param options
	 */
	getByRole(role: Role, options?: GetterWithRoleOptions): this

	/**
	 * Locate element by the test id.
	 *
	 * **Usage**
	 *
	 * Consider the following DOM structure.
	 *
	 * ```html
	 * <button data-testid="directions">Itinéraire</button>
	 * ```
	 *
	 * You can locate the element by it's test id:
	 *
	 * ```js
	 * await page.getByTestId('directions').click();
	 * ```
	 *
	 * **Details**
	 *
	 * By default, the `data-testid` attribute is used as a test id. Use
	 * [selectors.setTestIdAttribute(attributeName)](https://playwright.dev/docs/api/class-selectors#selectors-set-test-id-attribute)
	 * to configure a different test id attribute if necessary.
	 *
	 * ```js
	 * // Set custom test id attribute from @playwright/test config:
	 * import { defineConfig } from '@playwright/test';
	 *
	 * export default defineConfig({
	 *   use: {
	 *     testIdAttribute: 'data-pw'
	 *   },
	 * });
	 * ```
	 *
	 * @param testId Id to locate the element by.
	 */
	getByTestId(testId: LocatorText): this

	/**
	 * Allows locating elements that contain given text.
	 *
	 * See also [locator.filter([options])](https://playwright.dev/docs/api/class-locator#locator-filter) that allows to
	 * match by another criteria, like an accessible role, and then filter by the text content.
	 *
	 * **Usage**
	 *
	 * Consider the following DOM structure:
	 *
	 * ```html
	 * <div>Hello <span>world</span></div>
	 * <div>Hello</div>
	 * ```
	 *
	 * You can locate by text substring, exact string, or a regular expression:
	 *
	 * ```js
	 * // Matches <span>
	 * page.getByText('world');
	 *
	 * // Matches first <div>
	 * page.getByText('Hello world');
	 *
	 * // Matches second <div>
	 * page.getByText('Hello', { exact: true });
	 *
	 * // Matches both <div>s
	 * page.getByText(/Hello/);
	 *
	 * // Matches second <div>
	 * page.getByText(/^hello$/i);
	 * ```
	 *
	 * **Details**
	 *
	 * Matching by text always normalizes whitespace, even with exact match. For example, it turns multiple spaces into
	 * one, turns line breaks into spaces and ignores leading and trailing whitespace.
	 *
	 * Input elements of the type `button` and `submit` are matched by their `value` instead of the text content. For
	 * example, locating by text `"Log in"` matches `<input type=button value="Log in">`.
	 * @param text Text to locate the element for.
	 * @param options
	 */
	getByText(text: LocatorText, options?: GetterOptions): this

	/**
	 * Allows locating elements by their title attribute.
	 *
	 * **Usage**
	 *
	 * Consider the following DOM structure.
	 *
	 * ```html
	 * <span title='Issues count'>25 issues</span>
	 * ```
	 *
	 * You can check the issues count after locating it by the title text:
	 *
	 * ```js
	 * await expect(page.getByTitle('Issues count')).toHaveText('25 issues');
	 * ```
	 *
	 * @param text Text to locate the element for.
	 * @param options
	 */
	getByTitle(text: LocatorText, options?: GetterOptions): this

	/**
	 * The method finds an element matching the specified selector in the locator's subtree. It also accepts filter
	 * options, similar to [locator.filter([options])](https://playwright.dev/docs/api/class-locator#locator-filter)
	 * method.
	 *
	 * [Learn more about locators](https://playwright.dev/docs/locators).
	 * @param selectorOrLocator A selector or locator to use when resolving DOM element.
	 * @param options
	 */
	locator(selector: string, options?: LocatorOptions<this>): this
}

export interface Page<Locator extends BaseLocator = BaseLocator> extends BasePage {
	/**
	 * Allows locating elements by their alt text.
	 *
	 * **Usage**
	 *
	 * For example, this method will find the image by alt text "Playwright logo":
	 *
	 * ```html
	 * <img alt='Playwright logo'>
	 * ```
	 *
	 * ```js
	 * await page.getByAltText('Playwright logo').click();
	 * ```
	 *
	 * @param text Text to locate the element for.
	 * @param options
	 */
	getByAltText(text: LocatorText, options?: GetterOptions): Locator

	/**
	 * Allows locating input elements by the text of the associated `<label>` or `aria-labelledby` element, or by the
	 * `aria-label` attribute.
	 *
	 * **Usage**
	 *
	 * For example, this method will find inputs by label "Username" and "Password" in the following DOM:
	 *
	 * ```html
	 * <input aria-label="Username">
	 * <label for="password-input">Password:</label>
	 * <input id="password-input">
	 * ```
	 *
	 * ```js
	 * await page.getByLabel('Username').fill('john');
	 * await page.getByLabel('Password').fill('secret');
	 * ```
	 *
	 * @param text Text to locate the element for.
	 * @param options
	 */
	getByLabel(text: LocatorText, options?: GetterOptions): Locator

	/**
	 * Allows locating input elements by the placeholder text.
	 *
	 * **Usage**
	 *
	 * For example, consider the following DOM structure.
	 *
	 * ```html
	 * <input type="email" placeholder="name@example.com" />
	 * ```
	 *
	 * You can fill the input after locating it by the placeholder text:
	 *
	 * ```js
	 * await page
	 *     .getByPlaceholder('name@example.com')
	 *     .fill('playwright@microsoft.com');
	 * ```
	 *
	 * @param text Text to locate the element for.
	 * @param options
	 */
	getByPlaceholder(text: LocatorText, options?: GetterOptions): Locator

	/**
	 * Allows locating elements by their [ARIA role](https://www.w3.org/TR/wai-aria-1.2/#roles),
	 * [ARIA attributes](https://www.w3.org/TR/wai-aria-1.2/#aria-attributes) and
	 * [accessible name](https://w3c.github.io/accname/#dfn-accessible-name).
	 *
	 * **Usage**
	 *
	 * Consider the following DOM structure.
	 *
	 * ```html
	 * <h3>Sign up</h3>
	 * <label>
	 *   <input type="checkbox" /> Subscribe
	 * </label>
	 * <br/>
	 * <button>Submit</button>
	 * ```
	 *
	 * You can locate each element by it's implicit role:
	 *
	 * ```js
	 * await expect(page.getByRole('heading', { name: 'Sign up' })).toBeVisible();
	 *
	 * await page.getByRole('checkbox', { name: 'Subscribe' }).check();
	 *
	 * await page.getByRole('button', { name: /submit/i }).click();
	 * ```
	 *
	 * **Details**
	 *
	 * Role selector **does not replace** accessibility audits and conformance tests, but rather gives early feedback
	 * about the ARIA guidelines.
	 *
	 * Many html elements have an implicitly [defined role](https://w3c.github.io/html-aam/#html-element-role-mappings)
	 * that is recognized by the role selector. You can find all the
	 * [supported roles here](https://www.w3.org/TR/wai-aria-1.2/#role_definitions). ARIA guidelines **do not recommend**
	 * duplicating implicit roles and attributes by setting `role` and/or `aria-*` attributes to default values.
	 * @param role Required aria role.
	 * @param options
	 */
	getByRole(role: Role, options?: GetterWithRoleOptions): Locator

	/**
	 * Locate element by the test id.
	 *
	 * **Usage**
	 *
	 * Consider the following DOM structure.
	 *
	 * ```html
	 * <button data-testid="directions">Itinéraire</button>
	 * ```
	 *
	 * You can locate the element by it's test id:
	 *
	 * ```js
	 * await page.getByTestId('directions').click();
	 * ```
	 *
	 * **Details**
	 *
	 * By default, the `data-testid` attribute is used as a test id. Use
	 * [selectors.setTestIdAttribute(attributeName)](https://playwright.dev/docs/api/class-selectors#selectors-set-test-id-attribute)
	 * to configure a different test id attribute if necessary.
	 *
	 * ```js
	 * // Set custom test id attribute from @playwright/test config:
	 * import { defineConfig } from '@playwright/test';
	 *
	 * export default defineConfig({
	 *   use: {
	 *     testIdAttribute: 'data-pw'
	 *   },
	 * });
	 * ```
	 *
	 * @param testId Id to locate the element by.
	 */
	getByTestId(testId: LocatorText): Locator

	/**
	 * Allows locating elements that contain given text.
	 *
	 * See also [locator.filter([options])](https://playwright.dev/docs/api/class-locator#locator-filter) that allows to
	 * match by another criteria, like an accessible role, and then filter by the text content.
	 *
	 * **Usage**
	 *
	 * Consider the following DOM structure:
	 *
	 * ```html
	 * <div>Hello <span>world</span></div>
	 * <div>Hello</div>
	 * ```
	 *
	 * You can locate by text substring, exact string, or a regular expression:
	 *
	 * ```js
	 * // Matches <span>
	 * page.getByText('world');
	 *
	 * // Matches first <div>
	 * page.getByText('Hello world');
	 *
	 * // Matches second <div>
	 * page.getByText('Hello', { exact: true });
	 *
	 * // Matches both <div>s
	 * page.getByText(/Hello/);
	 *
	 * // Matches second <div>
	 * page.getByText(/^hello$/i);
	 * ```
	 *
	 * **Details**
	 *
	 * Matching by text always normalizes whitespace, even with exact match. For example, it turns multiple spaces into
	 * one, turns line breaks into spaces and ignores leading and trailing whitespace.
	 *
	 * Input elements of the type `button` and `submit` are matched by their `value` instead of the text content. For
	 * example, locating by text `"Log in"` matches `<input type=button value="Log in">`.
	 * @param text Text to locate the element for.
	 * @param options
	 */
	getByText(text: LocatorText, options?: GetterOptions): Locator

	/**
	 * Allows locating elements by their title attribute.
	 *
	 * **Usage**
	 *
	 * Consider the following DOM structure.
	 *
	 * ```html
	 * <span title='Issues count'>25 issues</span>
	 * ```
	 *
	 * You can check the issues count after locating it by the title text:
	 *
	 * ```js
	 * await expect(page.getByTitle('Issues count')).toHaveText('25 issues');
	 * ```
	 *
	 * @param text Text to locate the element for.
	 * @param options
	 */
	getByTitle(text: LocatorText, options?: GetterOptions): Locator

	/**
	 * The method returns an element locator that can be used to perform actions on this page / frame. Locator is resolved
	 * to the element immediately before performing an action, so a series of actions on the same locator can in fact be
	 * performed on different DOM elements. That would happen if the DOM structure between those actions has changed.
	 *
	 * [Learn more about locators](https://playwright.dev/docs/locators).
	 * @param selector A selector to use when resolving DOM element.
	 * @param options
	 */
	locator(selector: string, options?: LocatorOptions<Locator>): Locator

	/**
	 * When testing a web page, sometimes unexpected overlays like a "Sign up" dialog appear and block actions you want to
	 * automate, e.g. clicking a button. These overlays don't always show up in the same way or at the same time, making
	 * them tricky to handle in automated tests.
	 *
	 * This method lets you set up a special function, called a handler, that activates when it detects that overlay is
	 * visible. The handler's job is to remove the overlay, allowing your test to continue as if the overlay wasn't there.
	 *
	 * Things to keep in mind:
	 * - When an overlay is shown predictably, we recommend explicitly waiting for it in your test and dismissing it as
	 *   a part of your normal test flow, instead of using
	 *   [page.addLocatorHandler(locator, handler[, options])](https://playwright.dev/docs/api/class-page#page-add-locator-handler).
	 * - Playwright checks for the overlay every time before executing or retrying an action that requires an
	 *   [actionability check](https://playwright.dev/docs/actionability), or before performing an auto-waiting assertion check. When overlay
	 *   is visible, Playwright calls the handler first, and then proceeds with the action/assertion. Note that the
	 *   handler is only called when you perform an action/assertion - if the overlay becomes visible but you don't
	 *   perform any actions, the handler will not be triggered.
	 * - After executing the handler, Playwright will ensure that overlay that triggered the handler is not visible
	 *   anymore. You can opt-out of this behavior with
	 *   [`noWaitAfter`](https://playwright.dev/docs/api/class-page#page-add-locator-handler-option-no-wait-after).
	 * - The execution time of the handler counts towards the timeout of the action/assertion that executed the handler.
	 *   If your handler takes too long, it might cause timeouts.
	 * - You can register multiple handlers. However, only a single handler will be running at a time. Make sure the
	 *   actions within a handler don't depend on another handler.
	 *
	 * **NOTE** Running the handler will alter your page state mid-test. For example it will change the currently focused
	 * element and move the mouse. Make sure that actions that run after the handler are self-contained and do not rely on
	 * the focus and mouse state being unchanged.
	 *
	 * For example, consider a test that calls
	 * [locator.focus([options])](https://playwright.dev/docs/api/class-locator#locator-focus) followed by
	 * [keyboard.press(key[, options])](https://playwright.dev/docs/api/class-keyboard#keyboard-press). If your handler
	 * clicks a button between these two actions, the focused element most likely will be wrong, and key press will happen
	 * on the unexpected element. Use
	 * [locator.press(key[, options])](https://playwright.dev/docs/api/class-locator#locator-press) instead to avoid this
	 * problem.
	 *
	 * Another example is a series of mouse actions, where
	 * [mouse.move(x, y[, options])](https://playwright.dev/docs/api/class-mouse#mouse-move) is followed by
	 * [mouse.down([options])](https://playwright.dev/docs/api/class-mouse#mouse-down). Again, when the handler runs
	 * between these two actions, the mouse position will be wrong during the mouse down. Prefer self-contained actions
	 * like [locator.click([options])](https://playwright.dev/docs/api/class-locator#locator-click) that do not rely on
	 * the state being unchanged by a handler.
	 *
	 * **Usage**
	 *
	 * An example that closes a "Sign up to the newsletter" dialog when it appears:
	 *
	 * ```js
	 * // Setup the handler.
	 * await page.addLocatorHandler(page.getByText('Sign up to the newsletter'), async () => {
	 *   await page.getByRole('button', { name: 'No thanks' }).click();
	 * });
	 *
	 * // Write the test as usual.
	 * await page.goto('https://example.com');
	 * await page.getByRole('button', { name: 'Start here' }).click();
	 * ```
	 *
	 * An example that skips the "Confirm your security details" page when it is shown:
	 *
	 * ```js
	 * // Setup the handler.
	 * await page.addLocatorHandler(page.getByText('Confirm your security details'), async () => {
	 *   await page.getByRole('button', { name: 'Remind me later' }).click();
	 * });
	 *
	 * // Write the test as usual.
	 * await page.goto('https://example.com');
	 * await page.getByRole('button', { name: 'Start here' }).click();
	 * ```
	 *
	 * An example with a custom callback on every actionability check. It uses a `<body>` locator that is always visible,
	 * so the handler is called before every actionability check. It is important to specify
	 * [`noWaitAfter`](https://playwright.dev/docs/api/class-page#page-add-locator-handler-option-no-wait-after), because
	 * the handler does not hide the `<body>` element.
	 *
	 * ```js
	 * // Setup the handler.
	 * await page.addLocatorHandler(page.locator('body'), async () => {
	 *   await page.evaluate(() => window.removeObstructionsForTestIfNeeded());
	 * }, { noWaitAfter: true });
	 *
	 * // Write the test as usual.
	 * await page.goto('https://example.com');
	 * await page.getByRole('button', { name: 'Start here' }).click();
	 * ```
	 *
	 * Handler takes the original locator as an argument. You can also automatically remove the handler after a number of
	 * invocations by setting [`times`](https://playwright.dev/docs/api/class-page#page-add-locator-handler-option-times):
	 *
	 * ```js
	 * await page.addLocatorHandler(page.getByLabel('Close'), async locator => {
	 *   await locator.click();
	 * }, { times: 1 });
	 * ```
	 *
	 * @param locator Locator that triggers the handler.
	 * @param handler Function that should be run once
	 * [`locator`](https://playwright.dev/docs/api/class-page#page-add-locator-handler-option-locator) appears. This
	 * function should get rid of the element that blocks actions like click.
	 * @param options
	 */
	addLocatorHandler(
		locator: Locator,
		handler: LocatorHandler<Locator>,
		options?: LocatorHandlerOptions,
	): Promise<void>

	/**
	 * Removes all locator handlers added by
	 * [page.addLocatorHandler(locator, handler[, options])](https://playwright.dev/docs/api/class-page#page-add-locator-handler)
	 * for a specific locator.
	 * @param locator Locator passed to
	 * [page.addLocatorHandler(locator, handler[, options])](https://playwright.dev/docs/api/class-page#page-add-locator-handler).
	 */
	removeLocatorHandler(locator: Locator): Promise<void>
}

export type LocatorHandler<Locator extends BaseLocator = BaseLocator> = (locator: Locator) => Promise<any>

export type LocatorText = string | RegExp

export type Role =
	| "alert"
	| "alertdialog"
	| "application"
	| "article"
	| "banner"
	| "blockquote"
	| "button"
	| "caption"
	| "cell"
	| "checkbox"
	| "code"
	| "columnheader"
	| "combobox"
	| "complementary"
	| "contentinfo"
	| "definition"
	| "deletion"
	| "dialog"
	| "directory"
	| "document"
	| "emphasis"
	| "feed"
	| "figure"
	| "form"
	| "generic"
	| "grid"
	| "gridcell"
	| "group"
	| "heading"
	| "img"
	| "insertion"
	| "link"
	| "list"
	| "listbox"
	| "listitem"
	| "log"
	| "main"
	| "marquee"
	| "math"
	| "meter"
	| "menu"
	| "menubar"
	| "menuitem"
	| "menuitemcheckbox"
	| "menuitemradio"
	| "navigation"
	| "none"
	| "note"
	| "option"
	| "paragraph"
	| "presentation"
	| "progressbar"
	| "radio"
	| "radiogroup"
	| "region"
	| "row"
	| "rowgroup"
	| "rowheader"
	| "scrollbar"
	| "search"
	| "searchbox"
	| "separator"
	| "slider"
	| "spinbutton"
	| "status"
	| "strong"
	| "subscript"
	| "superscript"
	| "switch"
	| "tab"
	| "table"
	| "tablist"
	| "tabpanel"
	| "term"
	| "textbox"
	| "time"
	| "timer"
	| "toolbar"
	| "tooltip"
	| "tree"
	| "treegrid"
	| "treeitem"

export type LocatorHandlerOptions = {
	/**
	 * By default, after calling the handler Playwright will wait until the overlay becomes hidden, and only then
	 * Playwright will continue with the action/assertion that triggered the handler. This option allows to opt-out of
	 * this behavior, so that overlay can stay visible after the handler has run.
	 */
	noWaitAfter?: boolean

	/**
	 * Specifies the maximum number of times this handler should be called. Unlimited by default.
	 */
	times?: number
}

export interface GetterOptions {
	/**
	 * Whether to find an exact match: case-sensitive and whole-string. Default to false. Ignored when locating by a
	 * regular expression. Note that exact match still trims whitespace.
	 */
	exact?: boolean
}

export interface GetterWithRoleOptions {
	/**
	 * An attribute that is usually set by `aria-checked` or native `<input type=checkbox>` controls.
	 *
	 * Learn more about [`aria-checked`](https://www.w3.org/TR/wai-aria-1.2/#aria-checked).
	 */
	checked?: boolean

	/**
	 * An attribute that is usually set by `aria-disabled` or `disabled`.
	 *
	 * **NOTE** Unlike most other attributes, `disabled` is inherited through the DOM hierarchy. Learn more about
	 * [`aria-disabled`](https://www.w3.org/TR/wai-aria-1.2/#aria-disabled).
	 *
	 */
	disabled?: boolean

	/**
	 * Whether [`name`](https://playwright.dev/docs/api/class-page#page-get-by-role-option-name) is matched exactly:
	 * case-sensitive and whole-string. Defaults to false. Ignored when
	 * [`name`](https://playwright.dev/docs/api/class-page#page-get-by-role-option-name) is a regular expression. Note
	 * that exact match still trims whitespace.
	 */
	exact?: boolean

	/**
	 * An attribute that is usually set by `aria-expanded`.
	 *
	 * Learn more about [`aria-expanded`](https://www.w3.org/TR/wai-aria-1.2/#aria-expanded).
	 */
	expanded?: boolean

	/**
	 * Option that controls whether hidden elements are matched. By default, only non-hidden elements, as
	 * [defined by ARIA](https://www.w3.org/TR/wai-aria-1.2/#tree_exclusion), are matched by role selector.
	 *
	 * Learn more about [`aria-hidden`](https://www.w3.org/TR/wai-aria-1.2/#aria-hidden).
	 */
	includeHidden?: boolean

	/**
	 * A number attribute that is usually present for roles `heading`, `listitem`, `row`, `treeitem`, with default values
	 * for `<h1>-<h6>` elements.
	 *
	 * Learn more about [`aria-level`](https://www.w3.org/TR/wai-aria-1.2/#aria-level).
	 */
	level?: number

	/**
	 * Option to match the [accessible name](https://w3c.github.io/accname/#dfn-accessible-name). By default, matching is
	 * case-insensitive and searches for a substring, use
	 * [`exact`](https://playwright.dev/docs/api/class-page#page-get-by-role-option-exact) to control this behavior.
	 *
	 * Learn more about [accessible name](https://w3c.github.io/accname/#dfn-accessible-name).
	 */
	name?: LocatorText

	/**
	 * An attribute that is usually set by `aria-pressed`.
	 *
	 * Learn more about [`aria-pressed`](https://www.w3.org/TR/wai-aria-1.2/#aria-pressed).
	 */
	pressed?: boolean

	/**
	 * An attribute that is usually set by `aria-selected`.
	 *
	 * Learn more about [`aria-selected`](https://www.w3.org/TR/wai-aria-1.2/#aria-selected).
	 */
	selected?: boolean
}

export type LocatorOptions<T extends BaseLocator = BaseLocator> = {
	/**
	 * Narrows down the results of the method to those which contain elements matching this relative locator. For example,
	 * `article` that has `text=Playwright` matches `<article><div>Playwright</div></article>`.
	 *
	 * Inner locator **must be relative** to the outer locator and is queried starting with the outer locator match, not
	 * the document root. For example, you can find `content` that has `div` in
	 * `<article><content><div>Playwright</div></content></article>`. However, looking for `content` that has `article
	 * div` will fail, because the inner locator must be relative and should not use any elements outside the `content`.
	 *
	 * Note that outer and inner locators must belong to the same frame. Inner locator must not contain
	 * [FrameLocator](https://playwright.dev/docs/api/class-framelocator)s.
	 */
	has?: T

	/**
	 * Matches elements that do not contain an element that matches an inner locator. Inner locator is queried against the
	 * outer one. For example, `article` that does not have `div` matches `<article><span>Playwright</span></article>`.
	 *
	 * Note that outer and inner locators must belong to the same frame. Inner locator must not contain
	 * [FrameLocator](https://playwright.dev/docs/api/class-framelocator)s.
	 */
	hasNot?: T

	/**
	 * Matches elements that do not contain specified text somewhere inside, possibly in a child or a descendant element.
	 * When passed a [string], matching is case-insensitive and searches for a substring.
	 */
	hasNotText?: LocatorText

	/**
	 * Matches elements containing specified text somewhere inside, possibly in a child or a descendant element. When
	 * passed a [string], matching is case-insensitive and searches for a substring. For example, `"Playwright"` matches
	 * `<article><div>Playwright</div></article>`.
	 */
	hasText?: LocatorText
}

export type Extension<T extends {}, W extends {}> = {
	extend: (base: Test) => TestType<T, W>

	test: TestType<T, W>
}

export type SelectorRoot = Element | ShadowRoot | Document

export interface SelectorEngine {
	query(root: SelectorRoot, selector: string): Element | null
	queryAll(root: SelectorRoot, selector: string): Element[]
}

/** Script function to be run at init to be evaluated in the browser context. */
export type ScriptForInit = () => void

/** Script function returning a selector engine to be evaluated in the browser context. */
export type ScriptForSelectorEngine = () => SelectorEngine
