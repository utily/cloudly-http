import { Blob } from "fetch-blob"
import { File } from "fetch-blob/file"
import { FormData as Form } from "formdata-polyfill/esm.min.js"
import { http } from "./index"

globalThis.FormData = Form
globalThis.Blob = Blob
globalThis.File = File

describe("cloudly-http", () => {
	const body = {
		a: 123,
		b: {
			c: new Blob([new TextEncoder().encode("The Power of Attraction.")], { type: "application/octet-stream" }),
			c1: "attraction",
		},
		d: new Blob([new TextEncoder().encode("The Power of Attraction.")], { type: "application/octet-stream" }),
	}
	const expected = {
		"": {
			a: 123,
			b: {
				c1: "attraction",
			},
		},
		"b.c": [
			84, 104, 101, 32, 80, 111, 119, 101, 114, 32, 111, 102, 32, 65, 116, 116, 114, 97, 99, 116, 105, 111, 110, 46,
		],
		d: [84, 104, 101, 32, 80, 111, 119, 101, 114, 32, 111, 102, 32, 65, 116, 116, 114, 97, 99, 116, 105, 111, 110, 46],
	}
	it("Request w/ contentType: multipart", async () => {
		const request = await http.Request.to({
			url: "http://localhost",
			method: "POST",
			body,
			header: { contentType: "multipart/form-data" },
		})
		expect(request.body instanceof FormData).toEqual(true)
		expect(await http.FormData.toObject(request.body as FormData)).toEqual(expected)
	})
	it("Request w/o contentType: multipart", async () => {
		const request = await http.Request.to({
			url: "http://localhost",
			method: "POST",
			body,
		})
		expect(request.body instanceof FormData).toEqual(true)
		expect(await http.FormData.toObject(request.body as FormData)).toEqual(expected)
	})
})
