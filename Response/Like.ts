import { Header } from "./Header"

export interface Like {
	status?: number
	header?: Header
	body?: any | Promise<any>
}

export namespace Like {
	export function is(value: Like | any): value is Like {
		return (
			typeof value == "object" &&
			(value.status == undefined || typeof value.status == "number") &&
			(value.header == undefined || Header.is(value.header)) &&
			(value.status || value.header || value.body)
		)
	}
}
