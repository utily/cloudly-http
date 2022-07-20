import { Socket } from "../Socket"
import { Header } from "./Header"

export interface Like {
	status?: number
	header?: Header
	body?: any | Promise<any>
	socket?: Socket.Factory
}

export namespace Like {
	export function is(value: Like | any): value is Like {
		return (
			typeof value == "object" &&
			Object.keys(value).every(key => ["status", "header", "body", "socket"].some(property => property == key)) &&
			(value.status == undefined || typeof value.status == "number") &&
			(value.header == undefined || Header.is(value.header)) &&
			(value.socket == undefined ||
				(typeof value.socket.close == "function" &&
					typeof value.socket.json?.send == "function" &&
					typeof value.socket.string?.send == "function" &&
					typeof value.socket.arrayBuffer?.send == "function")) &&
			(value.status != undefined || value.header != undefined || value.body != undefined)
		)
	}
}
