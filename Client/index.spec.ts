import { http } from "../index"

describe("http.Client", () => {
	it("initializes public properties and options", () => {
		const onError = async () => false
		const onUnauthorized = async () => false
		const authorization = { bearer: "api-key" }
		const process = http.Middleware.create("identity")
		const preprocess = async (request: http.Request) => request
		const getHeader = async (request: http.Request) => request.header
		const appendHeader = () => ({})
		const postprocess = async (response: http.Response) => response
		const globalFetch = async () => new Response(null, { status: 204 })
		const client = new http.Client("https://example.com", "key", {
			onError,
			onUnauthorized,
			authorization,
			process,
			preprocess,
			getHeader,
			appendHeader,
			postprocess,
			fetch: globalFetch
		})

		expect(client.url).toBe("https://example.com")
		expect(client.key).toBe("key")
		expect(client.onError).toBe(onError)
		expect(client.onUnauthorized).toBe(onUnauthorized)
		expect(client.authorization).toBe(authorization)
		expect(client.process).toBe(process)
		expect(client.preprocess).toBe(preprocess)
		expect(client.getHeader).toBe(getHeader)
		expect(client.appendHeader).toBe(appendHeader)
		expect(client.postprocess).toBe(postprocess)
	})
	it("uses constructor url and default GET options", async () => {
		const globalFetch = vi.fn(
			async (url: string, init: RequestInit) =>
				new Response(JSON.stringify({ url, method: init.method }), { headers: { "Content-Type": "application/json" } })
		)
		const client = new http.Client("https://example.com/api", undefined, { fetch: globalFetch })

		await expect(client.get<{ url: string; method: string }>("resource")).resolves.toMatchObject({
			url: "https://example.com/apiresource",
			method: "GET"
		})
		expect(globalFetch).toHaveBeenCalledWith(
			"https://example.com/apiresource",
			expect.objectContaining({ method: "GET" })
		)
	})
	it("supports custom request middleware and authorization", async () => {
		let middlewareRequest: http.Request | undefined
		const globalFetch = vi.fn(
			async (_url: string, init: RequestInit) =>
				new Response(JSON.stringify({ authorization: new Headers(init.headers).get("Authorization") }), {
					headers: { "Content-Type": "application/json" }
				})
		)
		const client = new http.Client("https://example.com", undefined, {
			authorization: { bearer: "secret" },
			process: async (request, next) => {
				middlewareRequest = request
				return next(request)
			},
			fetch: globalFetch
		})

		const response = (await client.get("resource")) as Response
		expect(await response.json()).toMatchObject({ authorization: "Bearer secret" })
		expect(middlewareRequest).toMatchObject({ method: "GET", url: new URL("https://example.comresource") })
	})
	it("does not replace a request authorization header", async () => {
		const globalFetch = vi.fn(
			async (_url: string, init: RequestInit) =>
				new Response(JSON.stringify({ authorization: new Headers(init.headers).get("Authorization") }), {
					headers: { "Content-Type": "application/json" }
				})
		)
		const client = new http.Client("https://example.com", undefined, {
			authorization: { bearer: "default" },
			fetch: globalFetch
		})

		await expect(
			client.get<{ authorization: string }>("/resource", { authorization: "Custom token" })
		).resolves.toMatchObject({ authorization: "Custom token" })
	})
	it("forwards POST, PUT, and PATCH bodies and methods", async () => {
		const globalFetch = vi.fn(async (_url: string, init: RequestInit) => {
			const headers = new Headers(init.headers)
			return new Response(
				JSON.stringify({ method: init.method, body: init.body, contentType: headers.get("Content-Type") }),
				{ headers: { "Content-Type": "application/json" } }
			)
		})
		const client = new http.Client("https://example.com", undefined, { fetch: globalFetch })

		await expect(
			client.post<{ method: string; body: string; contentType: string }>("/post", { value: 1 })
		).resolves.toMatchObject({ method: "POST", body: '{"value":1}', contentType: "application/json; charset=utf-8" })
		await expect(client.put<{ method: string; body: string }>("/put", { value: 2 })).resolves.toMatchObject({
			method: "PUT",
			body: '{"value":2}'
		})
		await expect(client.patch<{ method: string; body: string }>("/patch", { value: 3 })).resolves.toMatchObject({
			method: "PATCH",
			body: '{"value":3}'
		})
	})
	it("forwards GET and DELETE headers", async () => {
		const globalFetch = vi.fn(
			async (_url: string, init: RequestInit) =>
				new Response(JSON.stringify({ method: init.method, token: new Headers(init.headers).get("X-Token") }), {
					headers: { "Content-Type": "application/json" }
				})
		)
		const client = new http.Client("https://example.com", undefined, { fetch: globalFetch })

		await expect(client.get<{ method: string; token: string }>("/get", { xToken: "get-token" })).resolves.toMatchObject(
			{ method: "GET", token: "get-token" }
		)
		await expect(
			client.delete<{ method: string; token: string }>("/delete", { xToken: "delete-token" })
		).resolves.toMatchObject({ method: "DELETE", token: "delete-token" })
	})
	it("retries after onUnauthorized accepts a 401 response", async () => {
		let attempts = 0
		const globalFetch = vi.fn(async () => {
			attempts++
			return attempts == 1
				? new Response("unauthorized", { status: 401, headers: { "Content-Type": "text/plain" } })
				: new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } })
		})
		const onUnauthorized = vi.fn(async () => true)
		const client = new http.Client("https://example.com", undefined, { fetch: globalFetch, onUnauthorized })

		await expect(client.get<{ ok: boolean }>("/resource")).resolves.toEqual({ ok: true })
		expect(onUnauthorized).toHaveBeenCalledTimes(1)
		expect(globalFetch).toHaveBeenCalledTimes(2)
	})
	it("retries after onError accepts an error response", async () => {
		let attempts = 0
		const globalFetch = vi.fn(async () => {
			attempts++
			return attempts == 1
				? new Response("failure", { status: 500, headers: { "Content-Type": "text/plain" } })
				: new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } })
		})
		const onError = vi.fn(async () => true)
		const client = new http.Client("https://example.com", undefined, { fetch: globalFetch, onError })

		await expect(client.get<{ ok: boolean }>("/resource")).resolves.toEqual({ ok: true })
		expect(onError).toHaveBeenCalledTimes(1)
		expect(globalFetch).toHaveBeenCalledTimes(2)
	})
	it("returns the response body when callbacks decline handling", async () => {
		const globalFetch = vi.fn(
			async () => new Response("gone", { status: 410, headers: { "Content-Type": "text/plain" } })
		)
		const client = new http.Client("https://example.com", undefined, { fetch: globalFetch, onError: async () => false })

		await expect(client.get<string>("/resource")).resolves.toBe("gone")
	})
	it("returns a 601 response body when fetch throws", async () => {
		const error = new Error("offline")
		const globalFetch = vi.fn(async () => {
			throw error
		})
		const client = new http.Client("https://example.com", undefined, { fetch: globalFetch })

		await expect(client.get<Error>("/resource")).resolves.toBe(error)
	})
})
