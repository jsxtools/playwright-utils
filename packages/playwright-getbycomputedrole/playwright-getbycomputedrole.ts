import { createExtension, devices, expect, registerLocator, request, selectors } from "@jsxtools/playwright-utils"
import { scriptForInit } from "./playwright-getbycomputedrole-script-init.js"
import { scriptForSelector } from "./playwright-getbycomputedrole-selector-init.js"
import type { Locator, Options, Page, Role } from "./playwright-getbycomputedrole-types.js"

export const { extend, test } = createExtension<{ page: Page }>({
	context: async ({ context }, use) => {
		await context.addInitScript(scriptForInit)
		await use(context)
	},
	page: async ({ page }, use) => {
		await registerLocator("computed-aria", page, scriptForSelector, {
			getByComputedRole(this: Locator, role: Role, options?: Options): Locator {
				const payload = JSON.stringify({
					role,
					name: options?.name ? String(options.name) : undefined,
					description: options?.description ? String(options.description) : undefined,
					exact: options?.exact ? Boolean(options.exact) : undefined,
				})

				return this.locator(`computed-aria=${payload}`)
			},
		})
		await use(page)
	},
})

export { devices, expect, request, selectors }
export type { Locator, Page, Role }
