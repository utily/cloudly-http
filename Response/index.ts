import * as Parser from "../Parser"
import * as Serializer from "../Serializer"
import { Header as ResponseHeader } from "./Header"
import { Like as ResponseLike } from "./Like"

export interface Response {
	readonly status: number
	readonly header: Readonly<ResponseHeader>
	readonly body?: any | Promise<any>
}

export namespace Response {
	export function is(value: any | Response): value is Response {
		return (
			typeof value == "object" &&
			Object.keys(value).every(key => ["status", "header", "body"].some(k => k == key)) &&
			(value.status == undefined || typeof value.status == "number") &&
			(value.header == undefined || ResponseHeader.is(value.header))
		)
	}
	export async function to(request: Response): Promise<globalThis.Response> {
		return new globalThis.Response(await Serializer.serialize(await request.body, request.header.contentType), {
			status: request.status,
			headers: new globalThis.Headers(ResponseHeader.to(request.header)),
		})
	}
	export function from(response: globalThis.Response): Response {
		return {
			status: response.status,
			header: ResponseHeader.from(response.headers),
			body: Parser.parse(response),
		}
	}
	export function create(response: ResponseLike | any, contentType?: string): Response {
		const result: Required<ResponseLike> = ResponseLike.is(response)
			? { status: 200, header: {}, body: undefined, ...response }
			: {
					status: (typeof response == "object" && typeof response.status == "number" && response.status) || 200,
					header:
						typeof response == "object"
							? {
									...response.header,
									...((response.status == 301 || response.status == 302) && response.location
										? { location: response.location }
										: {}),
							  }
							: {},
					body:
						typeof response == "object" && !Array.isArray(response)
							? (({ header, ...body }) => body)(response)
							: response,
			  }
		if (!result.header.contentType)
			switch (typeof result.body) {
				case "undefined":
					break
				default:
				case "object":
					result.header.contentType = contentType ?? "application/json; charset=utf-8"
					break
				case "string":
					result.header.contentType =
						result.body.slice(0, 9).toLowerCase() == "<!doctype"
							? "text/html; charset=utf-8"
							: /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/.test(result.body)
							? "application/jwt; charset=utf-8"
							: /^<\?xml version=(.|\n)*\?>(.|\n)*<svg(.|\n)*<\/svg>$/.test(result.body)
							? "image/svg+xml"
							: "text/plain; charset=utf-8"
					break
			}
		return result
	}
	export type Header = ResponseHeader
	export namespace Header {
		export const to = ResponseHeader.to
		export const from = ResponseHeader.from
	}
	export type Like = ResponseLike
}
