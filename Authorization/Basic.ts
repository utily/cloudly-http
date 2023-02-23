export interface Basic {
	user: string
	password?: string
}
export namespace Basic {
	export function is(value: any | Basic): value is Basic {
		return (
			typeof value == "object" &&
			value &&
			typeof value.user == "string" &&
			(value.password == undefined || typeof value.password == "string")
		)
	}
	export function serialize(authorization: Basic | any): string | undefined {
		return is(authorization) ? `Basic ${btoa(`${authorization.user}:${authorization.password ?? ""}`)}` : undefined
	}
	export function parse(authorization: string | undefined): Basic | undefined {
		return authorization && authorization.startsWith("Basic ")
			? (([user, password]) => ({ user, password }))(atob(authorization.substring(6)).split(":"))
			: undefined
	}
}
