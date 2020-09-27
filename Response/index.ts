import { Header as ResponseHeader } from "./Header"
import { create as createResponse } from "./create"

export interface Response<T> {
	status?: number
	header?: ResponseHeader
	body?: T | Promise<T>
}

export namespace Response {
	export function is<T>(value: any | Response<T>): value is Response<T> {
		return (
			typeof value == "object" &&
			Object.keys(value).every(key => key == "status" || key == "header" || key == "body") &&
			(value.status == undefined || typeof value.status == "number") &&
			(value.header == undefined || typeof value.header == "object")
		)
	}
	export const create = createResponse
	export type Header = ResponseHeader
	export namespace Header {
		export const fields = ResponseHeader.fields
		export const to = ResponseHeader.to
		export const from = ResponseHeader.from
	}
}
