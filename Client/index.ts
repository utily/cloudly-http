import { Authorization } from "../Authorization"
import { Fetch, fetch, GlobalFetch } from "../fetch"
import { Method } from "../Method"
import { Middleware } from "../Middleware"
import { Request } from "../Request"
import { Response } from "../Response"

export class Client<Error = never> {
	preprocess = async (request: Request): Promise<Request> => request
	getHeader? = async (request: Request) => ({
		...(request.body ? { contentType: "application/json; charset=utf-8" } : undefined),
		...(!request.header.authorization
			? { authorization: Authorization.serialize(this.authorization) ?? (this.key ? `Bearer ${this.key}` : undefined) }
			: undefined),
		...this.appendHeader?.(request),
		...request.header
	})
	appendHeader?: (request: Request) => Request.Header
	postprocess = async (response: Response): Promise<Response> => response
	onError?: (request: Request, response: Response) => Promise<boolean>
	onUnauthorized?: (connection: Client<Error>) => Promise<boolean>
	authorization?: Authorization
	process?: Middleware<any, Body, BodyInit, any>
	private authorized?: Promise<boolean>
	private f: Fetch
	constructor(
		public url?: string,
		public key?: string,
		options?: Partial<
			Pick<
				Client<Error>,
				| "preprocess"
				| "getHeader"
				| "appendHeader"
				| "postprocess"
				| "onError"
				| "onUnauthorized"
				| "authorization"
				| "process"
			>
		> & { fetch?: GlobalFetch }
	) {
		this.authorization = options?.authorization
		this.process = options?.process
		this.onError = options?.onError
		this.onUnauthorized = options?.onUnauthorized
		if (options?.preprocess) this.preprocess = options.preprocess
		if (options?.getHeader) this.getHeader = options.getHeader
		if (options?.appendHeader) this.appendHeader = options.appendHeader
		if (options?.postprocess) this.postprocess = options.postprocess
		this.f = fetch.create(
			options?.fetch ?? globalThis.fetch,
			Middleware.merge(this.process ?? Middleware.create("client"), (request, next) =>
				next(
					request.header.authorization || this.authorization == undefined
						? request
						: { ...request, header: { ...request.header, authorization: Authorization.serialize(this.authorization) } }
				)
			)
		)
	}
	private async fetch<R>(path: string, method: Method, body?: any, header?: Request.Header): Promise<R | Error> {
		await this.authorized
		let request = Request.create({ url: `${this.url ?? ""}${path}`, method, header, body })
		request = await this.preprocess({ ...request, header: (await this.getHeader?.(request)) ?? request.header })
		const response = await this.postprocess(
			await this.f(request).catch(error => Response.create({ status: 601, body: error }))
		)
		const unauthorized =
			response.status == 401 && this.onUnauthorized ? await (this.authorized = this.onUnauthorized(this)) : false
		const error =
			response.status >= 300 && this.onError && !unauthorized ? await this.onError(request, response) : false
		return unauthorized || error
			? await this.fetch<R>(path, method, body, header)
			: ((await response.body) as R | Error)
	}
	async get<R>(path: string, header?: Request.Header): Promise<R | Error> {
		return await this.fetch<R>(path, "GET", undefined, header)
	}
	async post<R>(path: string, request: any, header?: Request.Header): Promise<R | Error> {
		return await this.fetch<R>(path, "POST", request, header)
	}
	async delete<R>(path: string, header?: Request.Header): Promise<R | Error> {
		return await this.fetch<R>(path, "DELETE", undefined, header)
	}
	async patch<R>(path: string, request: any, header?: Request.Header): Promise<R | Error> {
		return await this.fetch<R>(path, "PATCH", request, header)
	}
	async put<R>(path: string, request: any, header?: Request.Header): Promise<R | Error> {
		return await this.fetch<R>(path, "PUT", request, header)
	}
}
