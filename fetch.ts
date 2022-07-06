import * as Platform from "./Platform"
import { Request } from "./Request"
import { Response } from "./Response"

type Fetch = (request: Request.Like | string) => Promise<Response>
type GlobalFetch = (url: string, init: RequestInit) => Promise<Platform.Response>

export const fetch = create(globalThis.fetch) as Fetch & {
	create: (fetch: GlobalFetch) => Fetch
}
fetch.create = create

function create(fetch: GlobalFetch): Fetch {
	return async (request: Request.Like | string): Promise<Response> => {
		const r = Request.create(request)
		return Response.from(await fetch(r.url.toString(), await Request.to(r)))
	}
}
