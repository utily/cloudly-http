import { Request } from "../index"
import { Header } from "./Header"

describe("Request.Header", () => {
	it("to", async () =>
		expect(Request.Header.to({ contentType: "application/json; charset=utf-8" })).toEqual({
			"Content-Type": "application/json; charset=utf-8"
		}))
	it("toJSON", async () =>
		expect(JSON.stringify({ contentType: "application/json; charset=utf-8" })).toEqual(
			'{"contentType":"application/json; charset=utf-8"}'
		))
	it("is", () => {
		expect(Request.Header.is({ accept: ["application/json", "text/html"], contentType: "application/json" })).toBe(true)
		expect(Request.Header.is({ accept: "application/json" })).toBe(false)
		expect(Request.Header.is({ accept: ["application/json", 1] })).toBe(false)
		expect(Request.Header.is({ contentType: ["application/json"] })).toBe(false)
		expect(Request.Header.is("headers")).toBe(false)
	})
	it("to joins array values and converts unknown names", () => {
		expect(
			Request.Header.to({ accept: ["application/json", "text/html"], customHeader: "custom", emptyHeader: undefined })
		).toEqual({ Accept: "application/json, text/html", "Custom-Header": "custom", "Empty-Header": undefined })
	})
	it.each([
		{
			name: "Headers",
			input: new Headers([
				["Accept", "application/json, text/html"],
				["X-Test-Header", "test"]
			]),
			expected: { accept: ["application/json", "text/html"], xTestHeader: "test" }
		},
		{
			name: "tuples",
			input: [
				["Accept-Language", "en, sv"],
				["X-Test-Header", "test"]
			] as [string, string][],
			expected: { acceptLanguage: ["en", "sv"], xTestHeader: "test" }
		}
	])("from $name", ({ input, expected }) => expect(Request.Header.from(input)).toEqual(expected))
	it("toString", () =>
		expect(Header.toString({ contentType: "application/json", accept: ["application/json"] })).toBe(
			"contentType: application/json\naccept: application/json"
		))
	it.each([
		{
			name: "cf",
			toInput: { contentType: "application/json; charset=utf-8", cfConnectionIp: "127.0.0.1", cfIpCountry: "SE" },
			toExpected: {
				"Content-Type": "application/json; charset=utf-8",
				"CF-Connecting-IP": "127.0.0.1",
				"CF-IPCountry": "SE"
			},
			fromInput: {
				"Content-Type": "application/json; charset=utf-8",
				"CF-Connecting-IP": "127.0.0.1",
				"CF-IPCountry": "SE"
			},
			fromExpected: { contentType: "application/json; charset=utf-8", cfConnectionIp: "127.0.0.1", cfIpCountry: "SE" }
		},
		{
			name: "custom",
			toInput: {
				xModNonce: "some_session_id",
				xModRetry: "true",
				xAuthToken: "tOkEnStRiNg",
				xTrackingId: "some_tracking_id"
			},
			toExpected: {
				"x-mod-nonce": "some_session_id",
				"x-mod-retry": "true",
				"X-Auth-Token": "tOkEnStRiNg",
				"x-tracking-id": "some_tracking_id"
			},
			fromInput: {
				"x-mod-nonce": "some_session_id",
				"x-mod-retry": "true",
				"X-Auth-Token": "tOkEnStRiNg",
				"x-tracking-id": "some_tracking_id"
			},
			fromExpected: {
				xModNonce: "some_session_id",
				xModRetry: "true",
				xAuthToken: "tOkEnStRiNg",
				xTrackingId: "some_tracking_id"
			}
		},
		{
			name: "unknown",
			toInput: { contentType: "application/json; charset=utf-8", fooBar: "Foo Bar" },
			toExpected: { "Content-Type": "application/json; charset=utf-8", "Foo-Bar": "Foo Bar" },
			fromInput: { "Content-Type": "application/json; charset=utf-8", "Foo-Bar": "Foo Bar" },
			fromExpected: { contentType: "application/json; charset=utf-8", fooBar: "Foo Bar" }
		}
	])("$name headers", ({ toInput, toExpected, fromInput, fromExpected }) => {
		expect(Request.Header.to(toInput)).toEqual(toExpected)
		expect(Request.Header.from(fromInput)).toEqual(fromExpected)
	})
})
