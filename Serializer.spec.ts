import { Blob } from "fetch-blob"
import { File } from "fetch-blob/file"
import { FormData as Form } from "formdata-polyfill/esm.min.js"
import { http } from "./index"

globalThis.FormData = Form
globalThis.Blob = Blob
globalThis.File = File
describe("serializer", () => {
	it("send standard form data", async () => {
		const body = new FormData()
		const file = new Blob([JSON.stringify({ test: "testing", tester: "potato" }, null, 2)], { type: "application/pdf" })
		body.append("request", "value1")
		body.append("remittanceAdvice", file)
		const result = await http.Serializer.serialize(
			http.Request.create({ url: "http://localhost", header: { contentType: "multipart/form-data" }, body })
		)
		expect(result).toEqual(body)
	})
	it("FormData.to", async () => {
		const body = { a: 123, b: "qwe", c: false, d: null, e: [123, 456], f: { g: 789 } }
		const result = await http.Serializer.serialize(
			http.Request.create({ url: "http://localhost", header: { contentType: "multipart/form-data" }, body })
		)
		expect(result instanceof FormData).toBeTruthy()
	})
	it("FormData.to", async () => {
		const body = {
			a: 123,
			b: {
				c: new Blob([new TextEncoder().encode("The Power of Attraction.")], { type: "application/octet-stream" }),
				c1: "attraction",
			},
			d: new Blob([new TextEncoder().encode("The Power of Attraction.")], { type: "application/octet-stream" }),
		}
		const serialized = await http.Serializer.serialize(
			http.Request.create({ url: "http://localhost", header: { contentType: "multipart/form-data" }, body })
		)
		const result = Object.fromEntries((serialized.body as FormData).entries())
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
})
