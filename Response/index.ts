import * as Parser from "../Parser"
import * as Serializer from "../Serializer"
import { Header as ResponseHeader } from "./Header"
import { Like as ResponseLike } from "./Like"

export interface HttpResponse {
	readonly status: number
	readonly header: Readonly<ResponseHeader>
	readonly body?: any | Promise<any>
	readonly socket?: WebSocket
}

export namespace HttpResponse {
	export function is(value: any | HttpResponse): value is HttpResponse {
		return (
			typeof value == "object" &&
			Object.keys(value).every(key => ["status", "header", "body", "socket"].some(k => k == key)) &&
			(value.status == undefined || typeof value.status == "number") &&
			(value.header == undefined || ResponseHeader.is(value.header)) &&
			(value.socket == undefined || value.socket instanceof WebSocket)
		)
	}
	export async function to(request: HttpResponse): Promise<Response> {
		return new Response(await Serializer.serialize(await request.body, request.header.contentType), {
			status: request.status,
			headers: new Headers(ResponseHeader.to(request.header) as Record<string, string>),
			...(request.socket && { webSocket: request.socket }),
		} as ResponseInit & { webSocket?: WebSocket | null })
	}
	export function from(response: Response & { webSocket?: WebSocket | null }): HttpResponse {
		return {
			status: response.status,
			header: ResponseHeader.from(response.headers),
			body: response.status == 101 ? undefined : Parser.parse(response),
			...(response.webSocket && { socket: response.webSocket }),
		}
	}
	export function create(response: ResponseLike | any, contentType?: string): HttpResponse {
		const result: Required<Omit<ResponseLike, "webSocket" | "socket">> = ResponseLike.is(response)
			? {
					status: 200,
					header: {},
					body: undefined,
					...((response.webSocket && { socket: response.webSocket }) ||
						(response.socket && { socket: response.socket })),
					...response,
			  }
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
					...((response.webSocket && { socket: response.webSocket }) ||
						(response.socket && { socket: response.socket })),
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
	export const Like = ResponseLike
}
