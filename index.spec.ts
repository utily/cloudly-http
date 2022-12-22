import { Blob } from "fetch-blob"
import { File } from "fetch-blob/file"
import { FormData as Form } from "formdata-polyfill/esm.min.js"
import { http } from "./index"
globalThis.FormData = Form
globalThis.Blob = Blob
globalThis.File = File
describe("cloudly-http", () => {
	it("Request multipart", async () => {
		const data = {
			a: 123,
			b: {
				c: new Blob([new TextEncoder().encode("The Power of Attraction.")], { type: "application/octet-stream" }),
				c1: "attraction",
			},
			d: new Blob([new TextEncoder().encode("The Power of Attraction.")], { type: "application/octet-stream" }),
		}
		const request = await http.Request.to(
			http.Request.create({
				url: "http://localhost",
				method: "POST",
				body: data,
				header: { contentType: "multipart/form-data" },
			})
		)
		const result = Object.fromEntries((request.body as FormData).entries())
		expect(
			Object.fromEntries(
				await Promise.all(
					Object.entries(result).map(async ([property, value]) => [
						property,
						!(value instanceof File)
							? value
							: value.type.startsWith("application/json")
							? JSON.parse(await value.text())
							: new Array(...new Uint8Array(await value.arrayBuffer())),
					])
				)
			)
		).toMatchObject({
			"": {
				a: 123,
				b: {
					c1: "attraction",
				},
			},
			"b.c": [
				84, 104, 101, 32, 80, 111, 119, 101, 114, 32, 111, 102, 32, 65, 116, 116, 114, 97, 99, 116, 105, 111, 110, 46,
			],
			d: [
				84, 104, 101, 32, 80, 111, 119, 101, 114, 32, 111, 102, 32, 65, 116, 116, 114, 97, 99, 116, 105, 111, 110, 46,
			],
		})
	})
	it("Request without multipart", async () => {
		const data = {
			a: 123,
			b: {
				c: new Blob([new TextEncoder().encode("The Power of Attraction.")], { type: "application/octet-stream" }),
				c1: "attraction",
			},
			d: new Blob([new TextEncoder().encode("The Power of Attraction.")], { type: "application/octet-stream" }),
		}
		const request = await http.Request.to(
			http.Request.create({
				url: "http://localhost",
				method: "POST",
				body: data,
			})
		)
		expect(
			Object.fromEntries(
				await Promise.all(
					Object.entries(request).map(async ([property, value]) => [
						property,
						!(value instanceof File)
							? value
							: value.type.startsWith("application/json")
							? JSON.parse(await value.text())
							: new Array(...new Uint8Array(await value.arrayBuffer())),
					])
				)
			)
		).toMatchObject({
			body: { a: 123, b: { c: {}, c1: "attraction" }, d: {} },
			headers: {},
			method: "POST",
			url: "http://localhost/",
		})
	})
})
