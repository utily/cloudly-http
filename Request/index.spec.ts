import { http } from "../index"

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
	])("create $name", ({ input, expected }) => expect(http.Request.create(input)).toEqual(expected))
	it("is", () => {
		expect(http.Request.is(output)).toEqual(true)
		const request = http.Request.create({
			method: "POST",
			url: new URL("http://example.com/collection/resource?key=value"),
			header: { contentType: "application/json; charset=utf-8" },
			body: { resource: "resource", name: "Resource" }
		})
		expect(request).toEqual({ ...request, search: { key: "value" } })
		expect(http.Request.is(request)).toEqual(true)
	})
	it.each([
		{
			name: "json",
			request: http.Request.create({
				method: "POST",
				url: new URL("http://example.com/collection/resource?key=value"),
				header: { contentType: "application/json; charset=utf-8" },
				body: { resource: "resource", name: "Resource" }
			}),
			expected: { "Content-Type": "application/json; charset=utf-8" }
		},
		{
			name: "multipart",
			request: http.Request.create({
				method: "POST",
				url: new URL("http://example.com/collection/resource?key=value"),
				header: { contentType: "multipart/form-data; boundary = asdasdasdasd", authorization: "placeholderValue" },
				body: new FormData()
			}),
			expected: { Authorization: "placeholderValue" }
		}
	])("to $name contentType", async ({ request, expected }) =>
		expect((await http.Request.to(request)).headers).toEqual(expected)
	)
})
