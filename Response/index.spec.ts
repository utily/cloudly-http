import * as http from "../index"

describe("Response", () => {
	const html = "<!doctype><html></html>"
	const jwt =
		"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5ceyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
	const object = { property: "value" }
	const array = ["first", "second", "third"]
	const svg = `<?xml version="1.0" standalone="no"?>
	<svg width="5cm" height="4cm" version="1.1"
			 xmlns="http://www.w3.org/2000/svg">
		<desc>Four separate rectangles
		</desc>
			<rect x="0.5cm" y="0.5cm" width="2cm" height="1cm"/>
			<rect x="0.5cm" y="2cm" width="1cm" height="1.5cm"/>
			<rect x="3cm" y="0.5cm" width="1.5cm" height="2cm"/>
			<rect x="3.5cm" y="3cm" width="1cm" height="0.5cm"/>
		<!-- Show outline of viewport using 'rect' element -->
		<rect x=".01cm" y=".01cm" width="4.98cm" height="3.98cm"
					fill="none" stroke="blue" stroke-width=".02cm" />
	</svg>`
	const pdf = new Uint8Array([37, 80, 68, 70])
	const error = {
		status: 400,
		type: "missing query argument",
		argument: { name: "argument", type: "string", description: "description of argument" }
	}
	it("gracefully authenticate", () => {
		expect(
			http.Response.create({
				status: 401,
				header: { wwwAuthenticate: "Basic realm=Administration" },
				type: "not authorized"
			})
		).toEqual({
			status: 401,
			header: { contentType: "application/json; charset=utf-8", wwwAuthenticate: "Basic realm=Administration" },
			body: { status: 401, type: "not authorized" }
		})
	})
	it.each([
		{ name: "pdf", body: pdf, contentType: "application/pdf" },
		{ name: "pdf buffer", body: pdf.buffer, contentType: "application/pdf" },
		{ name: "html", body: html, contentType: "text/html; charset=utf-8" },
		{ name: "jwt", body: jwt, contentType: "application/jwt; charset=utf-8" },
		{ name: "object", body: object, contentType: "application/json; charset=utf-8" },
		{ name: "array", body: array, contentType: "application/json; charset=utf-8" },
		{ name: "svg", body: svg, contentType: "image/svg+xml" },
		{
			name: "object json",
			body: object,
			contentType: "application/json; charset=utf-8",
			type: "application/json; charset=utf-8"
		},
		{
			name: "object urlencoded",
			body: object,
			contentType: "application/x-www-form-urlencoded",
			type: "application/x-www-form-urlencoded"
		},
		{ name: "error json", body: error, contentType: "application/json; charset=utf-8", status: 400 }
	])("create $name", ({ body, contentType, type, status }) =>
		expect(http.Response.create(body, type)).toEqual({ status: status ?? 200, header: { contentType }, body })
	)
	it.each([
		{
			name: "plain text",
			body: "hello",
			expected: { status: 200, header: { contentType: "text/plain; charset=utf-8" }, body: "hello" }
		},
		{
			name: "binary",
			body: new Uint8Array([1, 2, 3]),
			expected: { status: 200, header: { contentType: "application/octet-stream" }, body: new Uint8Array([1, 2, 3]) }
		},
		{
			name: "form data",
			body: new FormData(),
			expected: { status: 200, header: { contentType: "multipart/formdata" }, body: expect.any(FormData) }
		}
	])("create $name", ({ body, expected }) => expect(http.Response.create(body)).toEqual(expected))
	it.each([
		{
			name: "redirect location",
			input: { status: 301, location: "/next", body: undefined },
			expected: {
				status: 301,
				header: { location: "/next", contentType: "application/json; charset=utf-8" },
				body: { status: 301, location: "/next", body: undefined }
			}
		},
		{
			name: "explicit content type",
			input: { status: 201, header: { contentType: "text/custom" }, body: "created" },
			expected: { status: 201, header: { contentType: "text/custom" }, body: "created" }
		}
	])("create $name", ({ input, expected }) => expect(http.Response.create(input)).toEqual(expected))
	it("create from socket factory", () => {
		const socket = new http.Socket.Factory({} as WebSocket)
		expect(http.Response.create(socket, { connection: "Upgrade" })).toEqual({
			status: 101,
			header: { connection: "Upgrade" },
			socket
		})
	})
	it.each([
		{ name: "valid", value: { status: 204, header: {} }, expected: true },
		{ name: "body only", value: { header: {}, body: "value" }, expected: true },
		{ name: "unknown property", value: { status: 200, header: {}, unknown: true }, expected: false },
		{ name: "invalid status", value: { status: "200", header: {} }, expected: false },
		{ name: "invalid header", value: { status: 200, header: { allow: "GET" } }, expected: false },
		{ name: "invalid socket", value: { status: 101, header: {}, socket: {} }, expected: false }
	])("is $name", ({ value, expected }) => expect(http.Response.is(value)).toBe(expected))
	it.each([
		{ value: { body: "value" }, expected: true },
		{
			value: {
				status: 101,
				socket: { close() {}, json: { send() {} }, string: { send() {} }, arrayBuffer: { send() {} } }
			},
			expected: true
		},
		{ value: {}, expected: false },
		{ value: { body: "value", unknown: true }, expected: false },
		{ value: { header: { allow: "GET" } }, expected: false },
		{ value: { body: "value", socket: {} }, expected: false }
	])("like $expected", ({ value, expected }) => expect(http.Response.Like.is(value)).toBe(expected))
	it("to", async () => {
		const response = await http.Response.to({
			status: 202,
			header: { contentType: "application/json; charset=utf-8", xRequestId: "request-id" },
			body: Promise.resolve({ accepted: true })
		})

		expect(response.status).toBe(202)
		expect(Object.fromEntries(response.headers)).toEqual({
			"content-type": "application/json; charset=utf-8",
			"x-request-id": "request-id"
		})
		expect(await response.json()).toEqual({ accepted: true })
	})
	it("to multipart", async () => {
		const response = await http.Response.to({
			status: 200,
			header: { contentType: "multipart/formdata", xRequestId: "request-id" },
			body: new FormData()
		})

		expect(response.headers.get("Content-Type")).toMatch(/^multipart\/form-data; boundary=/)
		expect(response.headers.get("X-Request-ID")).toBe("request-id")
	})
	it("to with socket response", async () => {
		const socket = new http.Socket.Factory({ close() {}, send() {}, addEventListener() {} } as WebSocket)
		const response = await http.Response.to({
			status: 200,
			header: { connection: "Upgrade" },
			body: { accepted: true },
			socket
		})
		expect(response.status).toBe(200)
		expect(response.headers.get("Connection")).toBe("Upgrade")
	})
	it.each([
		{
			name: "body",
			input: new globalThis.Response('{"ok":true}', {
				status: 201,
				headers: { "Content-Type": "application/json", Allow: "GET, POST" }
			}),
			expected: { status: 201, header: { contentType: "application/json", allow: ["GET", "POST"] } }
		},
		{
			name: "switching protocols",
			input: { status: 101, headers: new Headers({ Connection: "Upgrade" }) },
			expected: { status: 101, header: { connection: "Upgrade" }, body: undefined }
		}
	])("from $name", async ({ input, expected }) => {
		const response = http.Response.from(input as globalThis.Response)
		expect(response).toMatchObject(expected)
		if (response.status != 101) expect(await response.body).toEqual({ ok: true })
	})
	it("from with websocket", () => {
		const result = http.Response.from({
			status: 101,
			headers: new Headers({ Connection: "Upgrade" }),
			webSocket: {} as WebSocket
		} as globalThis.Response & { webSocket: WebSocket })
		expect(result.socket).toBeInstanceOf(http.Socket.Factory)
	})
	it("create from object with websocket", () => {
		const result = http.Response.create({ webSocket: {} as WebSocket, value: "payload" })
		expect(result.socket).toBeInstanceOf(http.Socket.Factory)
		expect(result.body).toEqual({ webSocket: {}, value: "payload" })
	})
	it("create from object with socket and unknown property", () => {
		const socket = new http.Socket.Factory({ close() {}, send() {}, addEventListener() {} } as WebSocket)
		const result = http.Response.create({ status: 202, socket, value: "payload" })
		expect(result.socket).toBe(socket)
	})
	it("create with numeric body", () =>
		expect(http.Response.create(123)).toEqual({
			status: 200,
			header: { contentType: "application/json; charset=utf-8" },
			body: 123
		}))
	it("create with header object as second argument", () =>
		expect(http.Response.create({ value: true }, { contentType: "text/custom" })).toEqual({
			status: 200,
			header: { contentType: "text/custom" },
			body: { value: true }
		}))
})
