import { ContentType } from "../ContentType"
import { Parser } from "../Parser"
import * as Platform from "../Platform"
import { Serializer } from "../Serializer"
import { Socket } from "../Socket"
import { Header as ResponseHeader } from "./Header"
import { Like as ResponseLike } from "./Like"

export interface Response<T = any | Promise<any>> {
	readonly status: number
	readonly header: Readonly<Response.Header>
	readonly socket?: Socket.Factory
	readonly body?: T
}
export namespace Response {
	export function is<T = any | Promise<any>>(value: any | Response<T>): value is Response<T> {
		return (
			typeof value == "object" &&
			Object.keys(value).every(key => ["status", "header", "body", "socket"].some(k => k == key)) &&
			(value.status == undefined || typeof value.status == "number") &&
			(value.header == undefined || ResponseHeader.is(value.header)) &&
			(value.socket == undefined || value.socket instanceof WebSocket)
		)
	}
	export async function to(response: Response, serializer?: Serializer | "none"): Promise<Platform.Response>
	export async function to(response: Response<BodyInit>, serializer: "none"): Promise<Platform.Response>
	export async function to(response: Response, serializer?: Serializer | "none"): Promise<Platform.Response> {
		const result = serializer == "none" ? response : await (serializer ?? Serializer).serialize(response)
		return new Platform.Response(result?.body, {
			status: result?.status,
			headers: new Headers(ResponseHeader.to(result?.header ?? {}) as Record<string, string>),
			...(result?.socket && {
				webSocket: ({ ...result?.socket.createResponse().socket } as Record<string, string | undefined>)?.backend,
			}),
		} as ResponseInit & { webSocket?: WebSocket | null })
	}
	export async function from<T = any | Promise<any>>(
		response: Platform.Response & { webSocket?: WebSocket | null },
		parser?: Parser<T>
	): Promise<Response<T>>
	export async function from(
		response: Platform.Response & { webSocket?: WebSocket | null },
		parser: "none"
	): Promise<Response<Body>>
	export async function from<T = any | Promise<any>>(
		response: Platform.Response & { webSocket?: WebSocket | null },
		parser?: Parser<T> | "none"
	): Promise<Response<T>> {
		const result: Response<Body> = {
			status: response.status,
			header: ResponseHeader.from(response.headers),
			...(response.webSocket && { socket: new Socket.Factory(response.webSocket) }),
			body: response.status == 101 ? undefined : response,
		}
		return parser == "none" ? (result as Response<T>) : (parser ?? Parser).parse(result)
	}
	export function create<T = any | Promise<any>>(
		response: Response.Like<T> | Socket.Factory | any,
		contentType?: Response.Header | string
	): Response<T> {
		let result: Omit<Response<T>, "socket"> | Required<Omit<Response, "body">>
		contentType = (typeof contentType == "string" ? { contentType } : contentType) ?? {}
		if (Response.Like.is(response)) {
			const header: Response.Header = { ...response.header, ...contentType }
			// eslint-disable-next-line @typescript-eslint/no-unused-expressions
			!header.contentType && (header.contentType = ContentType.deduce(response.body))
			result = {
				status: response.status ?? 200,
				header,
				body: response.body,
				...(response.socket && { socket: response.socket }),
			}
		} else if (response instanceof Socket.Factory)
			result = response.createResponse(contentType)
		else if (!response)
			result = { status: 204, header: contentType }
		else {
			const body =
				!(typeof response == "object" && !Array.isArray(response)) ||
				response instanceof ArrayBuffer ||
				ArrayBuffer.isView(response)
					? response
					: (({ header, ...body }) => body)(response)
			const header = Header.fromAny(response, contentType)
			// eslint-disable-next-line @typescript-eslint/no-unused-expressions
			!header.contentType && (header.contentType = ContentType.deduce(body))
			result = {
				status: (typeof response == "object" && typeof response.status == "number" && response.status) || 200,
				header,
				body,
				...((response.webSocket && { socket: new Socket.Factory(response.webSocket) }) ||
					(response.socket && { socket: response.socket })),
			}
		}
		return result
	}
	export type Header = ResponseHeader
	export const Header = ResponseHeader
	export type Like<T = any | Promise<any>> = ResponseLike<T>
	export const Like = ResponseLike
}
