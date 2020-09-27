import { fetch as f } from "./fetch"
import { Request } from "../Request"
import { Response } from "../Response"
import * as Parser from "../Parser"

export async function fetch<T>(request: Request): Promise<Response<T>> {
	const result = await f(request.url, {
		method: request.method ?? "GET",
		headers: Request.Header.to(request.header ?? {}),
		body: request.body.then(b => Parser.parse(header.contentType, b),
	})
	const header = Response.Header.from(result.headers.entries())
	return { status: result.status, header, body: await result.text() }
}
