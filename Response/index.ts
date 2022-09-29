import * as Parser from "../Parser"
import * as Platform from "../Platform"
import * as Serializer from "../Serializer"
import { Socket } from "../Socket"
import { Header as ResponseHeader } from "./Header"
import { Like as ResponseLike } from "./Like"

export interface Response {
	readonly status: number
	readonly header: Readonly<ResponseHeader>
	readonly body?: any | Promise<any>
	readonly socket?: Socket.Factory
}
export namespace Response {
	export function is(value: any | Response): value is Response {
		return (
			typeof value == "object" &&
			Object.keys(value).every(key => ["status", "header", "body", "socket"].some(k => k == key)) &&
			(value.status == undefined || typeof value.status == "number") &&
			(value.header == undefined || ResponseHeader.is(value.header)) &&
			(value.socket == undefined || value.socket instanceof WebSocket)
		)
	}
	export async function to(request: Response): Promise<Platform.Response> {
		return new Platform.Response(await Serializer.serialize(await request.body, request.header.contentType), {
			status: request.status,
			headers: new Headers(ResponseHeader.to(request.header) as Record<string, string>),
			...(request.socket && {
				webSocket: ({ ...request.socket.createResponse().socket } as Record<string, string | undefined>)?.backend,
			}),
		} as ResponseInit & { webSocket?: WebSocket | null })
	}
	export function from(response: Platform.Response & { webSocket?: WebSocket | null }): Response {
		return {
			status: response.status,
			header: ResponseHeader.from(response.headers),
			body: response.status == 101 ? undefined : Parser.parse(response),
			...(response.webSocket && { socket: new Socket.Factory(response.webSocket) }),
		}
	}
	export function create(
		response: ResponseLike | Socket.Factory | any,
		contentType?: ResponseHeader | string
	): Response {
		const result: Required<Omit<ResponseLike, "socket">> = ResponseLike.is(response)
			? {
					status: 200,
					header: {},
					body: undefined,
					...(response.socket && { socket: response.socket }),
					...response,
			  }
			: typeof response?.createResponse == "function" && (contentType == undefined || ResponseHeader.is(contentType))
			? (response as Socket.Factory).createResponse(contentType as ResponseHeader)
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
						response instanceof ArrayBuffer || ArrayBuffer.isView(response)
							? response
							: typeof response == "object" && !Array.isArray(response)
							? (({ header, ...body }) => body)(response)
							: response,
					...((response.webSocket && { socket: new Socket.Factory(response.webSocket) }) ||
						(response.socket && { socket: response.socket })),
			  }
		if (!result.header.contentType)
			switch (typeof result.body) {
				case "undefined":
					break
				default:
				case "object":
					if (typeof contentType == "string")
						result.header.contentType = contentType
					else if (contentType?.contentType)
						result.header.contentType = contentType.contentType
					else if (result.body instanceof ArrayBuffer || ArrayBuffer.isView(result.body)) {
						const bytes = new Uint8Array(ArrayBuffer.isView(result.body) ? result.body.buffer : result.body).slice(0, 4)
						;[37, 80, 68, 70].every((current, index) => current == bytes[index])
							? (result.header.contentType = "application/pdf")
							: (result.header.contentType = "application/octet-stream")
					} else
						result.header.contentType = "application/json; charset=utf-8"
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
	export const Header = ResponseHeader
	export type Like = ResponseLike
	export const Like = ResponseLike
}
