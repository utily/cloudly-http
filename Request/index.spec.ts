import "isomorphic-fetch"
import { FormData as Form } from "formdata-polyfill/esm.min.js"
import { http } from "../index"

globalThis.FormData = Form
describe("Request", () => {
	const output = {
		method: "GET",
		url: new URL("http://example.com/collection/resource"),
		parameter: {},
		search: {},
		header: {},
		remote: undefined,
		body: undefined,
	}
	it("create url string", () => {
		expect(http.Request.create("http://example.com/collection/resource")).toEqual(output)
	})
	it("create url", () => {
		expect(http.Request.create({ url: "http://example.com/collection/resource" })).toEqual(output)
	})
	it("create method url", () => {
		expect(http.Request.create({ method: "post", url: "http://example.com/collection/resource" })).toEqual({
			...output,
			method: "POST",
		})
	})
	it("create method url object", () => {
		expect(
			http.Request.create({
				method: "post",
				url: "http://example.com/collection/resource",
				body: { property: "value" },
			})
		).toEqual({
			...output,
			method: "POST",
			body: { property: "value" },
		})
	})
	it("is", () => {
		expect(http.Request.is(output)).toEqual(true)
		const request = http.Request.create({
			method: "POST",
			url: new URL("http://example.com/collection/resource?key=value"),
			header: { contentType: "application/json; charset=utf-8" },
			body: { resource: "resource", name: "Resource" },
		})
		expect(request).toEqual({ ...request, search: { key: "value" } })
		expect(http.Request.is(request)).toEqual(true)
	})
	it("to contentType", async () => {
		const json: http.Request = http.Request.create({
			method: "POST",
			url: new URL("http://example.com/collection/resource?key=value"),
			header: { contentType: "application/json; charset=utf-8" },
			body: { resource: "resource", name: "Resource" },
		})
		expect((await http.Request.to(json)).headers).toEqual({ "Content-Type": "application/json; charset=utf-8" })
		const formData = http.Request.create({
			method: "POST",
			url: new URL("http://example.com/collection/resource?key=value"),
			header: {
				contentType: "multipart/form-data; boundary = asdasdasdasd",
				authorization: "placeholderValue",
			},
			body: new FormData(),
		})
		expect((await http.Request.to(formData)).headers).toEqual({ Authorization: "placeholderValue" })
	})
})
