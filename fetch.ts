import * as api from "./api"
import { Request } from "./Request"
import { Response } from "./Response"

export async function fetch(request: Request.Like | string): Promise<Response> {
	const r = Request.create(request)
	return Response.from(await api.fetch(r.url, await Request.to(r)))
}
