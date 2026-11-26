import { Response } from "../index"

describe("Response.Header", () => {
	it.each([
		{
			name: "array",
			input: [
				["Content-Type", "application/json; charset=utf-8"],
				["Allow", "GET, PUT"],
				["CF-Connecting-IP", "127.0.0.1"],
				["CF-IPCountry", "SE"]
			],
			expected: {
				contentType: "application/json; charset=utf-8",
				allow: ["GET", "PUT"],
				cfConnectionIp: "127.0.0.1",
				cfIpCountry: "SE"
			}
		},
		{
			name: "object",
			input: {
				"Content-Type": "application/json; charset=utf-8",
				Allow: "GET, PUT",
				"CF-Connecting-IP": "127.0.0.1",
				"CF-IPCountry": "SE"
			},
			expected: {
				contentType: "application/json; charset=utf-8",
				allow: ["GET", "PUT"],
				cfConnectionIp: "127.0.0.1",
				cfIpCountry: "SE"
			}
		},
		{
			name: "headers",
			input: new Headers({ "Content-Language": "en, sv", ETag: '"resource"', "X-Request-ID": "request-id" }),
			expected: { contentLanguage: ["en", "sv"], eTag: '"resource"', xRequestId: "request-id" }
		}
	])("from $name", ({ input, expected }) => expect(Response.Header.from(input as HeadersInit)).toEqual(expected))
	it("to", async () =>
		expect(
			Response.Header.to({
				contentType: "application/json; charset=utf-8",
				allow: ["GET", "PUT"],
				cfConnectionIp: "127.0.0.1",
				cfIpCountry: "SE"
			})
		).toEqual({
			"Content-Type": "application/json; charset=utf-8",
			Allow: "GET, PUT",
			"CF-Connecting-IP": "127.0.0.1",
			"CF-IPCountry": "SE"
		}))
	it("unknown headers", () => {
		expect(Response.Header.to({ contentType: "application/json; charset=utf-8", fooBar: "Foo Bar" })).toEqual({
			"Content-Type": "application/json; charset=utf-8",
			"Foo-Bar": "Foo Bar"
		})
		expect(Response.Header.from({ "Content-Type": "application/json; charset=utf-8", "Foo-Bar": "Foo Bar" })).toEqual({
			contentType: "application/json; charset=utf-8",
			fooBar: "Foo Bar"
		})
	})
	it.each([
		{ value: {}, expected: true },
		{ value: { allow: ["GET", "POST"], contentType: "application/json" }, expected: true },
		{ value: { allow: "GET" }, expected: false },
		{ value: { contentType: ["application/json"] }, expected: false },
		{ value: { vary: ["Accept", 1] }, expected: false },
		{ value: "not headers", expected: false }
	])("is", ({ value, expected }) => expect(Response.Header.is(value)).toBe(expected))
	it("from tuple values", () =>
		expect(
			Response.Header.from([
				["Set-Cookie", "first=one", "second=two"],
				["Warning", "199"],
				["X-Correlation-ID", "correlation-id"]
			] as unknown as [string, string][])
		).toEqual({ setCookie: "first=one, second=two", warning: "199", xCorrelationId: "correlation-id" }))
	it("to string", () =>
		expect(Response.Header.toString({ allow: ["GET", "POST"], xRequestId: "request-id" })).toBe(
			"allow: GET,POST\nxRequestId: request-id"
		))
})
