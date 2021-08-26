import { fetch } from "./fetch"
import { Method } from "./Method"
import { Request } from "./Request"
import { Response } from "./Response"

export class Client<Error = void> {
	onError?: (request: Request, response: Response) => Promise<boolean>
	onUnauthorized?: (connection: Client<Error>) => Promise<boolean>
	constructor(public url?: string, public key?: string) {}

	private async fetch<R>(path: string, method: Method, body?: any, header?: Request.Header): Promise<R | Error> {
		const request = await this.preProcess(Request.create({ url: `${this.url ?? ""}/${path}`, method, header, body }))
		const response = await this.postProcess(
			await fetch(request).catch(error => Response.create({ status: 601, body: error }))
		)
		return (response.status == 401 && this.onUnauthorized && (await this.onUnauthorized(this))) ||
			(response.status >= 300 && this.onError && (await this.onError(request, response)))
			? await this.fetch<R>(path, method, body, header)
			: ((await response.body) as R | Error)
	}
	protected async preProcess(request: Request): Promise<Request> {
		return {
			...request,
			header: {
				contentType: request.body ? "application/json; charset=utf-8" : undefined,
				authorization: this.key ? `Bearer ${this.key}` : undefined,
				...request.header,
			},
		}
	}
	protected async postProcess(response: Response): Promise<Response> {
		return response
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
