import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const fetchMock = vi.fn()
let http: typeof import("./index")

describe("Client", () => {
	beforeEach(async () => {
		vi.resetModules()
		fetchMock.mockReset()
		vi.stubGlobal("fetch", fetchMock)
		http = await import("./index")
	})
	afterEach(() => {
		vi.unstubAllGlobals()
	})
	it("uses mocked fetch and merges headers", async () => {
		fetchMock.mockResolvedValueOnce(
			new Response('{"ok":true}', { status: 200, headers: { "Content-Type": "application/json; charset=utf-8" } })
		)
		const client = new http.Client("https://example.com", "api-key", {
			appendHeader: () => ({ xRequestId: "request-id", authorization: "append-token" })
		})

		const result = await client.post<{ ok: boolean }>("/resource", { test: true }, { authorization: "request-token" })
		const [url, request] = fetchMock.mock.calls[0] as [string, RequestInit]

		expect(fetchMock).toHaveBeenCalledOnce()
		expect(url).toBe("https://example.com/resource")
		expect(request.method).toBe("POST")
		expect(request.headers).toMatchObject({
			"Content-Type": "application/json; charset=utf-8",
			Authorization: "request-token",
			"X-Request-Id": "request-id"
		})
		expect(request.body).toMatchInlineSnapshot(`
			{
			  "test": true,
			}
		`)
		expect(result).toMatchInlineSnapshot(`"{"ok":true}"`)
	})
	it("retries when unauthorized callback resolves true", async () => {
		const onUnauthorized = vi.fn(async () => true)
		fetchMock
			.mockResolvedValueOnce(
				new Response('{"reason":"unauthorized"}', { status: 401, headers: { "Content-Type": "application/json" } })
			)
			.mockResolvedValueOnce(
				new Response('{"ok":true}', { status: 200, headers: { "Content-Type": "application/json" } })
			)

		const client = new http.Client("https://example.com", undefined, { onUnauthorized })
		const result = await client.get<{ ok: boolean }>("/resource")

		expect(onUnauthorized).toHaveBeenCalledOnce()
		expect(fetchMock).toHaveBeenCalledTimes(2)
		expect(result).toMatchInlineSnapshot(`"{"ok":true}"`)
	})
	it("returns error object when mocked fetch rejects", async () => {
		const error = new Error("network failure")
		fetchMock.mockRejectedValueOnce(error)
		const client = new http.Client("https://example.com")

		await expect(client.get("/resource")).resolves.toBe(error)
	})
	it("sends DELETE request", async () => {
		fetchMock.mockResolvedValueOnce(
			new Response('{"deleted":true}', { status: 200, headers: { "Content-Type": "application/json" } })
		)
		const client = new http.Client("https://example.com", "api-key")

		const result = await client.delete("/resource")
		const [url, request] = fetchMock.mock.calls[0] as [string, RequestInit]

		expect(url).toBe("https://example.com/resource")
		expect(request.method).toBe("DELETE")
		expect(result).toMatchInlineSnapshot(`"{"deleted":true}"`)
	})
	it("sends PATCH request with body", async () => {
		fetchMock.mockResolvedValueOnce(
			new Response('{"updated":true}', { status: 200, headers: { "Content-Type": "application/json" } })
		)
		const client = new http.Client("https://example.com")

		const result = await client.patch("/resource", { name: "updated" })
		const [url, request] = fetchMock.mock.calls[0] as [string, RequestInit]

		expect(url).toBe("https://example.com/resource")
		expect(request.method).toBe("PATCH")
		expect(request.headers).toMatchObject({ "Content-Type": "application/json; charset=utf-8" })
		expect(result).toMatchInlineSnapshot(`"{"updated":true}"`)
	})
	it("sends PUT request with body", async () => {
		fetchMock.mockResolvedValueOnce(
			new Response('{"replaced":true}', { status: 200, headers: { "Content-Type": "application/json" } })
		)
		const client = new http.Client("https://example.com", "api-key")

		const result = await client.put("/resource", { complete: true })
		const [url, request] = fetchMock.mock.calls[0] as [string, RequestInit]

		expect(url).toBe("https://example.com/resource")
		expect(request.method).toBe("PUT")
		expect(request.headers).toMatchObject({
			Authorization: "Bearer api-key",
			"Content-Type": "application/json; charset=utf-8"
		})
		expect(result).toMatchInlineSnapshot(`"{"replaced":true}"`)
	})
	it("retries when onError callback resolves true", async () => {
		const onError = vi.fn(async () => true)
		fetchMock
			.mockResolvedValueOnce(
				new Response('{"error":"server error"}', { status: 500, headers: { "Content-Type": "application/json" } })
			)
			.mockResolvedValueOnce(
				new Response('{"ok":true}', { status: 200, headers: { "Content-Type": "application/json" } })
			)

		const client = new http.Client("https://example.com", undefined, { onError })
		const result = await client.get<{ ok: boolean }>("/resource")

		expect(onError).toHaveBeenCalledOnce()
		expect(fetchMock).toHaveBeenCalledTimes(2)
		expect(result).toMatchInlineSnapshot(`"{"ok":true}"`)
	})
	it("does not retry when onError callback resolves false", async () => {
		const onError = vi.fn(async () => false)
		fetchMock.mockResolvedValueOnce(
			new Response('{"error":"bad request"}', { status: 400, headers: { "Content-Type": "application/json" } })
		)

		const client = new http.Client("https://example.com", undefined, { onError })
		const result = await client.get("/resource")

		expect(onError).toHaveBeenCalledOnce()
		expect(fetchMock).toHaveBeenCalledOnce()
		expect(result).toMatchInlineSnapshot(`"{"error":"bad request"}"`)
	})
	it("does not retry on 401 when onUnauthorized callback resolves false", async () => {
		const onUnauthorized = vi.fn(async () => false)
		fetchMock.mockResolvedValueOnce(
			new Response('{"error":"unauthorized"}', { status: 401, headers: { "Content-Type": "application/json" } })
		)

		const client = new http.Client("https://example.com", undefined, { onUnauthorized })
		const result = await client.post("/resource", { data: "test" })

		expect(onUnauthorized).toHaveBeenCalledOnce()
		expect(fetchMock).toHaveBeenCalledOnce()
		expect(result).toMatchInlineSnapshot(`"{"error":"unauthorized"}"`)
	})
	it("applies preprocess callback", async () => {
		const preprocess = vi.fn(async req => ({ ...req, preprocessed: true }))
		fetchMock.mockResolvedValueOnce(
			new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } })
		)

		const client = new http.Client("https://example.com", undefined, { preprocess })
		await client.get("/resource")

		expect(preprocess).toHaveBeenCalledOnce()
		expect(preprocess.mock.calls[0][0]).toHaveProperty("url")
		expect(preprocess.mock.calls[0][0]).toHaveProperty("method", "GET")
	})
	it("applies postprocess callback", async () => {
		const postprocess = vi.fn(async res => res)
		fetchMock.mockResolvedValueOnce(
			new Response('{"data":"test"}', { status: 200, headers: { "Content-Type": "application/json" } })
		)

		const client = new http.Client("https://example.com", undefined, { postprocess })
		await client.get("/resource")

		expect(postprocess).toHaveBeenCalledOnce()
		expect(postprocess.mock.calls[0][0]).toHaveProperty("status", 200)
	})
	it("adds Authorization header when key is provided", async () => {
		fetchMock.mockResolvedValueOnce(
			new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } })
		)

		const client = new http.Client("https://example.com", "secret-key")
		await client.get("/resource")

		const [, request] = fetchMock.mock.calls[0] as [string, RequestInit]
		expect(request.headers).toMatchObject({ Authorization: "Bearer secret-key" })
	})
	it("does not add Authorization header when key is not provided", async () => {
		fetchMock.mockResolvedValueOnce(
			new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } })
		)

		const client = new http.Client("https://example.com")
		await client.get("/resource")

		const [, request] = fetchMock.mock.calls[0] as [string, RequestInit]
		expect(request.headers).not.toHaveProperty("Authorization")
	})
	it("creates request with proper headers including body detection", async () => {
		fetchMock.mockResolvedValueOnce(
			new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } })
		)

		const client = new http.Client("https://example.com")
		await client.post("/resource", null)

		const [, request] = fetchMock.mock.calls[0] as [string, RequestInit]
		expect(request.headers).not.toHaveProperty("Content-Type")
	})
	it("uses empty base url when url is undefined", async () => {
		fetchMock.mockResolvedValueOnce(
			new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } })
		)

		const client = new http.Client()
		await client.get("https://example.com/resource")

		const [url] = fetchMock.mock.calls[0] as [string, RequestInit]
		expect(url).toBe("https://example.com/resource")
	})
	it("keeps request headers when custom getHeader returns undefined", async () => {
		fetchMock.mockResolvedValueOnce(
			new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } })
		)

		const client = new http.Client(undefined, undefined, { getHeader: async () => undefined })
		await client.get("https://example.com/resource", { accept: "application/json" })

		const [, request] = fetchMock.mock.calls[0] as [string, RequestInit]
		expect(request.headers).toMatchObject({ Accept: "application/json" })
	})
	it("handles 401 response without onUnauthorized callback", async () => {
		fetchMock.mockResolvedValueOnce(
			new Response("{}", { status: 401, headers: { "Content-Type": "application/json" } })
		)

		const client = new http.Client("https://example.com")
		const result = await client.get("/resource")

		expect(fetchMock).toHaveBeenCalledOnce()
		expect(result).toMatchInlineSnapshot(`"{}"`)
	})
	it("handles error response with status >= 300 without onError callback", async () => {
		fetchMock.mockResolvedValueOnce(
			new Response('{"error":"forbidden"}', { status: 403, headers: { "Content-Type": "application/json" } })
		)

		const client = new http.Client("https://example.com")
		const result = await client.post("/resource", { data: "test" })

		expect(fetchMock).toHaveBeenCalledOnce()
		expect(result).toMatchInlineSnapshot(`"{"error":"forbidden"}"`)
	})
	it("supports custom header on request level", async () => {
		fetchMock.mockResolvedValueOnce(
			new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } })
		)

		const client = new http.Client("https://example.com")
		await client.delete("/resource", { "x-custom": "value" })

		const [, request] = fetchMock.mock.calls[0] as [string, RequestInit]
		expect(request.headers).toMatchObject({ "X-custom": "value" })
	})
	it("retries on 401 when both onUnauthorized and onError callbacks exist", async () => {
		const onUnauthorized = vi.fn(async () => true)
		const onError = vi.fn()
		fetchMock
			.mockResolvedValueOnce(new Response("{}", { status: 401, headers: { "Content-Type": "application/json" } }))
			.mockResolvedValueOnce(
				new Response('{"ok":true}', { status: 200, headers: { "Content-Type": "application/json" } })
			)

		const client = new http.Client("https://example.com", undefined, { onUnauthorized, onError })
		const result = await client.get("/resource")

		expect(onUnauthorized).toHaveBeenCalledOnce()
		expect(onError).not.toHaveBeenCalled()
		expect(fetchMock).toHaveBeenCalledTimes(2)
		expect(result).toMatchInlineSnapshot(`"{"ok":true}"`)
	})
	it("retries on 500 error when both onUnauthorized and onError callbacks exist", async () => {
		const onUnauthorized = vi.fn()
		const onError = vi.fn(async () => true)
		fetchMock
			.mockResolvedValueOnce(
				new Response('{"error":"server"}', { status: 500, headers: { "Content-Type": "application/json" } })
			)
			.mockResolvedValueOnce(
				new Response('{"ok":true}', { status: 200, headers: { "Content-Type": "application/json" } })
			)

		const client = new http.Client("https://example.com", undefined, { onUnauthorized, onError })
		const result = await client.post("/resource", { data: "test" })

		expect(onUnauthorized).not.toHaveBeenCalled()
		expect(onError).toHaveBeenCalledOnce()
		expect(fetchMock).toHaveBeenCalledTimes(2)
		expect(result).toMatchInlineSnapshot(`"{"ok":true}"`)
	})
})
