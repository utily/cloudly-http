export namespace FormData {
	export function to(data: { [key: string]: any }): FormData {
		const result = new globalThis.FormData()
		result.append(
			"",
			new globalThis.Blob([new TextEncoder().encode(JSON.stringify(toHelperObject(data, "", result)))], {
				type: "application/json; charset=utf-8",
			})
		)
		return result
	}
	function toHelperObject(
		data: { [key: string]: unknown },
		name: string,
		form: globalThis.FormData
	): { [key: string]: unknown } {
		return Object.entries(data).reduce<Record<string, unknown>>((result, [key, value]) => {
			value instanceof Blob
				? form.append(name ? `${name}.${key}` : key, value)
				: typeof value == "object" && value
				? Array.isArray(value)
					? (result[key] = toHelperArray(value, name ? `${name}.${key}` : key, form))
					: (result[key] = toHelperObject(value as Record<string, unknown>, name ? `${name}.${key}` : key, form))
				: (result[key] = value)
			return result
		}, {})
	}
	function toHelperArray(data: unknown[], name: string, form: globalThis.FormData) {
		return data.reduce<unknown[]>((result, value) => {
			typeof value == "object" && value
				? Array.isArray(value)
					? result.push(toHelperArray(value, name, form))
					: result.push(toHelperObject(value as Record<string, unknown>, name, form))
				: result.push(value)
			return result
		}, [])
	}
	export async function from(form: FormData): Promise<{ [key: string]: any }> {
		const result = {}
		for (const [name, value] of form.entries())
			await set(result, name.split("."), value)
		return result
	}
	async function set(data: Record<string, unknown>, [head, ...tail]: string[], value: string | Blob) {
		if (tail.length == 0)
			value instanceof Blob && value.type.startsWith("application/json")
				? !head
					? merge(data, JSON.parse(await value.text()))
					: typeof data[head] == "object" && data[head]
					? merge(data[head] as Record<string, unknown>, JSON.parse(await value.text()))
					: (data[head] = JSON.parse(await value.text()))
				: (data[head] = value)
		else
			set(
				typeof data[head] == "object" && data[head] ? (data[head] as Record<string, unknown>) : (data[head] = {}),
				tail,
				value
			)
	}
	function merge(target: Record<string, unknown>, ...sources: Record<string, unknown>[]) {
		if (sources.length) {
			const [head, ...tail] = sources
			Object.entries(head).forEach(([key, value]) =>
				isObject(value)
					? merge(isObject(target[key]) ? (target[key] as Record<string, unknown>) : (target[key] = {}), value)
					: (target[key] = head[key])
			)
			merge(target, ...tail)
		}
	}
	export function isObject(value: any): value is Record<string, unknown> {
		return value && typeof value == "object" && !Array.isArray(value)
	}
}
