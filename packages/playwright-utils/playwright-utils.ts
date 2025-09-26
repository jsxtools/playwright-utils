import { selectors, test } from "@playwright/test"

import type {
	Extension,
	Fixtures,
	Page,
	SelectorEngine,
	Test,
	TestArgs,
	TestType,
	WorkerArgs,
} from "./playwright-utils-types.js"

export { devices, expect, request, selectors } from "@playwright/test"
export type { BrowserContext, Extension, Fixtures, Locator, Page, TestType } from "./playwright-utils-types.js"

/** Returns a new test type with the given fixtures. */
export const createExtension = <T extends {} = object, W extends {} = object>(
	fixtures: Fixtures<TestArgs, WorkerArgs, TestArgs, WorkerArgs>,
): Extension<T, W> => {
	const extend = (base: Test): TestType<T, W> => base.extend(fixtures) as TestType<T, W>

	return {
		extend,
		test: extend(test),
	}
}

/** Registers a new locator with optional methods and patches all locator methods to return a locator with those new methods. */
export const registerLocator = (
	name: string,
	page: Page,
	selectorScript: () => SelectorEngine,
	additionalMethods?: MethodRecord,
): Promise<void> => {
	const initialLocatorPrototype = Object.getPrototypeOf(page.locator("*"))
	const patchedLocatorPrototype = Object.create(initialLocatorPrototype)
	const patchedPagePrototype = Object.create(Object.getPrototypeOf(page))

	patchPrototypeMethods(patchedLocatorPrototype, patchedLocatorPrototype, initialLocatorPrototype, additionalMethods)
	patchPrototypeMethods(patchedPagePrototype, patchedLocatorPrototype, initialLocatorPrototype, additionalMethods)

	Object.setPrototypeOf(page, patchedPagePrototype)

	return selectors.register(name, selectorScript)
}

// #region Internals

/** Patches prototype methods to return a patched Locator type when they return an initial Locator type. */
const patchPrototypeMethods = (
	/** Prototype to patch. */
	prototype: MethodRecord,
	/** Patched Locator prototype. */
	patchedLocatorPrototype: MethodRecord,
	/** Initial (unpatched) Locator prototype. */
	initialLocatorPrototype: MethodRecord,
	/** Additional methods to add and patch. */
	additionalMethods?: MethodRecord,
): void => {
	for (const [name, func] of entries(prototype)) {
		Reflect.set(
			prototype,
			name,
			{
				[name](arg: unknown, ...args: unknown[]): unknown {
					const returnValue = func.call(this, arg, ...args)

					if (returnValue) {
						if (Object.getPrototypeOf(returnValue) === initialLocatorPrototype) {
							Object.setPrototypeOf(returnValue, patchedLocatorPrototype)
						}
					}

					return returnValue
				},
			}[name],
		)
	}

	if (additionalMethods) {
		for (const [name, func] of entries(additionalMethods)) {
			Reflect.set(
				prototype,
				name,
				{
					[name](arg: unknown, ...args: unknown[]): unknown {
						const returnValue = func.call(this, arg, ...args)

						if (returnValue) {
							if (Object.getPrototypeOf(returnValue) === initialLocatorPrototype) {
								Object.setPrototypeOf(returnValue, patchedLocatorPrototype)
							}
						}

						return returnValue
					},
				}[name],
			)
		}
	}
}

const entries = (object: object): [string, Method][] => {
	const seen = new Set<string>()
	const entries = new Set<[string, Method]>()

	for (let proto = object; proto != null && proto !== Object.prototype; proto = Object.getPrototypeOf(proto)) {
		const descriptors = Object.getOwnPropertyDescriptors(proto)

		for (const key in descriptors) {
			if (key === "constructor") {
				continue
			}

			if (!seen.has(key)) {
				seen.add(key)

				if (typeof descriptors[key].value === "function") {
					entries.add([key, descriptors[key].value])
				}
			}
		}
	}
	return [...entries]
}

type Method = (...args: any[]) => any

type MethodRecord = Record<string, Method>
