export function stringify(data: { [key: string]: any }): string {
	const result: string[] = []
	const map = (key: string, value: any) => {
		switch (typeof value) {
			default:
			case "bigint":
			case "boolean":
			case "number":
			case "string":
				result.push(`${key}=${encodeURIComponent(value.toString())}`)
				break
			case "undefined":
				break
			case "object":
				for (const property in value)
					if (Object.prototype.hasOwnProperty.call(value, property))
						map(key ? key + `[${property}]` : property, value[property])
				break
		}
	}
	map("", data)
	return result.join("&")
}
export function parse(data: string): { [key: string]: any } {
	const convertArrays = (target: Record<string, any>): Record<string, any> | any[] => {
		return typeof target == "object" &&
			Object.keys(target)
				.sort()
				.every((k, i) => `${k}` == `${i}`)
			? Object.entries(target)
					.sort()
					.map(entry => (typeof entry[1] == "object" ? convertArrays(entry[1]) : entry[1]))
			: typeof target == "object"
			? Object.fromEntries(Object.entries(target).map(entry => [entry[0], convertArrays(entry[1])]))
			: target
	}
	const insert = (target: { [key: string]: any }, key: string[], value: string): any => {
		target[key[0]] = key.length > 1 ? insert(target[key[0]] ?? {}, key.slice(1), value) : value
		return target
	}
	const entries = data
		.split("&")
		.map<[string, string]>(d => d.split("=", 2) as [string, string])
		.map<[string[], string]>(([k, v]) => [
			decodeURIComponent(k)
				.split("[")
				.map(p => p.replace("]", "")),
			decodeURIComponent(v.replace(/\+/g, " ")),
		])
	return entries.reduce<{ [key: string]: any }>((result, [key, value]) => convertArrays(insert(result, key, value)), {})
}
