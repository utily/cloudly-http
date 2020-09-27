import { Method } from "../Method"
import { Header as RequestHeader } from "./Header"
import { getBaseUrl } from "./getBaseUrl"
import { parse as parseBody } from "./parse"

export interface Request {
	readonly method?: Method
	readonly url: string
	readonly baseUrl: string
	readonly query: { [key: string]: string }
	readonly parameter: { [key: string]: string }
	readonly remote?: string
	readonly header: RequestHeader
	readonly body?: Promise<any>
	readonly raw?: Promise<any>
}

export namespace Request {
	// eslint-disable-next-line @typescript-eslint/ban-types
	export function create(request: Omit<Partial<Request>, "body"> & { body?: Promise<any> | object | any }): Request {
		let result: Request = {
			url: "",
			baseUrl: getBaseUrl(request.url) || "",
			query: {},
			parameter: {},
			header: {},
			...request,
			remote: request.remote,
		}
		if (result.raw) {
			if (!result.body)
				result = { ...result, body: result.raw.then(data => parse(result.header, data)) }
		} else if (!result.body?.then)
			result = { ...result, body: Promise.resolve(result.body) }
		return result
	}
	export type Header = RequestHeader
	export namespace Header {
		export const is = RequestHeader.is
		export const from = RequestHeader.from
		export const to = RequestHeader.to
	}
	export const parse = parseBody
}
