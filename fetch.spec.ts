import "isomorphic-fetch"
import { Blob } from "fetch-blob"
import { File } from "fetch-blob/file"
import { FormData as Form } from "formdata-polyfill/esm.min.js"
import { http } from "./index"

globalThis.Blob = Blob
globalThis.File = File
globalThis.FormData = Form
describe("fetch", () => {
	const methods = ["GET", "HEAD", "POST", "DELETE", "OPTIONS", "TRACE", "PATCH"] //CONNECT and PUT will timeout
	methods.forEach(method => {
		it.skip(method, async () => {
			const result = await http.fetch({ method, url: "http://example.com/" })
			expect(typeof result.status).toEqual("number")
		})
	})
	const fetch = http.fetch.create(
		async (url: string, init: RequestInit): Promise<Response> =>
			new Response(JSON.stringify({ url, ...init }), {
				headers: { "Content-Type": "application/json; encoding=utf-8" },
			})
	)
	it("get url", async () => {
		expect(await fetch("http://example.com/collection/resource")).toEqual({
			body: {
				headers: {},
				method: "GET",
				url: "http://example.com/collection/resource",
			},
			header: {
				contentType: "application/json; encoding=utf-8",
			},
			status: 200,
		})
	})
	it("post json", async () => {
		expect(
			await fetch({
				method: "POST",
				url: "http://example.com/collection",
				body: { value: 42, data: { value: "The Power of Attraction." } },
			})
		).toEqual({
			body: {
				body: '{"value":42,"data":{"value":"The Power of Attraction."}}',
				headers: {
					"Content-Type": "application/json; charset=utf-8",
				},
				method: "POST",
				url: "http://example.com/collection",
			},
			header: {
				contentType: "application/json; encoding=utf-8",
			},
			status: 200,
		})
	})
})
