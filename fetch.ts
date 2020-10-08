import * as api from "./api"
import { Request } from "./Request"
import { Response } from "./Response"
import * as Stringifier from "./Stringifier"
import * as Parser from "./Parser"

export async function fetch(request: Request): Promise<Response> {
	const response = await api.fetch(request.url, {
		method: request.method ?? "GET",
		headers: Request.Header.to(request.header),
		body: await Stringifier.stringify(isPromise(request.body) ? await request.body.then(async b => b) : request.body),
	})
	const header = Response.Header.from(response.headers)
	return { status: response.status, header, body: Parser.parse(response) }
}

function isPromise<T>(value: any | Promise<T>): value is Promise<T> {
	return typeof value == "object" && typeof value.then == "function"
}
