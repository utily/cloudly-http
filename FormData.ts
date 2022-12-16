export function to(data: { [key: string]: any }): FormData {
	const result = new FormData()
	result.append("", JSON.stringify(toHelper(data, "", result)))
	return result
}
function toHelper(data: { [key: string]: any }, name: string, form: FormData): { [key: string]: any } {
	return Object.entries(data).reduce(
		(result, [property, value]) =>
			value instanceof Blob
				? (form.append(name ? [name, property].join(".") : property, value), result)
				: { ...result, [property]: value },
		{}
	)
}

export async function from(data: FormData): Promise<{ [key: string]: any }> {
	const result = {}
	for (const [name, entry] of data.entries())
		set(result, name.split("."), entry)
	return result
}
async function set(
	data: Record<string, any> | undefined,
	name: string[],
	value: string | Blob
): Promise<Record<string, any> | string | Blob> {
	let result: Record<string, any> | string | Blob
	if (name.length == 0) {
		result =
			value instanceof Blob && value.type.startsWith("application/json")
				? merge(data, JSON.parse(await value.text()))
				: value
	} else {
		const [head, ...tail] = name
		result = { ...data, [head]: set(data?.[head], tail, value) }
	}
	return result
}

function merge(target: Record<string, any> | undefined, ...sources: Record<string, any>[]): Record<string, any> {
	let result = target ?? {}
	if (sources.length) {
		const [head, ...tail] = sources
		if (isObject(result) && isObject(head))
			for (const key in head)
				result = { ...result, [key]: !isObject(head[key]) ? head[key] : merge(result[key], head[key]) }
		result = merge(result, ...tail)
	}
	return result
}
export function isObject(value: any): value is Record<string, any> {
	return value && typeof value == "object" && !Array.isArray(value)
}
