import * as api from "./api"

const stringifiers: {
	[contentType: string]: ((body: any, contentType?: string) => Promise<api.BodyInit | undefined>) | undefined
} = {}
export function add(
	stringifier: (body: any, contentType?: string) => Promise<api.BodyInit | undefined>,
	...contentType: string[]
): void {
	contentType.forEach(t => (stringifiers[t] = stringifier))
}
export function stringify(body: any, contentType?: string): Promise<api.BodyInit | undefined> {
	const stringifier = stringifiers[contentType?.split(";")[0] ?? ""]
	return stringifier ? stringifier(body, contentType) : body
}
