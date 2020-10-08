import { Header as ResponseHeader } from "./Header"
import { create as createResponse } from "./create"

export interface Response {
	status?: number
	header?: ResponseHeader
	body?: any | Promise<any>
}

export namespace Response {
	export function is(value: any | Response): value is Response {
		return (
			typeof value == "object" &&
			Object.keys(value).every(key => ["status", "header", "body"].some(k => k == key)) &&
			(value.status == undefined || typeof value.status == "number") &&
			(value.header == undefined || ResponseHeader.is(value.header))
		)
	}
	export const create = createResponse
	export type Header = ResponseHeader
	export namespace Header {
		export const to = ResponseHeader.to
		export const from = ResponseHeader.from
	}
}
