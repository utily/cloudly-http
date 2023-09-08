import { Blob } from "fetch-blob"
import { File } from "fetch-blob/file"
import { FormData as Form } from "formdata-polyfill/esm.min.js"
import { http } from "./index"

globalThis.Blob = Blob
globalThis.File = File
globalThis.FormData = Form
describe("http.Middleware", () => {
	it("server object", async () => {
		expect(
			await http.Middleware.create("server")(
				await http.Request.from(
					new Request("http://example.com/collection/resource", {
						method: "PUT",
						headers: { "Content-Type": "application/json; charset=utf-8" },
						body: JSON.stringify({ value: 42, test: { value: "The Power of Attraction." } }),
					}),
					"none"
				),
				async request => {
					expect(request).toMatchObject({
						body: {
							test: {
								value: "The Power of Attraction.",
							},
							value: 42,
						},
						header: {
							contentType: "application/json; charset=utf-8",
						},
						method: "PUT",
						parameter: {},
						search: {},
						url: new URL("http://example.com/collection/resource"),
					})
					return http.Response.create({ status: 200, body: { id: "42", test: { value: 1337 } } })
				}
			)
		).toEqual({
			body: '{"id":"42","test":{"value":1337}}',
			header: {
				contentType: "application/json; charset=utf-8",
			},
			status: 200,
		})
	})
	it("server text", async () => {
		expect(
			await http.Middleware.create("server")(
				await http.Request.from(
					new Request("http://example.com/collection/resource", {
						method: "PUT",
						headers: { "Content-Type": "text/plain; charset=utf-8" },
						body: "The Power of Attraction.",
					}),
					"none"
				),
				async request => {
					expect(request).toMatchObject({
						body: "The Power of Attraction.",
						header: {
							contentType: "text/plain; charset=utf-8",
						},
						method: "PUT",
						parameter: {},
						search: {},
						url: new URL("http://example.com/collection/resource"),
					})
					return http.Response.create("id: 42")
				}
			)
		).toEqual({
			body: "id: 42",
			header: {
				contentType: "text/plain; charset=utf-8",
			},
			status: 200,
		})
	})
})
