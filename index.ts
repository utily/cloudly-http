import { Client } from "./Client"
import { Method } from "./Request/Method"
import * as Parser from "./Parser"
import * as Serializer from "./Serializer"
import { Request } from "./Request"
import { Response } from "./Response"
import { fetch } from "./fetch"
import * as Search from "./Search"

Parser.add(async request => await request.text(), "text/plain", "text/html")
Parser.add(async request => await request.json(), "application/json")
Parser.add(async request => Object.fromEntries((await request.formData()).entries()), "multipart/form-data")
Parser.add(async request => Search.parse(await request.text()), "application/x-www-form-urlencoded")

Serializer.add(async body => (typeof body == "string" ? body : body.toString()), "text/plain", "text/html")
Serializer.add(async body => JSON.stringify(body), "application/json")
Serializer.add(async body => Search.stringify(body), "application/x-www-form-urlencoded")

export { Client, Method, Parser, Serializer, Request, Response, fetch, Search }
