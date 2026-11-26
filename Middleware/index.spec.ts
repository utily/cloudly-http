import { http } from "../index"

describe("http.Middleware", () => {
	it("is", () => {
		expect(http.Middleware.is(async () => http.Response.create({ status: 200 }))).toEqual(true)
		expect(http.Middleware.is(undefined)).toBeFalsy()
	})
	it("merge", async () => {
		const order: string[] = []
		const before = async (
			request: http.Request<{ value: number }>,
			next: (request: http.Request<{ value: number; before: true }>) => Promise<http.Response<{ ok: true }>>
		) => {
			order.push("before")
			return await next({ ...request, body: { ...request.body, before: true } })
		}
		const after = async (
			request: http.Request<{ value: number; before: true }>,
			next: (
				request: http.Request<{ value: number; before: true; after: true }>
			) => Promise<http.Response<{ ok: true }>>
		) => {
			order.push("after")
			return await next({ ...request, body: { ...request.body, after: true } })
		}
		const merged = http.Middleware.merge(before, after)
		const response = await merged(
			http.Request.create({
				method: "POST",
				url: "http://example.com/collection/resource",
				header: { contentType: "application/json; charset=utf-8" },
				body: { value: 42 }
			}),
			async request => {
				order.push("next")
				expect(request.body).toEqual({ value: 42, before: true, after: true })
				return http.Response.create({ status: 200, body: { ok: true } })
			}
		)
		expect(order).toEqual(["before", "after", "next"])
		expect(response).toEqual({
			status: 200,
			header: { contentType: "application/json; charset=utf-8" },
			body: { ok: true }
		})
	})
	it("identity", async () => {
		const request = http.Request.create({
			method: "POST",
			url: "http://example.com/collection/resource",
			header: { contentType: "application/json; charset=utf-8" },
			body: { value: 42 }
		})
		const response = await http.Middleware.create("identity")(request, async r => {
			expect(r).toEqual(request)
			return http.Response.create({ status: 200, body: { ok: true } })
		})
		expect(response).toEqual({
			status: 200,
			header: { contentType: "application/json; charset=utf-8" },
			body: { ok: true }
		})
	})
	it("client", async () => {
		const response = await http.Middleware.create("client")(
			http.Request.create({
				method: "POST",
				url: "http://example.com/collection/resource",
				header: { contentType: "application/json; charset=utf-8" },
				body: { value: 42 }
			}),
			async request => {
				expect(request.body).toEqual('{"value":42}')
				return {
					status: 200,
					header: { contentType: "application/json; charset=utf-8" },
					body: new Response(JSON.stringify({ ok: true }))
				}
			}
		)
		expect(response).toEqual({
			status: 200,
			header: { contentType: "application/json; charset=utf-8" },
			body: { ok: true }
		})
	})
	it("server object", async () => {
		expect(
			await http.Middleware.create("server")(
				await http.Request.from(
					new Request("http://example.com/collection/resource", {
						method: "PUT",
						headers: { "Content-Type": "application/json; charset=utf-8" },
						body: JSON.stringify({ value: 42, test: { value: "The Power of Attraction." } })
					}),
					"none"
				),
				async request => {
					expect(request).toMatchObject({
						body: { test: { value: "The Power of Attraction." }, value: 42 },
						header: { contentType: "application/json; charset=utf-8" },
						method: "PUT",
						parameter: {},
						search: {},
						url: new URL("http://example.com/collection/resource")
					})
					return http.Response.create({ status: 200, body: { id: "42", test: { value: 1337 } } })
				}
			)
		).toEqual({
			body: '{"id":"42","test":{"value":1337}}',
			header: { contentType: "application/json; charset=utf-8" },
			status: 200
		})
	})
	it("server text", async () => {
		expect(
			await http.Middleware.create("server")(
				await http.Request.from(
					new Request("http://example.com/collection/resource", {
						method: "PUT",
						headers: { "Content-Type": "text/plain; charset=utf-8" },
						body: "The Power of Attraction."
					}),
					"none"
				),
				async request => {
					expect(request).toMatchObject({
						body: "The Power of Attraction.",
						header: { contentType: "text/plain; charset=utf-8" },
						method: "PUT",
						parameter: {},
						search: {},
						url: new URL("http://example.com/collection/resource")
					})
					return http.Response.create("id: 42")
				}
			)
		).toEqual({ body: "id: 42", header: { contentType: "text/plain; charset=utf-8" }, status: 200 })
	})
	it("parser serializer", async () => {
		const parser = new http.Parser<string>()
		parser.add(async message => ({ ...message, body: "parsed" }), "application/test")
		const serializer = new http.Serializer()
		serializer.add(async message => ({ ...message, body: `serialized:${String(message.body)}` }), "application/test")
		const response = await http.Middleware.create(parser, serializer)(
			http.Request.create({
				method: "POST",
				url: "http://example.com/collection/resource",
				header: { contentType: "application/test" },
				body: "request"
			}),
			async request => {
				expect(request.body).toEqual("parsed")
				return http.Response.create({ status: 200, header: { contentType: "application/test" }, body: "response" })
			}
		)
		expect(response).toEqual({ status: 200, header: { contentType: "application/test" }, body: "serialized:response" })
	})
	it("parser only", async () => {
		const parser = new http.Parser<string>()
		parser.add(async message => ({ ...message, body: "parsed" }), "application/test")
		const response = await http.Middleware.create(parser)(
			http.Request.create({
				method: "POST",
				url: "http://example.com/collection/resource",
				header: { contentType: "application/test" },
				body: "request"
			}),
			async request => {
				expect(request.body).toEqual("parsed")
				return http.Response.create({ status: 200, header: { contentType: "application/test" }, body: "response" })
			}
		)
		expect(response).toEqual({ status: 200, header: { contentType: "application/test" }, body: "response" })
	})
	it("parser extend inherits parsers", async () => {
		const parser = new http.Parser<string>()
		parser.add(async message => ({ ...message, body: "inherited" }), "application/test")
		const extended = parser.extend()

		await expect(
			extended.parse(
				http.Request.create({
					method: "POST",
					url: "http://example.com/collection/resource",
					header: { contentType: "application/test" },
					body: "request"
				})
			)
		).resolves.toMatchObject({ body: "inherited" })
	})
	it("parser removes body without a registered parser", async () => {
		const request = http.Request.create({
			method: "POST",
			url: "http://example.com/collection/resource",
			body: "request"
		})

		await expect(new http.Parser().parse(request)).resolves.not.toHaveProperty("body")
	})
	it("serializer only second argument", async () => {
		const serializer = new http.Serializer()
		serializer.add(async message => ({ ...message, body: `serialized:${String(message.body)}` }), "application/test")
		const response = await http.Middleware.create(undefined, serializer)(
			http.Request.create({
				method: "POST",
				url: "http://example.com/collection/resource",
				header: { contentType: "application/test" },
				body: "request"
			}),
			async request => {
				expect(request.body).toEqual("request")
				return http.Response.create({ status: 200, header: { contentType: "application/test" }, body: "response" })
			}
		)
		expect(response).toEqual({ status: 200, header: { contentType: "application/test" }, body: "serialized:response" })
	})
	it("serializer parser", async () => {
		const parser = new http.Parser<string>()
		parser.add(async message => ({ ...message, body: "parsed" }), "application/test")
		const serializer = new http.Serializer()
		serializer.add(async message => ({ ...message, body: `serialized:${String(message.body)}` }), "application/test")
		const response = await http.Middleware.create(serializer, parser)(
			http.Request.create({
				method: "POST",
				url: "http://example.com/collection/resource",
				header: { contentType: "application/test" },
				body: "request"
			}),
			async request => {
				expect(request.body).toEqual("serialized:request")
				return http.Response.create({ status: 200, header: { contentType: "application/test" }, body: "response" })
			}
		)
		expect(response).toEqual({ status: 200, header: { contentType: "application/test" }, body: "parsed" })
	})
	it("serializer only first argument", async () => {
		const serializer = new http.Serializer()
		serializer.add(async message => ({ ...message, body: `serialized:${String(message.body)}` }), "application/test")
		const response = await http.Middleware.create(serializer)(
			http.Request.create({
				method: "POST",
				url: "http://example.com/collection/resource",
				header: { contentType: "application/test" },
				body: "request"
			}),
			async request => {
				expect(request.body).toEqual("serialized:request")
				return http.Response.create({ status: 200, header: { contentType: "application/test" }, body: "response" })
			}
		)
		expect(response).toEqual({ status: 200, header: { contentType: "application/test" }, body: "response" })
	})
	it("parser only second argument", async () => {
		const parser = new http.Parser<string>()
		parser.add(async message => ({ ...message, body: "parsed" }), "application/test")
		const response = await http.Middleware.create(undefined, parser)(
			http.Request.create({
				method: "POST",
				url: "http://example.com/collection/resource",
				header: { contentType: "application/test" },
				body: "request"
			}),
			async request => {
				expect(request.body).toEqual("request")
				return http.Response.create({ status: 200, header: { contentType: "application/test" }, body: "response" })
			}
		)
		expect(response).toEqual({ status: 200, header: { contentType: "application/test" }, body: "parsed" })
	})
	it("fallback", async () => {
		const request = http.Request.create({
			method: "POST",
			url: "http://example.com/collection/resource",
			header: { contentType: "application/test" },
			body: "request"
		})
		const response = await http.Middleware.create("headers")(request, async r => {
			expect(r).toEqual(request)
			return http.Response.create({ status: 200, header: { contentType: "application/test" }, body: "response" })
		})
		expect(response).toEqual({ status: 200, header: { contentType: "application/test" }, body: "response" })
	})
})
