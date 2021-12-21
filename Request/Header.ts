export interface Header {
	readonly aIM?: string
	readonly accept?: string[]
	readonly acceptCharset?: string[]
	readonly acceptDatetime?: string
	readonly acceptEncoding?: string[]
	readonly acceptLanguage?: string[]
	readonly accessControlRequestMethod?: string
	readonly accessControlRequestHeaders?: string
	readonly authorization?: string
	readonly cacheControl?: string
	readonly cfConnectionIp?: string
	readonly cfIpCountry?: string
	readonly connection?: string
	readonly contentLength?: string
	readonly contentMD5?: string
	readonly contentType?: string
	readonly cookie?: string
	readonly date?: string
	readonly expect?: string
	readonly forwarded?: string
	readonly from?: string
	readonly host?: string
	readonly http2Settings?: string
	readonly ifMatch?: string[]
	readonly ifModifiedSince?: string
	readonly ifNoneMatch?: string[]
	readonly ifRange?: string
	readonly ifUnmodifiedSince?: string
	readonly maxForwards?: string
	readonly origin?: string
	readonly pragma?: string
	readonly proxyAuthorization?: string
	readonly range?: string
	readonly referer?: string
	readonly te?: string[]
	readonly trailer?: string
	readonly transferEncoding?: string
	readonly userAgent?: string
	readonly upgrade?: string[]
	readonly via?: string[]
	readonly warning?: string
	readonly upgradeInsecureRequests?: string
	readonly xRequestedWith?: string
	readonly dnt?: string
	readonly xForwardedFor?: string
	readonly xForwardedHost?: string
	readonly xForwardedProto?: string
	readonly xMsContinuation?: string
	readonly frontEndHttps?: string
	readonly xHttpMethodOverride?: string
	readonly xAttDeviceId?: string
	readonly xWapProfile?: string
	readonly proxyConnection?: string
	readonly xCsrfToken?: string
	readonly xCorrelationID?: string
	readonly xModNonce?: string
	readonly xModRetry?: string
	readonly saveData?: string
}
const fields: [keyof Header, string, number][] = [
	["aIM", "A-IM", 1],
	["accept", "Accept", 2],
	["acceptCharset", "Accept-Charset", 2],
	["acceptDatetime", "Accept-Datetime", 1],
	["acceptEncoding", "Accept-Encoding", 2],
	["acceptLanguage", "Accept-Language", 2],
	["accessControlRequestMethod", "Access-Control-Request-Method", 1],
	["accessControlRequestHeaders", "Access-Control-Request-Headers", 1],
	["authorization", "Authorization", 1],
	["cacheControl", "Cache-Control", 1],
	["cfConnectionIp", "CF-Connecting-IP", 1],
	["cfIpCountry", "CF-IPCountry", 1],
	["connection", "Connection", 1],
	["contentLength", "Content-Length", 1],
	["contentMD5", "Content-MD5", 1],
	["contentType", "Content-Type", 1],
	["cookie", "Cookie", 1],
	["date", "Date", 1],
	["expect", "Expect", 1],
	["forwarded", "Forwarded", 1],
	["from", "From", 1],
	["host", "Host", 1],
	["http2Settings", "HTTP2-Settings", 1],
	["ifMatch", "If-Match", 2],
	["ifModifiedSince", "If-Modified-Since", 1],
	["ifNoneMatch", "If-None-Match", 2],
	["ifRange", "If-Range", 1],
	["ifUnmodifiedSince", "If-Unmodified-Since", 1],
	["maxForwards", "Max-Forwards", 1],
	["origin", "Origin", 1],
	["pragma", "Pragma", 1],
	["proxyAuthorization", "Proxy-Authorization", 1],
	["range", "Range", 1],
	["referer", "Referer", 1],
	["te", "TE", 2],
	["trailer", "Trailer", 1],
	["transferEncoding", "Transfer-Encoding", 1],
	["userAgent", "User-Agent", 1],
	["upgrade", "Upgrade", 2],
	["via", "Via", 2],
	["warning", "Warning", 1],
	["upgradeInsecureRequests", "Upgrade-Insecure-Requests", 1],
	["xRequestedWith", "X-Requested-With", 1],
	["dnt", "DNT", 1],
	["xForwardedFor", "X-Forwarded-For", 1],
	["xForwardedHost", "X-Forwarded-Host", 1],
	["xForwardedProto", "X-Forwarded-Proto", 1],
	["xMsContinuation", "X-Ms-Continuation", 1],
	["frontEndHttps", "Front-End-Https", 1],
	["xHttpMethodOverride", "X-Http-Method-Override", 1],
	["xAttDeviceId", "X-ATT-DeviceId", 1],
	["xWapProfile", "X-Wap-Profile", 1],
	["proxyConnection", "Proxy-Connection", 1],
	["xCsrfToken", "X-Csrf-Token", 1],
	["xCorrelationID", "X-Correlation-ID", 1],
	["xModNonce", "x-mod-nonce", 1],
	["xModRetry", "x-mod-retry", 1],
	["saveData", "Save-Data", 1],
]
export namespace Header {
	export function is(value: any | Header): value is Header {
		function isString(value: any | string): value is string {
			return value == undefined || typeof value == "string"
		}
		function isStringArray(value: any | string[]): value is string[] {
			return value == undefined || (Array.isArray(value) && value.every(v => typeof v == "string"))
		}
		return (
			typeof value == "object" && fields.every(field => (field[2] == 1 ? isString : isStringArray)(value[field[0]]))
		)
	}
	export function to(header: Header): { [field: string]: string } {
		return Object.fromEntries(
			fields
				.map(([property, field, count]) => [field, header[property]])
				.filter(([field, value]) => value)
				.map(([field, value]) => [field, Array.isArray(value) ? value.join(", ") : value])
		)
	}
	export function from(headers: globalThis.HeadersInit): Header {
		const entries = Array.isArray(headers)
			? headers.map<[string, string]>(([field, ...value]) => [field, value.join(", ")])
			: isHeaders(headers)
			? [...headers]
			: Object.entries(headers)
		const data: { [field: string]: string } = Object.fromEntries(
			entries.map(([field, value]) => [field.toLowerCase(), value])
		)
		return Object.fromEntries(
			fields
				.map(field => [field[0], data[field[1].toLowerCase()], field[2]])
				.filter(field => field[1])
				.map(field => [
					field[0],
					field[2] == 1 || typeof field[1] != "string" ? field[1] : field[1].split(",").map(v => v.trim()),
				])
		)
	}
	function isHeaders(value: globalThis.Headers | any): value is globalThis.Headers {
		return typeof value.entries == "function"
	}
}
