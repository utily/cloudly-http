export interface Header {
	accessControlAllowOrigin?: string
	accessControlAllowCredentials?: string
	accessControlExposeHeaders?: string[]
	accessControlMaxAge?: string
	accessControlAllowMethods?: string[]
	accessControlAllowHeaders?: string[]
	acceptPatch?: string
	acceptRanges?: string
	age?: string
	allow?: string[]
	altSvc?: string
	cacheControl?: string
	cfConnectionIp?: string,
	cfIpCountry?: string,
	connection?: string
	contentDisposition?: string
	contentEncoding?: string
	contentLanguage?: string[]
	contentLength?: string
	contentLocation?: string
	contentMD5?: string
	contentRange?: string
	contentSecurityPolicy?: string
	contentType?: string
	date?: string
	deltaBase?: string
	eTag?: string
	expires?: string
	iM?: string
	lastModified?: string
	link?: string
	location?: string
	p3P?: string
	pragma?: string
	proxyAuthenticate?: string
	publicKeyPins?: string
	refresh?: string
	retryAfter?: string
	server?: string
	setCookie?: string
	status?: string
	strictTransportSecurity?: string
	timingAllowOrigin?: string[]
	trailer?: string
	transferEncoding?: string
	tk?: string
	upgrade?: string[]
	vary?: string[]
	via?: string
	warning?: string
	wwwAuthenticate?: string
	xContentSecurityPolicy?: string
	xFrameOptions?: string
	xWebkitCsp?: string
	xContentDuration?: string
	xContentTypeOptions?: string
	xCorrelationId?: string
	xMsContinuation?: string
	xPoweredBy?: string
	xRequestId?: string
	xUACompatible?: string
	xXssProtection?: string
}
const fields: [keyof Header, string, number][] = [
	["accessControlAllowOrigin", "Access-Control-Allow-Origin", 1],
	["accessControlAllowCredentials", "Access-Control-Allow-Credentials", 1],
	["accessControlExposeHeaders", "Access-Control-Expose-Headers", 2],
	["accessControlMaxAge", "Access-Control-Max-Age", 1],
	["accessControlAllowMethods", "Access-Control-Allow-Methods", 2],
	["accessControlAllowHeaders", "Access-Control-Allow-Headers", 2],
	["acceptPatch", "Accept-Patch", 1],
	["acceptRanges", "Accept-Ranges", 1],
	["age", "Age", 1],
	["allow", "Allow", 2],
	["altSvc", "Alt-Svc", 1],
	["cacheControl", "Cache-Control", 1],
	["cfConnectionIp", "CF-Connecting-IP", 1],
	["cfIpCountry", "CF-IPCountry", 1],
	["connection", "Connection", 1],
	["contentDisposition", "Content-Disposition", 1],
	["contentEncoding", "Content-Encoding", 1],
	["contentLanguage", "Content-Language", 2],
	["contentLength", "Content-Length", 1],
	["contentLocation", "Content-Location", 1],
	["contentMD5", "Content-MD5", 1],
	["contentRange", "Content-Range", 1],
	["contentSecurityPolicy", "Content-Security-Policy", 1],
	["contentType", "Content-Type", 1],
	["date", "Date", 1],
	["deltaBase", "Delta-Base", 1],
	["eTag", "ETag", 1],
	["expires", "Expires", 1],
	["iM", "IM", 1],
	["lastModified", "Last-Modified", 1],
	["link", "Link", 1],
	["location", "Location", 1],
	["p3P", "P3P", 1],
	["pragma", "Pragma", 1],
	["proxyAuthenticate", "Proxy-Authenticate", 1],
	["publicKeyPins", "Public-Key-Pins", 1],
	["refresh", "Refresh", 1],
	["retryAfter", "Retry-After", 1],
	["server", "Server", 1],
	["setCookie", "Set-Cookie", 1],
	["status", "Status", 1],
	["strictTransportSecurity", "Strict-Transport-Security", 1],
	["timingAllowOrigin", "Timing-Allow-Origin", 2],
	["trailer", "Trailer", 1],
	["transferEncoding", "Transfer-Encoding", 1],
	["tk", "Tk", 1],
	["upgrade", "Upgrade", 2],
	["vary", "Vary", 2],
	["via", "Via", 1],
	["warning", "Warning", 1],
	["wwwAuthenticate", "WWW-Authenticate", 1],
	["xContentDuration", "X-Content-Duration", 1],
	["xContentSecurityPolicy", "X-Content-Security-Policy", 1],
	["xContentTypeOptions", "X-Content-Type-Options", 1],
	["xCorrelationId", "X-Correlation-ID", 1],
	["xFrameOptions", "X-Frame-Options", 1],
	["xMsContinuation", "X-Ms-Continuation", 1],
	["xPoweredBy", "X-Powered-By", 1],
	["xRequestId", "X-Request-ID", 1],
	["xUACompatible", "X-UA-Compatible", 1],
	["xWebkitCsp", "X-WebKit-CSP", 1],
	["xXssProtection", "X-XSS-Protection", 1],
]
export namespace Header {
	export function is(value: any | Header): value is Header {
		function isString(value: any | string): value is string {
			return value == undefined || typeof value == "string"
		}
		function isStringArray(value: any | string[]): value is string[] {
			return value == undefined || (Array.isArray(value) && value.every(v => typeof v == "string"))
		}
		return typeof value == "object" && fields.every(field => (field[2] == 1 ? isString : isStringArray)(value[field[0]]))
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
		? getEntries(headers)
		: Object.entries(headers)
		const data: { [field: string]: string } = Object.fromEntries(entries.map(([field, value]) => [field.toLowerCase(), value]))
		return Object.fromEntries(
			fields.map(field => [field[0], data[field[1].toLowerCase()], field[2]]).filter(field => field[1]).map(field => [
					field[0],
					field[2] == 1 || typeof field[1] != "string" ? field[1] : field[1].split(",").map(v => v.trim())
				]
			)
		)
	}
	function isHeaders(value: globalThis.Headers | any): value is globalThis.Headers {
		return typeof value.forEach == "function"
	}
	function getEntries(headers: globalThis.Headers): [string, string][] {
		const result: [string, string][] = []
		headers.forEach((value, key) => result.push([key, value]))
		return result
	}
}
