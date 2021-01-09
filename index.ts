import { Method } from "./Request/Method"
import * as Parser from "./Parser"
import * as Serializer from "./Serializer"
import { Request } from "./Request"
import { Response } from "./Response"
import { fetch } from "./fetch"

Parser.add(async request => await request.text(), "text/plain", "text/html")
Parser.add(async request => await request.json(), "application/json")
Parser.add(async request => Object.fromEntries((await request.formData()).entries()), "multipart/form-data")
Parser.add(
	async request => Object.entries(new URLSearchParams(await request.text()).entries()),
	"application/x-www-urlencoded"
)

Serializer.add(async body => (typeof body == "string" ? body : body.toString()), "text/plain", "text/html")
Serializer.add(async body => JSON.stringify(body), "application/json")

export { Method, Parser, Serializer, Request, Response, fetch }
