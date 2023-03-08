import { Middleware } from "./Middleware"
import * as Platform from "./Platform"
import { Request } from "./Request"
import { Response } from "./Response"

export type Fetch = (request: Request.Like | string) => Promise<Response>
export type GlobalFetch = (url: string, init: RequestInit) => Promise<Platform.Response>

export const fetch = create(globalThis.fetch) as Fetch & {
	create: <TRequest = any, TResponse = Promise<any>>(
		fetch: GlobalFetch,
		middleware?: Middleware<TResponse, Body, BodyInit, TRequest>
	) => Fetch
}
fetch.create = create

function create<TRequest = any, TResponse = Promise<any>>(
	fetch: GlobalFetch,
	middleware?: Middleware<TResponse, Body, BodyInit, TRequest>
): Fetch {
	return async (request: Request.Like<TRequest> | string): Promise<Response> => {
		const r = Request.create(request)
		return (middleware ?? Middleware.create("client"))(r, async r =>
			Response.from(await fetch(r.url.toString(), await Request.to(r, "none")), "none")
		)
	}
}
