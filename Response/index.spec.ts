import * as http from "../index"

describe("Response", () => {
	const output = { status: 200, header: {}, body: undefined }
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
})
