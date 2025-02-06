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
			if (value instanceof Blob)
				form.append(name ? `${name}.${key}` : key, value)
			else if (typeof value == "object" && value)
				result[key] = Array.isArray(value)
					? toHelperArray(value, name ? `${name}.${key}` : key, form)
					: toHelperObject(value as Record<string, unknown>, name ? `${name}.${key}` : key, form)
			else
				result[key] = value
			return result
		}, {})
	}
	function toHelperArray(data: unknown[], name: string, form: globalThis.FormData) {
		return data.reduce<unknown[]>((result, value) => {
			if (typeof value != "object" || !value)
				result.push(value)
			else if (!Array.isArray(value))
				result.push(toHelperObject(value as Record<string, unknown>, name, form))
			else
				result.push(toHelperArray(value, name, form))
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
		if (tail.length == 0) {
			if (value instanceof Blob && value.type.startsWith("application/json"))
				if (!head)
					merge(data, JSON.parse(await value.text()))
				else if (typeof data[head] == "object" && data[head])
					merge(data[head] as Record<string, unknown>, JSON.parse(await value.text()))
				else
					data[head] = JSON.parse(await value.text())
			else
				data[head] = value
		} else {
			if (typeof data[head] != "object" || !data[head])
				data[head] = {}
			set(data[head] as Record<string, unknown>, tail, value)
		}
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
	export async function toObject(data: globalThis.FormData): Promise<Record<string, any>> {
		return Object.fromEntries(
			await Promise.all(
				[...data.entries()].map(async ([property, value]) => [
					property,
					!(value instanceof File)
						? value
						: value.type.startsWith("application/json")
						? JSON.parse(await value.text())
						: new Array(...new Uint8Array(await value.arrayBuffer())),
				])
			)
		)
	}
}
