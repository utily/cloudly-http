import { fetch } from "./fetch"
import { Method } from "./Method"
import { Request } from "./Request"
import { Response } from "./Response"

export class Client<Error = never> {
	preprocess = async (request: Request): Promise<Request> => request
	getHeader? = async (request: Request) => ({
		...(request.body ? { contentType: "application/json; charset=utf-8" } : undefined),
		...(this.key ? { authorization: `Bearer ${this.key}` } : undefined),
		...this.appendHeader?.(request),
		...request.header,
	})
	appendHeader?: (request: Request) => Request.Header
	postprocess = async (response: Response): Promise<Response> => response
	onError?: (request: Request, response: Response) => Promise<boolean>
	onUnauthorized?: (connection: Client<Error>, request: Request, response: Response) => Promise<boolean>

	constructor(
		public url?: string,
		public key?: string,
		callbacks?: Partial<
			Pick<Client<Error>, "preprocess" | "getHeader" | "appendHeader" | "postprocess" | "onError" | "onUnauthorized">
		>
	) {
		Object.assign(this, callbacks)
	}
	/**
	 * @param path Note: Prior to version 0.1.0 this method inserted a `/` between url and path.
	 */
	private async fetch<R>(path: string, method: Method, body?: any, header?: Request.Header): Promise<R | Error> {
		let request = Request.create({ url: `${this.url ?? ""}${path}`, method, header, body })
		request = await this.preprocess({ ...request, header: (await this.getHeader?.(request)) ?? request.header })
		const response = await this.postprocess(
			await fetch(request).catch(error => Response.create({ status: 601, body: error }))
		)
		return (response.status == 401 && this.onUnauthorized && (await this.onUnauthorized(this, request, response))) ||
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
