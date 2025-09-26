import type { ScriptForSelectorEngine, SelectorRoot } from "@jsxtools/playwright-utils/types"
import type { ParsedOptions, WeakMaps } from "./playwright-getbycomputedrole-types.js"

export const scriptForSelector: ScriptForSelectorEngine = () => {
	const parse = (selector: string): ParsedOptions => JSON.parse(selector)
	const symbol = Symbol.for("__getByComputedRole")

	const [internalsMap, shadowdomMap]: WeakMaps = Reflect.get(document, symbol) ?? [new WeakMap(), new WeakMap()]

	const rolesAllowingNameFromContent = new Set([
		"button",
		"link",
		"menuitem",
		"menuitemcheckbox",
		"menuitemradio",
		"option",
		"tab",
		"switch",
		"checkbox",
		"radio",
		"treeitem",
		"heading",
		"term",
		"definition",
		"toolbar",
		"group",
		"region",
	])

	// Cache for computed styles to avoid repeated getComputedStyle calls
	const computedStyleCache = new WeakMap<Element, CSSStyleDeclaration>()

	// Helper functions for role computation and accessible name calculation
	// Based on W3C Accessible Name and Description Computation specification

	/**
	 * Optimized function to check if an element is hidden according to ARIA specification
	 * Uses cached computed styles to avoid repeated getComputedStyle calls
	 */
	function isElementHidden(target: Node): boolean {
		for (let node: Node | null = target; node; node = node.parentElement) {
			if (node instanceof Element) {
				// Check explicit hidden attribute
				if (node.hasAttribute("hidden")) {
					return true
				}

				// Check aria-hidden
				if (node.getAttribute("aria-hidden") === "true") {
					return true
				}

				// Cache and reuse computed styles
				let computedStyle = computedStyleCache.get(node)
				if (!computedStyle) {
					computedStyle = getComputedStyle(node)
					computedStyleCache.set(node, computedStyle)
				}

				// Check CSS visibility
				if (computedStyle.display === "none" || computedStyle.visibility === "hidden") {
					return true
				}

				// Check inert property for HTMLElements
				if (node instanceof HTMLElement && node.inert) {
					return true
				}
			}
		}

		return false
	}

	function normalize(...strings: string[]): string {
		return strings
			.map((string) => string.trim().replace(/\s+/g, " "))
			.filter(Boolean)
			.join(" ")
	}

	function cacheAndReturn(cache: WeakMap<Element, string | null>, el: Element, text: string): string {
		cache.set(el, text)
		return text
	}

	function computeInputElementRole(el: HTMLInputElement): string | null {
		switch (el.type) {
			case "button":
			case "submit":
			case "reset":
			case "image":
				return "button"

			case "checkbox":
			case "radio":
				return el.type
		}

		return "textbox"
	}

	/**
	 * Optimized role computation using pre-computed constants and early returns
	 * Follows HTML-AAM specification for implicit role mappings
	 */
	function computeElementRole(el: TypedElement): string | null {
		// Use explicit role first
		const explicit = el.getAttribute("role")

		if (explicit) {
			return explicit
		}

		switch (el.tagName) {
			case "ARTICLE":
				return "article"
			case "ASIDE":
				return "complementary"
			case "BUTTON":
				return "button"
			case "FOOTER":
				return "contentinfo"
			case "FORM":
				return "form"
			case "H1":
				return "heading"
			case "H2":
				return "heading"
			case "H3":
				return "heading"
			case "H4":
				return "heading"
			case "H5":
				return "heading"
			case "H6":
				return "heading"
			case "HEADER":
				return "banner"
			case "IMG":
				return "img"
			case "LABEL":
				return "label"
			case "LI":
				return "listitem"
			case "MAIN":
				return "main"
			case "METER":
				return "progressbar"
			case "NAV":
				return "navigation"
			case "TABLE":
				return "table"
			case "TEXTAREA":
				return "textbox"

			case "OL":
			case "UL":
				return "list"

			case "INPUT":
				return computeInputElementRole(el)
			case "SECTION":
				return computeAccessibleName(el, { allowNameFromContent: false, knownRole: "region" })
					? "region"
					: "generic"
			case "SELECT":
				return el.multiple ? "listbox" : "combobox"

			case "A":
				return el.hasAttribute("href") ? "link" : null
		}

		// Check ElementInternals for custom elements
		const internals = internalsMap.get(el)

		if (internals?.role) {
			return internals.role
		}

		return null
	}

	function isElement(node: Node): node is TypedElement {
		return node.nodeType === Node.ELEMENT_NODE
	}

	/**
	 * Optimized text extraction with better performance for string concatenation
	 * Uses array join instead of string concatenation for better performance
	 */
	function asText(node: Node): string {
		if (node.nodeType === Node.TEXT_NODE) {
			return node.nodeValue ?? ""
		}

		if (!isElement(node) || isElementHidden(node)) {
			return ""
		}

		switch (node.tagName) {
			case "IMG":
				return node.alt ?? ""

			case "INPUT":
				switch (node.type) {
					case "button":
					case "submit":
					case "reset":
						return node.value

					case "image":
						return node.alt ?? ""
				}

				return ""
		}

		// Handle slot elements with assigned content (including text nodes)
		if (node instanceof HTMLSlotElement) {
			const assignedNodes = node.assignedNodes({ flatten: true })

			if (assignedNodes.length > 0) {
				return normalize(...Array.from(assignedNodes, asText))
			}
		}

		// Handle shadowroot childNodes
		const shadowRoot = shadowdomMap.get(node)
		if (shadowRoot) {
			return normalize(...Array.from(shadowRoot.childNodes, asText))
		}

		return normalize(...Array.from(node.childNodes, asText))
	}

	/**
	 * Gets associated label text for form elements
	 * Handles both explicit labels (for attribute) and implicit labels (wrapping)
	 */
	function associatedLabelText(el: HTMLElement): string | null {
		const doc = el.ownerDocument
		if (!doc) return null

		const id = el.id

		if (id) {
			const text = normalize(...Array.from(doc.querySelectorAll(`label[for="${CSS.escape(id)}"]`), asText))

			if (text) {
				return text
			}
		}

		if ((el as HTMLInputElement).labels) {
			const labels = (el as HTMLInputElement).labels!
			const text = normalize(...Array.from(labels, asText))

			if (text) {
				return text
			}
		}

		return null
	}

	function resolveIdRefs(doc: Document, ids: string): Element[] {
		return ids
			.trim()
			.split(/\s+/)
			.filter(Boolean)
			.map((id) => {
				try {
					return doc.getElementById(id) as Element
				} catch {}
				return null
			})
			.filter((node): node is Element => node !== null)
	}

	function getLabelledByElementsByAttribute(el: Element): Element[] {
		const labelledByAttr = el.getAttribute("aria-labelledby")

		return labelledByAttr && el.ownerDocument ? resolveIdRefs(el.ownerDocument, labelledByAttr) : []
	}

	/**
	 * Computes accessible name according to W3C Accessible Name and Description Computation
	 * Optimized with proper cache and visited set initialization
	 */
	function computeAccessibleName(el: TypedElement, opts: ComputeAccessibleNamesOptions = {}): string {
		// Initialize cache and visited set properly to avoid assignment in expressions
		const cache = opts.cache ?? new WeakMap()
		const visited = opts.visited ?? new WeakSet()

		// Update opts to use the initialized values
		opts.cache = cache
		opts.visited = visited

		if (cache.has(el)) {
			return cache.get(el) || ""
		}
		if (visited.has(el)) {
			return ""
		}
		visited.add(el)

		// 1) aria-labelledby (ElementInternals first, then attribute)
		// ElementInternals.ariaLabelledByElements takes precedence over ariaLabelledBy string
		const internals = internalsMap.get(el)

		const labelledByElements =
			(internals?.ariaLabelledByElements as Element[]) ?? getLabelledByElementsByAttribute(el)

		if (labelledByElements.length > 0) {
			const text = normalize(
				...Array.from(labelledByElements, (ref) =>
					computeAccessibleName(ref as TypedElement, { ...opts, allowNameFromContent: true }),
				),
			)

			if (text) {
				return cacheAndReturn(cache, el, text)
			}
		}

		// 2) aria-label (ElementInternals first, then attribute)
		const ariaLabel = el.getAttribute("aria-label") ?? internals?.ariaLabel ?? ""

		if (ariaLabel.trim()) {
			const text = normalize(ariaLabel)
			return cacheAndReturn(cache, el, text)
		}

		// 3) Native labeling
		const assoc = associatedLabelText(el as HTMLElement)
		if (assoc) {
			return cacheAndReturn(cache, el, assoc)
		}

		if (el.tagName === "IMG" && el.alt) {
			return cacheAndReturn(cache, el, normalize(el.alt))
		}

		if (el.tagName === "INPUT" && el.type === "image" && el.alt) {
			return cacheAndReturn(cache, el, normalize(el.alt))
		}

		if (
			el.tagName === "INPUT" &&
			["button", "submit", "reset"].includes(el.type) &&
			el.type !== "image" &&
			el.value
		) {
			return cacheAndReturn(cache, el, normalize(el.value))
		}

		if (el instanceof HTMLElement && el.title) {
			return cacheAndReturn(cache, el, normalize(el.title))
		}

		// 4) Name from content
		const role = opts.knownRole ?? computeElementRole(el as TypedElement)

		if (opts.allowNameFromContent !== false && role && rolesAllowingNameFromContent.has(role)) {
			const text = asText(el)
			if (text) {
				return cacheAndReturn(cache, el, text)
			}
		}

		// 5) Fallback to visible text
		const text = asText(el)
		return cacheAndReturn(cache, el, text || "")
	}

	function matchesNameFilter(
		element: TypedElement,
		nameFilter: string | undefined,
		exact: boolean | undefined,
	): boolean {
		if (nameFilter) {
			const accessibleRole = computeElementRole(element)
			const accessibleName = computeAccessibleName(element, { knownRole: accessibleRole })

			if (accessibleName) {
				if (exact) {
					return accessibleName === nameFilter
				} else {
					return accessibleName.toLowerCase().includes(nameFilter.toLowerCase())
				}
			}
		}

		return false
	}

	const isSelectorRoot = (node: Node): node is SelectorRoot =>
		node.nodeType === 1 || node.nodeType === 9 || node.nodeType === 11

	const getOwnerDocument = (root: SelectorRoot): Document =>
		root.nodeType === Node.DOCUMENT_NODE ? (root as Document) : (root.ownerDocument ?? document)

	/**
	 * Optimized element traversal generator with early exits and cached checks
	 * Handles shadow DOM, slots, and hidden elements efficiently
	 */
	function* getElements(node: Node, document: Document, visited: WeakSet<Node> = new WeakSet()): Generator<Element> {
		if (visited.has(node)) {
			return
		}

		visited.add(node)

		// Cache boolean checks for performance
		const isElement = node instanceof Element

		// Early exit for hidden elements
		const isHidden = isElement && isElementHidden(node)

		if (isElement && !isHidden) {
			yield node

			// Handle slot elements with assigned content
			if (node instanceof HTMLSlotElement) {
				const assignedElements = node.assignedElements({ flatten: true })

				if (assignedElements.length > 0) {
					for (const assignedElement of assignedElements) {
						yield* getElements(assignedElement, document, visited)
					}

					// Don't traverse slot's children if it has assigned content
					return
				}
			}

			// Handle Shadow DOM
			const shadowRoot = shadowdomMap.get(node)

			if (shadowRoot) {
				yield* getElements(shadowRoot, document, visited)

				// Don't traverse light DOM children when shadow DOM exists
				return
			}
		}

		// Traverse children for selector roots or non-hidden elements
		if (isSelectorRoot(node) && (!isElement || !isHidden)) {
			for (const childNode of node.childNodes) {
				yield* getElements(childNode, document, visited)
			}
		}
	}

	/**
	 * Optimized selector engine implementation
	 * Provides both single and multiple element selection
	 */
	class SelectorEngine {
		query(root: SelectorRoot, selector: string): Element | null {
			const { role, name, exact } = parse(selector)

			// Early exit if no role specified
			if (!role) {
				return null
			}

			for (const element of getElements(root, getOwnerDocument(root))) {
				const elementRole = computeElementRole(element as TypedElement)

				// Quick role check first (most common filter)
				if (elementRole !== role) {
					continue
				}

				// Only check name filter if name is specified and role matches
				if (name && !matchesNameFilter(element as TypedElement, name, exact)) {
					continue
				}

				return element
			}

			return null
		}

		queryAll(root: SelectorRoot, selector: string): Element[] {
			const { role, name, exact } = parse(selector)
			const results: Element[] = []

			// Early exit if no role specified
			if (!role) {
				return results
			}

			for (const element of getElements(root, getOwnerDocument(root))) {
				const elementRole = computeElementRole(element as TypedElement)

				// Quick role check first (most common filter)
				if (elementRole !== role) {
					continue
				}

				// Only check name filter if name is specified and role matches
				if (name && !matchesNameFilter(element as TypedElement, name, exact)) {
					continue
				}

				results.push(element)
			}

			return results
		}
	}

	return new SelectorEngine()
}

type TypedElements = {
	[K in keyof HTMLElementTagNameMap]: HTMLElementTagNameMap[K] & { tagName: Uppercase<K> }
}[keyof HTMLElementTagNameMap]

type TypedElement = TypedElements | (HTMLElement & { tagName: never })

type ComputeAccessibleNamesOptions = {
	knownRole?: string | null
	cache?: WeakMap<Element, string | null>
	visited?: WeakSet<Element>
	allowNameFromContent?: boolean
}
