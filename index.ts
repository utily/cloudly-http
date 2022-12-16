import { Client } from "./Client"
import { fetch } from "./fetch"
import * as FormData from "./FormData"
import { Method } from "./Method"
import * as Parser from "./Parser"
import { Request } from "./Request"
import { Response } from "./Response"
import * as Search from "./Search"
import * as Serializer from "./Serializer"
import { Socket } from "./Socket"

Parser.add(async request => await request.text(), "text/plain", "text/html")
Parser.add(async request => await request.json(), "application/json")
Parser.add(async request => await FormData.to(await request.formData()), "multipart/form-data")
Parser.add(async request => Search.parse(await request.text()), "application/x-www-form-urlencoded")

Serializer.add(async body => (typeof body == "string" ? body : body.toString()), "text/plain", "text/html")
Serializer.add(async body => JSON.stringify(body), "application/json")
Serializer.add(async body => Search.stringify(body), "application/x-www-form-urlencoded")
Serializer.add(
	async body => (body instanceof globalThis.FormData ? body : await FormData.to(body)),
	"multipart/form-data"
)

export { Client, Method, Parser, Serializer, Request, Response, fetch, Search, Socket }
