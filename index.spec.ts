import { http, Parser, Serializer } from "./index"

describe("cloudly-http", () => {
	it.each([
		{ description: "text/plain", body: "Hello World", contentType: "text/plain", expected: "Hello World" },
		{ description: "text/html", body: "<h1>Hello</h1>", contentType: "text/html", expected: "<h1>Hello</h1>" },
		{
			description: "application/json",
			body: JSON.stringify({ key: "value" }),
			contentType: "application/json",
			expected: { key: "value" }
		},
		{ description: "application/pdf", body: new ArrayBuffer(10), contentType: "application/pdf", expected: 10 },
		{
			description: "application/x-www-form-urlencoded",
			body: "key=value&foo=bar",
			contentType: "application/x-www-form-urlencoded",
			expected: { key: "value", foo: "bar" }
		},
		{
			description: "multipart/form-data",
			body: (() => {
				const result = new FormData()
				result.append("message", "hello")
				return result
			})(),
			contentType: "multipart/form-data",
			expected: { message: "hello" }
		}
	])("Parser.parse $description", async ({ body, contentType, expected }) => {
		const result = await Parser.parse(
			contentType == "multipart/form-data"
				? ({ headers: new Headers({ "content-type": contentType }), formData: async () => body } as Response)
				: new Response(body, { headers: { "content-type": contentType } })
		)
		if (contentType == "application/pdf") expect(result?.byteLength).toBe(expected)
		else expect(result).toEqual(expected)
	})

	it.each([
		{ description: "text/plain string", value: "Hello", contentType: "text/plain", expected: "Hello" },
		{
			description: "text/plain toString",
			value: { toString: () => "custom string" },
			contentType: "text/plain",
			expected: "custom string"
		},
		{ description: "text/html", value: "content", contentType: "text/html", expected: "content" },
		{
			description: "application/json",
			value: { key: "value" },
			contentType: "application/json",
			expected: JSON.stringify({ key: "value" })
		},
		{ description: "application/pdf", value: new ArrayBuffer(10), contentType: "application/pdf", expected: undefined },
		{
			description: "application/x-www-form-urlencoded",
			value: { key: "value", foo: "bar" },
			contentType: "application/x-www-form-urlencoded",
			expected: "key=value&foo=bar"
		},
		{
			description: "multipart/form-data",
			value: { key: "value" },
			contentType: "multipart/form-data",
			expected: undefined
		}
	])("Serializer.serialize $description", async ({ value, contentType, expected }) => {
		const result = await Serializer.serialize(value, contentType)
		if (contentType == "application/pdf") expect(result).toBe(value)
		else if (contentType == "multipart/form-data") expect(result).toBeInstanceOf(FormData)
		else expect(result).toBe(expected)
	})

	it.each([
		{ description: "multipart", multipart: true },
		{ description: "without multipart", multipart: false }
	])("http.Request.to $description", async ({ multipart }) => {
		const data = {
			a: 123,
			b: {
				c: new Blob([new TextEncoder().encode("The Power of Attraction.")], { type: "application/octet-stream" }),
				c1: "attraction"
			},
			d: new Blob([new TextEncoder().encode("The Power of Attraction.")], { type: "application/octet-stream" })
		}
		const request = await http.Request.to(
			http.Request.create({
				url: "http://localhost",
				method: "POST",
				body: data,
				...(multipart ? { header: { contentType: "multipart/form-data" } } : {})
			})
		)
		const source = multipart ? Object.fromEntries((request.body as FormData).entries()) : request
		const result = Object.fromEntries(
			await Promise.all(
				Object.entries(source).map(async ([property, value]) => [
					property,
					!(value instanceof File)
						? value
						: value.type.startsWith("application/json")
							? JSON.parse(await value.text())
							: new Array(...new Uint8Array(await value.arrayBuffer()))
				])
			)
		)
		expect(result).toMatchObject(
			multipart
				? {
						"*": { a: 123, b: { c1: "attraction" } },
						"b.c": [
							84, 104, 101, 32, 80, 111, 119, 101, 114, 32, 111, 102, 32, 65, 116, 116, 114, 97, 99, 116, 105, 111, 110,
							46
						],
						d: [
							84, 104, 101, 32, 80, 111, 119, 101, 114, 32, 111, 102, 32, 65, 116, 116, 114, 97, 99, 116, 105, 111, 110,
							46
						]
					}
				: {
						body: { a: 123, b: { c: {}, c1: "attraction" }, d: {} },
						headers: {},
						method: "POST",
						url: "http://localhost/"
					}
		)
	})
})
