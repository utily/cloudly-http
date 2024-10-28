import { Basic as AuthorizationBasic } from "./Basic"
import { Bearer as AuthorizationBearer } from "./Bearer"

export type Authorization = Authorization.Basic | Authorization.Bearer | string

export namespace Authorization {
	export function is(value: any | Authorization): value is Authorization {
		return Basic.is(value) || Bearer.is(value)
	}
	export function serialize(authorization: Authorization | undefined): string | undefined {
		return Basic.serialize(authorization) ?? Bearer.serialize(authorization)
	}
	export function parse(authorization: string | undefined): Authorization | undefined {
		return Basic.parse(authorization) ?? Bearer.parse(authorization) ?? authorization
	}
	export function check(server: Authorization | undefined, client: Authorization | undefined): boolean {
		server = typeof server != "string" ? serialize(server) : server
		client = typeof client != "string" ? serialize(client) : client
		return typeof server == "string" && typeof client == "string" && server == client
	}
	export type Basic = AuthorizationBasic
	export const Basic = AuthorizationBasic
	export type Bearer = AuthorizationBearer
	export const Bearer = AuthorizationBearer
}
