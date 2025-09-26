import type { Locator as BaseLocator, Page as BasePage, Role } from "@jsxtools/playwright-utils/types"

export type WeakMaps = [WeakMap<Element, ElementInternals>, WeakMap<Element, ShadowRoot>]

export interface Locator extends BaseLocator {
	getByComputedRole: (role: Role, options?: Options) => this
}

export interface Page extends BasePage<Locator> {
	getByComputedRole: (role: Role, options?: Options) => Locator
}

export interface Options {
	name?: string
	description?: string
	exact?: boolean
}

export interface ParsedOptions extends Required<Options> {
	role: Role
}

export type { Role }
