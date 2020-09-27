export interface Header {
	accessControlAllowOrigin?: string | string[] | number
	accessControlAllowCredentials?: string | string[] | number
	accessControlExposeHeaders?: string | string[] | number
	accessControlMaxAge?: string | string[] | number
	accessControlAllowMethods?: string | string[] | number
	accessControlAllowHeaders?: string | string[] | number
	acceptPatch?: string | string[] | number
	acceptRanges?: string | string[] | number
	age?: string | string[] | number
	allow?: string | string[] | number
	altSvc?: string | string[] | number
	cacheControl?: string | string[] | number
	connection?: string | string[] | number
	contentDisposition?: string | string[] | number
	contentEncoding?: string | string[] | number
	contentLanguage?: string | string[] | number
	contentLength?: string | string[] | number
	contentLocation?: string | string[] | number
	contentMD5?: string | string[] | number
	contentRange?: string | string[] | number
	contentType?: string | string[] | number
	date?: string | string[] | number
	deltaBase?: string | string[] | number
	eTag?: string
	expires?: string | string[] | number
	iM?: string | string[] | number
	lastModified?: string | string[] | number
	link?: string | string[] | number
	location?: string | string[] | number
	p3P?: string | string[] | number
	pragma?: string | string[] | number
	proxyAuthenticate?: string | string[] | number
	publicKeyPins?: string | string[] | number
	retryAfter?: string | string[] | number
	server?: string | string[] | number
	setCookie?: string | string[] | number
	strictTransportSecurity?: string | string[] | number
	trailer?: string | string[] | number
	transferEncoding?: string | string[] | number
	tk?: string | string[] | number
	upgrade?: string | string[] | number
	vary?: string | string[] | number
	via?: string | string[] | number
	warning?: string | string[] | number
	wwwAuthenticate?: string | string[] | number
	xFrameOptions?: string | string[] | number
	contentSecurityPolicy?: string | string[] | number
	xContentSecurityPolicy?: string | string[] | number
	xWebKitCSP?: string | string[] | number
	refresh?: string | string[] | number
	status?: string | string[] | number
	timingAllowOrigin?: string | string[] | number
	xContentDuration?: string | string[] | number
	xContentTypeOptions?: string | string[] | number
	xPoweredBy?: string | string[] | number
	xRequestID?: string | string[] | number
	xCorrelationID?: string | string[] | number
	xUACompatible?: string | string[] | number
	xXSSProtection?: string | string[] | number
}
export namespace Header {
	export const fields = Object.freeze({
		accessControlAllowOrigin: "Access-Control-Allow-Origin",
		accessControlAllowCredentials: "Access-Control-Allow-Credentials",
		accessControlExposeHeaders: "Access-Control-Expose-Headers",
		accessControlMaxAge: "Access-Control-Max-Age",
		accessControlAllowMethods: "Access-Control-Allow-Methods",
		accessControlAllowHeaders: "Access-Control-Allow-Headers",
		acceptPatch: "Accept-Patch",
		acceptRanges: "Accept-Ranges",
		age: "Age",
		allow: "Allow",
		altSvc: "Alt-Svc",
		cacheControl: "Cache-Control",
		connection: "Connection",
		contentDisposition: "Content-Disposition",
		contentEncoding: "Content-Encoding",
		contentLanguage: "Content-Language",
		contentLength: "Content-Length",
		contentLocation: "Content-Location",
		contentMD5: "Content-MD5",
		contentRange: "Content-Range",
		contentType: "Content-Type",
		date: "Date",
		deltaBase: "Delta-Base",
		etag: "ETag",
		expires: "Expires",
		im: "IM",
		lastModified: "Last-Modified",
		link: "Link",
		location: "Location",
		p3p: "P3P",
		pragma: "Pragma",
		proxyAuthenticate: "Proxy-Authenticate",
		publicKeyPins: "Public-Key-Pins",
		retryAfter: "Retry-After",
		server: "Server",
		setCookie: "Set-Cookie",
		strictTransportSecurity: "Strict-Transport-Security",
		trailer: "Trailer",
		transferEncoding: "Transfer-Encoding",
		tk: "Tk",
		upgrade: "Upgrade",
		vary: "Vary",
		via: "Via",
		warning: "Warning",
		wwwAuthenticate: "WWW-Authenticate",
		xFrameOptions: "X-Frame-Options",
		contentSecurityPolicy: "Content-Security-Policy",
		xContentSecurityPolicy: "X-Content-Security-Policy",
		xWebkitCsp: "X-WebKit-CSP",
		refresh: "Refresh",
		status: "Status",
		timingAllowOrigin: "Timing-Allow-Origin",
		xContentDuration: "X-Content-Duration",
		xContentTypeOptions: "X-Content-Type-Options",
		xPoweredBy: "X-Powered-By",
		xRequestId: "X-Request-ID",
		xCorrelationId: "X-Correlation-ID",
		xUaCompatible: "X-UA-Compatible",
		xXssProtection: "X-XSS-Protection",
	})
	export function to(header: Header): { [field: string]: string | number | string[] | undefined } {
		return Object.entries(header)
			.map<[string, string | number | string[] | undefined]>(h => [
				(fields as { [field: string]: string | undefined })[h[0]] || h[0],
				h[1],
			])
			.reduce<{ [field: string]: string | number | string[] | undefined }>((r, f) => {
				r[f[0]] = f[1]
				return r
			}, {})
	}
	export function from(data: { [field: string]: string | string[] }): Header {
		data = Object.entries(data)
			.map<[string, string | string[]]>(p => [p[0].toLowerCase(), p[1]])
			.reduce<{ [field: string]: string | string[] }>((r, p) => {
				r[p[0]] = p[1]
				return r
			}, {})
		return Object.entries(fields).reduce<Header & { [header: string]: string | string[] }>((r, h) => {
			const d = data[h[1].toLowerCase()]
			if (d && d.length > 0)
				r[h[0]] = Array.isArray(d) && d.length == 1 ? d[0] : d
			return r
		}, {})
	}
}
