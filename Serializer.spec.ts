import { http } from "./index"

describe("Serializer", () => {
	it("send standard form data", async () => {
		const body = new FormData()
		const file = new Blob([JSON.stringify({ test: "testing", tester: "potato" }, null, 2)], { type: "application/pdf" })
		body.append("request", "value1")
		body.append("remittanceAdvice", file)
		const request = await http.Request.to({
			method: "POST",
			url: "http://localhost",
			header: { contentType: "multipart/form-data" },
			body,
		})
		expect(request.body).toEqual(body)
	})
	it("FormData.to w/o Blob", async () => {
		const body = { a: 123, b: "qwe", c: false, d: null, e: [123, 456], f: { g: 789 } }
		const request = await http.Request.to({
			method: "POST",
			url: "http://localhost",
			header: { contentType: "multipart/form-data" },
			body,
		})

		expect(request.body instanceof FormData).toBeTruthy()
	})
	it("FormData.to w/ Blob", async () => {
		const body = {
			a: 123,
			b: {
				c: new Blob([new TextEncoder().encode("The Power of Attraction.")], { type: "application/octet-stream" }),
				c1: "attraction",
			},
			d: new Blob([new TextEncoder().encode("The Power of Attraction.")], { type: "application/octet-stream" }),
		}
		const request = await http.Request.to(
			http.Request.create({
				method: "POST",
				url: "http://localhost",
				header: { contentType: "multipart/form-data" },
				body,
			})
		)
		expect(request.body instanceof FormData).toBeTruthy()
		expect(await http.FormData.toObject(request.body as FormData)).toEqual({
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
