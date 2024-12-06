import { Authorization } from "./Authorization"
import { Fetch, fetch, GlobalFetch } from "./fetch"
import { Method } from "./Method"
import { Middleware } from "./Middleware"
import { Request } from "./Request"
import { Response } from "./Response"

//...(this.key ? { authorization: `Bearer ${this.key}` } : undefined),
export class Client<Error = never> {
	onError?: (request: Request, response: Response) => Promise<boolean>
	onUnauthorized?: (connection: Client<Error>) => Promise<boolean>
	authorization?: Authorization
	private f: Fetch
	constructor(
		public url?: string,
		public key?: string,
		options?: Partial<Pick<Client<Error>, "onError" | "onUnauthorized" | "authorization">> & {
			process?: Middleware<any, Body, BodyInit, any>
		} & { fetch: GlobalFetch }
	) {
		this.f = fetch.create(
			options?.fetch ?? globalThis.fetch,
			Middleware.merge(options?.process ?? Middleware.create("client"), (request, next) =>
				next(
					this.authorization == undefined
						? request
						: {
								...request,
								header: {
									...request.header,
									...(!request.header.authorization &&
										this.authorization && { authorization: Authorization.serialize(this.authorization) }),
								},
						  }
				)
			)
		)
		Object.assign(this, options)
	}
	/**
	 * @param path Note: Prior to version 0.1.0 this method inserted a `/` between url and path.
	 */
	private async fetch<R>(path: string, method: Method, body?: any, header?: Request.Header): Promise<R | Error> {
		const request = Request.create({ url: `${this.url ?? ""}${path}`, method, header, body })
		const response = await this.f(request).catch(error => Response.create({ status: 601, body: error }))
		return (response.status == 401 && this.onUnauthorized && (await this.onUnauthorized(this))) ||
			(response.status >= 300 && this.onError && (await this.onError(request, response)))
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
