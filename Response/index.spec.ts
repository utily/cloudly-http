import * as http from "../index"

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
