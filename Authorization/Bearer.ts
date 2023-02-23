export interface Bearer {
	bearer: string
}
export namespace Bearer {
	export function is(value: any | Bearer): value is Bearer {
		return typeof value == "object" && value && typeof value.bearer == "string"
	}
	export function serialize(authorization: Bearer | any): string | undefined {
		return is(authorization) ? `Bearer ${authorization.bearer}` : undefined
	}
	export function parse(authorization: string | undefined): Bearer | undefined {
		return authorization && authorization.startsWith("Bearer ") ? { bearer: authorization.substring(7) } : undefined
	}
}
