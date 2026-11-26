import { Request } from "../index"

describe("Request", () => {
	const output = {
		method: "GET",
		url: new URL("http://example.com/collection/resource"),
		parameter: {},
		search: {},
		header: {},
		remote: undefined,
		body: undefined
	}
	it.each([
		{ name: "url string", input: "http://example.com/collection/resource", expected: output },
		{ name: "url", input: { url: "http://example.com/collection/resource" }, expected: output },
		{
			name: "method url",
			input: { method: "post", url: "http://example.com/collection/resource" },
			expected: { ...output, method: "POST" }
		},
		{
			name: "method url body",
			input: { method: "post", url: "http://example.com/collection/resource", body: { property: "value" } },
			expected: { ...output, method: "POST", body: { property: "value" } }
		}
	])("create $name", ({ input, expected }) => expect(Request.create(input)).toEqual(expected))
	it("creates search from the URL without retaining overridden values", () => {
		expect(
			Request.create({
				url: "http://example.com/collection/resource?from=url&shared=url",
				parameter: { id: "resource" },
				search: { fromRequest: "request", shared: "request" },
				remote: "127.0.0.1",
				header: { authorization: "Bearer token" }
			})
		).toEqual({
			...output,
			url: new URL("http://example.com/collection/resource?from=url&shared=url"),
			parameter: { id: "resource" },
			search: { fromRequest: "request", from: "url", shared: "url" },
			remote: "127.0.0.1",
			header: { authorization: "Bearer token" }
		})
	})
	it("is", () => {
		expect(Request.is(output)).toEqual(true)
		const request = Request.create({
			method: "POST",
			url: new URL("http://example.com/collection/resource?key=value"),
			header: { contentType: "application/json; charset=utf-8" },
			body: { resource: "resource", name: "Resource" }
		})
		expect(request).toEqual({ ...request, search: { key: "value" } })
		expect(Request.is(request)).toEqual(true)
	})
	it.each([
		{ name: "primitive", request: "request" },
		{ name: "unknown property", request: { ...output, extra: true } },
		{ name: "method", request: { ...output, method: "INVALID" } },
		{ name: "url", request: { ...output, url: "http://example.com" } },
		{ name: "parameter", request: { ...output, parameter: { id: 1 } } },
		{ name: "search", request: { ...output, search: { page: 1 } } },
		{ name: "remote", request: { ...output, remote: 1 } },
		{ name: "header", request: { ...output, header: { accept: "application/json" } } }
	])("is false for invalid $name", ({ request }) => expect(Request.is(request)).toBe(false))
	it("from", async () => {
		const source = new globalThis.Request("http://example.com/resource?first=one&second=two", {
			method: "PUT",
			headers: { "Content-Type": "application/json", "X-Correlation-ID": "correlation" },
			body: JSON.stringify({ value: 1 })
		})
		Object.defineProperty(source, "cf", { value: { country: "SE" } })

		const request = Request.from(source)
		expect(request).toMatchObject({
			method: "PUT",
			url: new URL(source.url),
			parameter: {},
			search: { first: "one", second: "two" },
			header: { contentType: "application/json", xCorrelationID: "correlation" },
			cloudflare: { country: "SE" }
		})
		await expect(request.body).resolves.toEqual({ value: 1 })
	})
	it("from defaults unsupported methods to GET", () => {
		const source = {
			method: "INVALID",
			url: "http://example.com/resource",
			headers: new Headers(),
			text: async () => ""
		} as globalThis.Request

		expect(Request.from(source)).toMatchObject({ method: "GET", parameter: {}, search: {}, header: {} })
	})
	it("to omits a body for safe methods without serializing it", async () => {
		const body = {
			then: () => {
				throw new Error("body should not be read")
			}
		}
		await expect(
			Request.to({ method: "HEAD", url: output.url, header: { contentType: "application/json" }, body })
		).resolves.toMatchObject({ body: undefined })
	})
	it.each([
		{
			name: "json",
			request: Request.create({
				method: "POST",
				url: new URL("http://example.com/collection/resource?key=value"),
				header: { contentType: "application/json; charset=utf-8" },
				body: Promise.resolve({ resource: "resource", name: "Resource" })
			}),
			expectedHeaders: { "Content-Type": "application/json; charset=utf-8" },
			expectedBody: JSON.stringify({ resource: "resource", name: "Resource" })
		},
		{
			name: "multipart",
			request: Request.create({
				method: "POST",
				url: new URL("http://example.com/collection/resource?key=value"),
				header: { contentType: "multipart/form-data; boundary = asdasdasdasd", authorization: "placeholderValue" },
				body: new FormData()
			}),
			expectedHeaders: { Authorization: "placeholderValue" },
			expectedBody: expect.any(FormData)
		}
	])("to $name contentType", async ({ request, expectedHeaders, expectedBody }) => {
		const result = await Request.to(request)
		expect(result.headers).toEqual(expectedHeaders)
		expect(result.body).toEqual(expectedBody)
	})
})
