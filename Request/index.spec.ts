import "isomorphic-fetch"
import { Blob } from "fetch-blob"
import { File } from "fetch-blob/file"
import { FormData } from "formdata-polyfill/esm.min"
import { http } from "../index"

globalThis.Blob = Blob
globalThis.File = File
globalThis.FormData = FormData
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
		expect(http.Request.create("http://example.com/collection/resource")).toMatchObject(output)
	})
	it("create url", () => {
		expect(http.Request.create({ url: "http://example.com/collection/resource" })).toMatchObject(output)
	})
	it("create method url", () => {
		expect(http.Request.create({ method: "post", url: "http://example.com/collection/resource" })).toMatchObject({
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
		).toMatchObject({
			...output,
			method: "POST",
			header: { contentType: "application/json; charset=utf-8" },
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
	it("contentType on body-less method", async () => {
		const request: Request = new Request(new URL("http://example.com/collection/resource?key=value"), {
			method: "GET",
			headers: { "Content-Type": "application/json" },
		})
		expect((await http.Request.from(request)).url).toEqual(new URL("http://example.com/collection/resource?key=value"))
	})
})
