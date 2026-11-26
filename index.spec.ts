import { http } from "./index"

describe("cloudly-http", () => {
	it.each([
		["get", "GET"],
		["options", "OPTIONS"],
		["trace", "TRACE"],
		["connect", "CONNECT"],
		["unknown", undefined]
	])("Method.parse %s", (value, expected) => {
		expect(http.Method.parse(value)).toBe(expected)
	})
	const body = {
		a: 123,
		b: {
			c: new Blob([new TextEncoder().encode("The Power of Attraction.")], { type: "application/octet-stream" }),
			c1: "attraction"
		},
		d: new Blob([new TextEncoder().encode("The Power of Attraction.")], { type: "application/octet-stream" })
	}
	const expected = {
		"": { a: 123, b: { c1: "attraction" } },
		"b.c": [
			84, 104, 101, 32, 80, 111, 119, 101, 114, 32, 111, 102, 32, 65, 116, 116, 114, 97, 99, 116, 105, 111, 110, 46
		],
		d: [84, 104, 101, 32, 80, 111, 119, 101, 114, 32, 111, 102, 32, 65, 116, 116, 114, 97, 99, 116, 105, 111, 110, 46]
	}
	it("Request w/ contentType: multipart", async () => {
		const request = await http.Request.to({
			url: "http://localhost",
			method: "POST",
			body,
			header: { contentType: "multipart/form-data" }
		})
		expect(request.body instanceof FormData).toEqual(true)
		expect(await http.FormData.toObject(request.body as FormData)).toEqual(expected)
	})
	it("Request w/o contentType: multipart", async () => {
		const request = await http.Request.to({ url: "http://localhost", method: "POST", body })
		expect(request.body instanceof FormData).toEqual(true)
		expect(await http.FormData.toObject(request.body as FormData)).toEqual(expected)
	})
	it.each([
		{ contentType: "text/plain", body: "plain text" },
		{ contentType: "text/html", body: "<p>hello</p>" },
		{ contentType: "application/jwt", body: "header.payload.signature" }
	])("text response round trip $contentType", async ({ contentType, body }) => {
		const serialized = await http.Response.to(http.Response.create(body, contentType))
		const parsed = await http.Response.from(serialized)
		expect(parsed.body).toEqual(body)
	})
	it("text serializer toString", async () => {
		const value = { toString: () => "custom text" }
		const serialized = await http.Response.to(http.Response.create(value, "text/plain"))
		expect(await serialized.text()).toEqual("custom text")
	})
	it("form response and request round trips", async () => {
		const request = await http.Request.to(
			http.Request.create({
				method: "POST",
				url: "http://localhost",
				header: { contentType: "application/x-www-form-urlencoded" },
				body: { value: "hello world", nested: { count: 2 } }
			})
		)
		expect(request.body).toEqual("value=hello%20world&nested[count]=2")
		const parsed = await http.Request.from(
			new globalThis.Request("http://localhost", {
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: "value=hello%20world&nested[count]=2"
			})
		)
		expect(parsed.body).toEqual({ value: "hello world", nested: { count: "2" } })
	})
	it("continuable response round trip", async () => {
		const continuable = http.Continuable.create([{ id: 1 }, { id: 2 }], "next-cursor")
		const serialized = await http.Response.to(
			http.Response.create({
				status: 200,
				header: { contentType: "application/json", accessControlAllowHeaders: ["authorization"] },
				body: continuable
			})
		)
		expect(serialized.headers.get("Link")).toEqual('next-cursor, rel="next"')
		expect(serialized.headers.get("Access-Control-Expose-Headers")).toEqual("link, authorization")

		const parsed = await http.Response.from(serialized)
		expect(Array.from(parsed.body)).toEqual([{ id: 1 }, { id: 2 }])
		expect(http.Continuable.hasCursor(parsed.body)).toEqual(true)
		expect(parsed.body.cursor).toEqual("next-cursor")
	})
	it.each([
		["single link", "cursor"],
		["wrong relation", 'cursor, rel="prev"']
	])("json response ignores %s", async (_, link) => {
		const response = new globalThis.Response('["first","second"]', {
			status: 200,
			headers: { "Content-Type": "application/json", Link: link }
		})
		const parsed = await http.Response.from(response)
		expect(Array.isArray(parsed.body)).toEqual(true)
		expect(http.Continuable.hasCursor(parsed.body)).toEqual(false)
	})
})
