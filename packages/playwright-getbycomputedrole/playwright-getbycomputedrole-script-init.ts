import type { ScriptForInit } from "@jsxtools/playwright-utils/types"
import type { WeakMaps } from "./playwright-getbycomputedrole-types.js"

export const scriptForInit: ScriptForInit = () => {
	const symbol = Symbol.for("__getByComputedRole")
	const internalsMap = new WeakMap<Element, ElementInternals>()
	const shadowdomMap = new WeakMap<Element, ShadowRoot>()

	const { attachInternals, attachShadow } = HTMLElement.prototype

	Object.assign(HTMLElement.prototype, {
		attachInternals(this: HTMLElement): ElementInternals {
			const internals = attachInternals.call(this)
			internalsMap.set(this, internals)
			return internals
		},
		attachShadow(this: HTMLElement, options: ShadowRootInit): ShadowRoot {
			const shadowRoot = attachShadow.call(this, options)
			shadowdomMap.set(this, shadowRoot)
			return shadowRoot
		},
	})

	Reflect.set(document, symbol, [internalsMap, shadowdomMap] as WeakMaps)
}
