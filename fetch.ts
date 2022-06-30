import { Request } from "./Request"
import { HttpResponse } from "./Response"

type Fetch = (request: Request.Like | string) => Promise<HttpResponse>
type GlobalFetch = (url: string, init: RequestInit) => Promise<Response>

export const fetch = create(globalThis.fetch) as Fetch & {
	create: (fetch: GlobalFetch) => Fetch
}
fetch.create = create

function create(fetch: GlobalFetch): Fetch {
	return async (request: Request.Like | string): Promise<HttpResponse> => {
		const r = Request.create(request)
		return HttpResponse.from(await fetch(r.url.toString(), await Request.to(r)))
	}
}
