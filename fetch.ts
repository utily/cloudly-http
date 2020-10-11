import { Request } from "./Request"
import { Response } from "./Response"

export async function fetch(request: Request.Like | string): Promise<Response> {
	const r = Request.create(request)
	return Response.from(await globalThis.fetch(r.url.toString(), await Request.to(r)))
}
