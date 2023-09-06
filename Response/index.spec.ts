import "isomorphic-fetch"
import { Blob } from "fetch-blob"
import { File } from "fetch-blob/file"
import { FormData } from "formdata-polyfill/esm.min"
import WebSocket from "jest-websocket-mock"
import { http } from "../index"

globalThis.Blob = Blob
globalThis.File = File
globalThis.FormData = FormData
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
global.WebSocket = WebSocket

describe("Response", () => {
	const output = {
		status: 200,
		header: {},
		body: undefined,
	}
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
	it("create pdf", () => {
		expect(http.Response.create(pdf)).toEqual({
			...output,
			header: { contentType: "application/pdf" },
			body: pdf,
		})
		expect(http.Response.create(pdf.buffer)).toEqual({
			...output,
			header: { contentType: "application/pdf" },
			body: pdf.buffer,
		})
	})
	it("create html", () => {
		expect(http.Response.create(html)).toEqual({
			...output,
			header: { contentType: "text/html; charset=utf-8" },
			body: html,
		})
	})
	it("create jwt", () => {
		expect(http.Response.create(jwt)).toEqual({
			...output,
			header: { contentType: "application/jwt; charset=utf-8" },
			body: jwt,
		})
	})
	it("create object", () => {
		expect(http.Response.create(object)).toEqual({
			...output,
			header: { contentType: "application/json; charset=utf-8" },
			body: object,
		})
	})
	it("create array", () => {
		expect(http.Response.create(array)).toEqual({
			...output,
			header: { contentType: "application/json; charset=utf-8" },
			body: array,
		})
	})
	it("create cursor array", async () => {
		const body = http.Continuable.create(
			array.map(e => ({ string: e })),
			"cursor"
		)
		const response = await http.Response.from(await http.Response.to(http.Response.create(body)))
		expect(response.status).toEqual(output.status)
		expect(response.header).toEqual({ contentType: "application/json; charset=utf-8", link: ["cursor", 'rel="next"'] })
		expect(JSON.stringify(response.body)).toStrictEqual(JSON.stringify(body))
		expect(response.body.cursor).toStrictEqual(body.cursor)
	})
	it("create svg", () => {
		expect(http.Response.create(svg)).toEqual({
			...output,
			header: { contentType: "image/svg+xml" },
			body: svg,
		})
	})
	it("create object json", () => {
		expect(http.Response.create(object, "application/json; charset=utf-8")).toEqual({
			...output,
			header: { contentType: "application/json; charset=utf-8" },
			body: object,
		})
	})
	it("create object urlencoded", () => {
		expect(http.Response.create(object, "application/x-www-form-urlencoded")).toEqual({
			...output,
			header: { contentType: "application/x-www-form-urlencoded" },
			body: object,
		})
	})
	const error = {
		status: 400,
		type: "missing query argument",
		argument: {
			name: "argument",
			type: "string",
			description: "description of argument",
		},
	}
	it("create error json", () => {
		expect(http.Response.create(error)).toEqual({
			status: 400,
			header: { contentType: "application/json; charset=utf-8" },
			body: {
				status: 400,
				type: "missing query argument",
				argument: {
					name: "argument",
					type: "string",
					description: "description of argument",
				},
			},
		})
	})
	it("gracely authenticate", () => {
		expect(
			http.Response.create({
				status: 401,
				header: {
					wwwAuthenticate: "Basic realm=Administration",
				},
				type: "not authorized",
			})
		).toEqual({
			status: 401,
			header: {
				contentType: "application/json; charset=utf-8",
				wwwAuthenticate: "Basic realm=Administration",
			},
			body: {
				status: 401,
				type: "not authorized",
			},
		})
	})
})
