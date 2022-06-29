import { Header } from "./Header"

export interface Like {
	status?: number
	header?: Header
	body?: any | Promise<any>
	webSocket?: WebSocket
}

export namespace Like {
	export function is(value: Like | any): value is Like {
		return (
			typeof value == "object" &&
			Object.keys(value).every(key => ["status", "header", "body", "webSocket"].some(property => property == key)) &&
			(value.status == undefined || typeof value.status == "number") &&
			(value.header == undefined || Header.is(value.header)) &&
			(value.webSocket == undefined || value.webSocket instanceof WebSocket) &&
			(value.status != undefined || value.header != undefined || value.body != undefined)
		)
	}
}
