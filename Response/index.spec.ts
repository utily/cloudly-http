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
			body: Promise.resolve(object),
		})
	})
	it("create object json", () => {
		expect(http.Response.create(object, "application/json; charset=utf-8")).toEqual({
			...output,
			header: { contentType: "application/json; charset=utf-8" },
			body: Promise.resolve(object),
		})
	})
	it("create object urlencoded", () => {
		expect(http.Response.create(object, "application/x-www-form-urlencoded")).toEqual({
			...output,
			header: { contentType: "application/x-www-form-urlencoded" },
			body: object,
		})
	})
})
