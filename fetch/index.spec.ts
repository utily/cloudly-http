import * as http from "../index"

describe("fetch", () => {
	it.each([
		{
			name: "url",
			request: "https://example.com/resource?search=value",
			expected: { url: "https://example.com/resource?search=value", method: "GET", headers: {}, body: undefined }
		},
		{
			name: "request",
			request: {
				method: "POST",
				url: "https://example.com/resource",
				header: { contentType: "application/json; charset=utf-8", authorization: "placeholder" },
				body: Promise.resolve({ property: "value" })
			},
			expected: {
				url: "https://example.com/resource",
				method: "POST",
				headers: { "Content-Type": "application/json; charset=utf-8", Authorization: "placeholder" },
				body: '{"property":"value"}'
			}
		},
		{
			name: "head request body",
			request: {
				method: "HEAD",
				url: "https://example.com/resource",
				header: { contentType: "application/json" },
				body: { property: "value" }
			},
			expected: {
				url: "https://example.com/resource",
				method: "HEAD",
				headers: { "Content-Type": "application/json" },
				body: undefined
			}
		}
	])("$name", async ({ request, expected }) => {
		const platformFetch = vi.fn(
			async () =>
				new Response('{"created":true}', {
					status: 201,
					headers: { "Content-Type": "application/json; charset=utf-8", "X-Request-Id": "request-id" }
				})
		)

		const response = await http.fetch.create(platformFetch)(request)

		expect(platformFetch).toHaveBeenCalledOnce()
		expect(platformFetch).toHaveBeenCalledWith(expected.url, expected)
		expect(response.status).toEqual(201)
		expect(response.header).toEqual({ contentType: "application/json; charset=utf-8", xRequestId: "request-id" })
		await expect(response.body).resolves.toEqual({ created: true })
	})
	it("rejection", async () => {
		const error = new Error("request failed")
		const fetch = http.fetch.create(async () => {
			throw error
		})

		await expect(fetch("https://example.com/")).rejects.toBe(error)
	})
})
