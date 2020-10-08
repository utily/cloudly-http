import { Method } from "./Request/Method"
import * as Parser from "./Parser"
import * as Stringifier from "./Stringifier"
import { Request } from "./Request"
import { Response } from "./Response"
import { fetch } from "./fetch"

Parser.add(request => request.text(), "text/plain", "text/html")
Parser.add(request => request.json(), "application/json")
Parser.add(async request => {
	const result: { [property: string]: FormDataEntryValue } = {}
	if (isRequest(request))
		(await request.formData()).forEach((value, key) => (result[key] = value))
	return result
}, "multipart/form-data")

Stringifier.add(async body => (typeof body == "string" ? body : body.toString()), "text/plain", "text/html")
Stringifier.add(async body => JSON.stringify(body), "application/json")

function isRequest(
	value: any | globalThis.Request | globalThis.Response
): value is globalThis.Request | globalThis.Response {
	return typeof value.formData == "function"
}
export { Method, Request, Response, fetch }
