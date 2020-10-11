import * as api from "./api"

const serializers: {
	[contentType: string]: ((body: any, contentType?: string) => Promise<api.BodyInit | undefined>) | undefined
} = {}
export function add(
	serializer: (body: any, contentType?: string) => Promise<api.BodyInit | undefined>,
	...contentType: string[]
): void {
	contentType.forEach(t => (serializers[t] = serializer))
}
export function serialize(body: any, contentType?: string): Promise<api.BodyInit | undefined> {
	const serializer = serializers[contentType?.split(";")[0] ?? ""]
	return serializer ? serializer(body, contentType) : body
}
