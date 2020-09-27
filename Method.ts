export type Method = "GET" | "POST" | "DELETE" | "HEAD" | "PATCH" | "PUT" | "OPTIONS" | "TRACE" | "CONNECT"

export namespace Method {
	export function is(value: any | Method): value is Method {
		return (
			typeof value == "string" &&
			(value == "GET" ||
				value == "POST" ||
				value == "DELETE" ||
				value == "HEAD" ||
				value == "PATCH" ||
				value == "PUT" ||
				value == "OPTIONS" ||
				value == "TRACE" ||
				value == "CONNECT")
		)
	}
}
