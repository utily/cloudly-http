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
	readonly frontEndHttps?: string
	readonly xHttpMethodOverride?: string
	readonly xAttDeviceId?: string
	readonly xWapProfile?: string
	readonly proxyConnection?: string
	readonly xCsrfToken?: string
	readonly xCorrelationID?: string
	readonly saveData?: string
}
class HeaderDefault implements Header {
	get aIM() {
		return this.get("A-IM")
	}
	get accept() {
		return this.getAll("Accept")
	}
	get acceptCharset() {
		return this.getAll("Accept-Charset")
	}
	get acceptDatetime() {
		return this.get("Accept-Datetime")
	}
	get acceptEncoding() {
		return this.getAll("Accept-Encoding")
	}
	get acceptLanguage() {
		return this.getAll("Accept-Language")
	}
	get accessControlRequestMethod() {
		return this.get("Access-Control-Request-Method")
	}
	get accessControlRequestHeaders() {
		return this.get("Access-Control-Request-Headers")
	}
	get authorization() {
		return this.get("Authorization")
	}
	get cacheControl() {
		return this.get("Cache-Control")
	}
	get connection() {
		return this.get("Connection")
	}
	get contentLength() {
		return this.get("Content-Length")
	}
	get contentMD5() {
		return this.get("Content-MD5")
	}
	get contentType() {
		return this.get("Content-Type")
	}
	get cookie() {
		return this.get("Cookie")
	}
	get date() {
		return this.get("Date")
	}
	get expect() {
		return this.get("Expect")
	}
	get forwarded() {
		return this.get("Forwarded")
	}
	get from() {
		return this.get("From")
	}
	get host() {
		return this.get("Host")
	}
	get http2Settings() {
		return this.get("HTTP2-Settings")
	}
	get ifMatch() {
		return this.getAll("If-Match")
	}
	get ifModifiedSince() {
		return this.get("If-Modified-Since")
	}
	get ifNoneMatch() {
		return this.getAll("If-None-Match")
	}
	get ifRange() {
		return this.get("If-Range")
	}
	get ifUnmodifiedSince() {
		return this.get("If-Unmodified-Since")
	}
	get maxForwards() {
		return this.get("Max-Forwards")
	}
	get origin() {
		return this.get("Origin")
	}
	get pragma() {
		return this.get("Pragma")
	}
	get proxyAuthorization() {
		return this.get("Proxy-Authorization")
	}
	get range() {
		return this.get("Range")
	}
	get referer() {
		return this.get("Referer")
	}
	get te() {
		return this.getAll("TE")
	}
	get trailer() {
		return this.get("Trailer")
	}
	get transferEncoding() {
		return this.get("Transfer-Encoding")
	}
	get userAgent() {
		return this.get("User-Agent")
	}
	get upgrade() {
		return this.getAll("Upgrade")
	}
	get via() {
		return this.getAll("Via")
	}
	get warning() {
		return this.get("Warning")
	}
	get upgradeInsecureRequests() {
		return this.get("Upgrade-Insecure-Requests")
	}
	get xRequestedWith() {
		return this.get("X-Requested-With")
	}
	get dnt() {
		return this.get("DNT")
	}
	get xForwardedFor() {
		return this.get("X-Forwarded-For")
	}
	get xForwardedHost() {
		return this.get("X-Forwarded-Host")
	}
	get xForwardedProto() {
		return this.get("X-Forwarded-Proto")
	}
	get frontEndHttps() {
		return this.get("Front-End-Https")
	}
	get xHttpMethodOverride() {
		return this.get("X-Http-Method-Override")
	}
	get xAttDeviceId() {
		return this.get("X-ATT-DeviceId")
	}
	get xWapProfile() {
		return this.get("X-Wap-Profile")
	}
	get proxyConnection() {
		return this.get("Proxy-Connection")
	}
	get xCsrfToken() {
		return this.get("X-Csrf-Token")
	}
	get xCorrelationID() {
		return this.get("X-Correlation-ID")
	}
	get saveData() {
		return this.get("Save-Data")
	}
	constructor(private readonly data: { [header: string]: string }) {}
	private getAll(field: string): undefined | string[] {
		const result = this.get(field)
		return (result && result.split(",").map(v => v.trim())) || undefined
	}
	private get(field: string): undefined | string {
		return this.data[field] || this.data[field.toLowerCase()]
	}
	protected toJSON(): Header {
		return this.data
	}
}
function isString(value: any | string): value is string {
	return value == undefined || typeof value == "string"
}
function isStringArray(value: any | string[]): value is string[] {
	return value == undefined || (Array.isArray(value) && value.every(v => typeof v == "string"))
}
export namespace Header {
	export function is(value: any | Header): value is Header {
		return (
			typeof value == "object" &&
			isString(value.aIM) &&
			isStringArray(value.accept) &&
			isStringArray(value.acceptCharset) &&
			isString(value.acceptDatetime) &&
			isStringArray(value.acceptEncoding) &&
			isStringArray(value.acceptLanguage) &&
			isString(value.accessControlRequestMethod) &&
			isString(value.accessControlRequestHeaders) &&
			isString(value.authorization) &&
			isString(value.cacheControl) &&
			isString(value.connection) &&
			isString(value.contentLength) &&
			isString(value.contentMD5) &&
			isString(value.contentType) &&
			isString(value.cookie) &&
			isString(value.date) &&
			isString(value.expect) &&
			isString(value.forwarded) &&
			isString(value.from) &&
			isString(value.host) &&
			isString(value.http2Settings) &&
			isStringArray(value.ifMatch) &&
			isString(value.ifModifiedSince) &&
			isStringArray(value.ifNoneMatch) &&
			isString(value.ifRange) &&
			isString(value.ifUnmodifiedSince) &&
			isString(value.maxForwards) &&
			isString(value.origin) &&
			isString(value.pragma) &&
			isString(value.proxyAuthorization) &&
			isString(value.range) &&
			isString(value.referer) &&
			isStringArray(value.te) &&
			isString(value.trailer) &&
			isString(value.transferEncoding) &&
			isString(value.userAgent) &&
			isStringArray(value.upgrade) &&
			isStringArray(value.via) &&
			isString(value.warning) &&
			isString(value.upgradeInsecureRequests) &&
			isString(value.xRequestedWith) &&
			isString(value.dnt) &&
			isString(value.xForwardedFor) &&
			isString(value.xForwardedHost) &&
			isString(value.xForwardedProto) &&
			isString(value.frontEndHttps) &&
			isString(value.xHttpMethodOverride) &&
			isString(value.xAttDeviceId) &&
			isString(value.xWapProfile) &&
			isString(value.proxyConnection) &&
			isString(value.xCsrfToken) &&
			isString(value.xCorrelationID) &&
			(value.saveData == undefined || typeof value.saveData == "string")
		)
	}
	export function from(data: { [field: string]: string }): Header {
		return new HeaderDefault(data)
	}
	function set(name: string, value: undefined | string | string[], result: { [field: string]: string }): void {
		if (value)
			result[name] = Array.isArray(value) ? value.join(", ") : value
	}
	export function to(header: Header): { [field: string]: string } {
		const result: { [field: string]: string } = {}
		set("A-IM", header.aIM, result)
		set("Accept", header.accept, result)
		set("Accept-Charset", header.acceptCharset, result)
		set("Accept-Datetime", header.acceptDatetime, result)
		set("Accept-Encoding", header.acceptEncoding, result)
		set("Accept-Language", header.acceptLanguage, result)
		set("Access-Control-Request-Method", header.accessControlRequestMethod, result)
		set("Access-Control-Request-Headers", header.accessControlRequestHeaders, result)
		set("Authorization", header.authorization, result)
		set("Cache-Control", header.cacheControl, result)
		set("Connection", header.connection, result)
		set("Content-Length", header.contentLength, result)
		set("Content-MD5", header.contentMD5, result)
		set("Content-Type", header.contentType, result)
		set("Cookie", header.cookie, result)
		set("Date", header.date, result)
		set("Expect", header.expect, result)
		set("Forwarded", header.forwarded, result)
		set("From", header.from, result)
		set("Host", header.host, result)
		set("HTTP2-Settings", header.http2Settings, result)
		set("If-Match", header.ifMatch, result)
		set("If-Modified-Since", header.ifModifiedSince, result)
		set("If-None-Match", header.ifNoneMatch, result)
		set("If-Range", header.ifRange, result)
		set("If-Unmodified-Since", header.ifUnmodifiedSince, result)
		set("Max-Forwards", header.maxForwards, result)
		set("Origin", header.origin, result)
		set("Pragma", header.pragma, result)
		set("Proxy-Authorization", header.proxyAuthorization, result)
		set("Range", header.range, result)
		set("Referer", header.referer, result)
		set("TE", header.te, result)
		set("Trailer", header.trailer, result)
		set("Transfer-Encoding", header.transferEncoding, result)
		set("User-Agent", header.userAgent, result)
		set("Upgrade", header.upgrade, result)
		set("Via", header.via, result)
		set("Warning", header.warning, result)
		set("Upgrade-Insecure-Requests", header.upgradeInsecureRequests, result)
		set("X-Requested-With", header.xRequestedWith, result)
		set("DNT", header.dnt, result)
		set("X-Forwarded-For", header.xForwardedFor, result)
		set("X-Forwarded-Host", header.xForwardedHost, result)
		set("X-Forwarded-Proto", header.xForwardedProto, result)
		set("Front-End-Https", header.frontEndHttps, result)
		set("X-Http-Method-Override", header.xHttpMethodOverride, result)
		set("X-ATT-DeviceId", header.xAttDeviceId, result)
		set("X-Wap-Profile", header.xWapProfile, result)
		set("Proxy-Connection", header.proxyConnection, result)
		set("X-Csrf-Token", header.xCsrfToken, result)
		set("X-Correlation-ID", header.xCorrelationID, result)
		set("Save-Data", header.saveData, result)
		return result
	}
}
