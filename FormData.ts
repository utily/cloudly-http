import * as Parser from "./Parser"

export function to(data: { [key: string]: any }): FormData {
	const result = new FormData()
	result.append("", JSON.stringify(data))
	return result
}
export async function from(data: FormData): Promise<{ [key: string]: any }> {
	const result = Object.assign(
		{},
		...data
			.getAll("")
			.map(async entry =>
				entry instanceof Blob && entry.type.startsWith("application/json") ? JSON.parse(await entry.text()) : entry
			)
	)
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
	if (!target)
		target = {}
	if (!sources.length)
		return target ?? {}
	const source = sources.shift()
	if (isObject(target) && isObject(source)) {
		for (const key in source) {
			if (isObject(source[key])) {
				if (!target[key])
					Object.assign(target, { [key]: {} })
				merge(target[key], source[key])
			} else
				Object.assign(target, { [key]: source[key] })
		}
	}
	return merge(target, ...sources)
}
function isObject(item) {
	return item && typeof item === "object" && !Array.isArray(item)
}
// const d = {
// 	name: "fasf",
// 	payment: {
// 		number: "fasdf",
// 		receipt: new File([], ""),
// 	},
// }
