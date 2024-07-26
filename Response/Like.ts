import { Socket } from "../Socket"
import { Header } from "./Header"

export interface Like<T = any | Promise<any>> {
	status?: number
	header?: Header
	body?: T
	socket?: Socket.Factory
}

export namespace Like {
	export function is<T = any | Promise<any>>(value: Like<T> | any): value is Like<T> {
		return (
			typeof value == "object" &&
			Object.keys(value).every(key => ["status", "header", "body", "socket"].some(property => property == key)) &&
			(value.status == undefined || typeof value.status == "number") &&
			(value.header == undefined || Header.is(value.header)) &&
			(value.socket == undefined || value.socket instanceof Socket.Factory) &&
			(value.status != undefined || value.header != undefined || value.body != undefined)
		)
	}
}
