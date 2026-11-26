import { http } from "../index"

describe("Request.Header", () => {
	it("to", async () =>
		expect(http.Request.Header.to({ contentType: "application/json; charset=utf-8" })).toEqual({
			"Content-Type": "application/json; charset=utf-8"
		}))
	it("toJSON", async () =>
		expect(JSON.stringify({ contentType: "application/json; charset=utf-8" })).toEqual(
			'{"contentType":"application/json; charset=utf-8"}'
		))
	it("new cf headers", () => {
		expect(
			http.Request.Header.to({
				contentType: "application/json; charset=utf-8",
				cfConnectionIp: "127.0.0.1",
				cfIpCountry: "SE"
			})
		).toEqual({
			"Content-Type": "application/json; charset=utf-8",
			"CF-Connecting-IP": "127.0.0.1",
			"CF-IPCountry": "SE"
		})
		expect(
			http.Request.Header.from({
				"Content-Type": "application/json; charset=utf-8",
				"CF-Connecting-IP": "127.0.0.1",
				"CF-IPCountry": "SE"
			})
		).toEqual({ contentType: "application/json; charset=utf-8", cfConnectionIp: "127.0.0.1", cfIpCountry: "SE" })
	})
	it("custom headers", () => {
		expect(
			http.Request.Header.to({
				xModNonce: "some_session_id",
				xModRetry: "true",
				xAuthToken: "tOkEnStRiNg",
				xTrackingId: "some_tracking_id"
			})
		).toEqual({
			"x-mod-nonce": "some_session_id",
			"x-mod-retry": "true",
			"X-Auth-Token": "tOkEnStRiNg",
			"x-tracking-id": "some_tracking_id"
		})
		expect(
			http.Request.Header.from({
				"x-mod-nonce": "some_session_id",
				"x-mod-retry": "true",
				"X-Auth-Token": "tOkEnStRiNg",
				"x-tracking-id": "some_tracking_id"
			})
		).toEqual({
			xModNonce: "some_session_id",
			xModRetry: "true",
			xAuthToken: "tOkEnStRiNg",
			xTrackingId: "some_tracking_id"
		})
	})
	it("unknown headers", () => {
		expect(http.Request.Header.to({ contentType: "application/json; charset=utf-8", fooBar: "Foo Bar" })).toEqual({
			"Content-Type": "application/json; charset=utf-8",
			"Foo-Bar": "Foo Bar"
		})
		expect(
			http.Request.Header.from({ "Content-Type": "application/json; charset=utf-8", "Foo-Bar": "Foo Bar" })
		).toEqual({ contentType: "application/json; charset=utf-8", fooBar: "Foo Bar" })
	})
	it("is", () => {
		expect(http.Request.Header.is({ contentType: "application/json", accept: ["application/json"] })).toBe(true)
		expect(http.Request.Header.is({ accept: "application/json" })).toBe(false)
		expect(() => http.Request.Header.is(null)).toThrow(TypeError)
	})
	it("to with array header", () =>
		expect(http.Request.Header.to({ accept: ["application/json", "text/plain"] })).toEqual({
			Accept: "application/json, text/plain"
		}))
	it("from HeadersInit array", () =>
		expect(
			http.Request.Header.from([
				["Accept", "application/json", "text/plain"],
				["x-foo", "bar"]
			])
		).toEqual({ accept: ["application/json", "text/plain"], xFoo: "bar" }))
	it("from Headers instance", () =>
		expect(http.Request.Header.from(new Headers({ Accept: "application/json, text/plain" }))).toEqual({
			accept: ["application/json", "text/plain"]
		}))
	it("toString", () =>
		expect(http.Request.Header.toString({ contentType: "application/json" })).toEqual("contentType: application/json"))
	it.each([
		{ direction: "to", input: "contentType", expected: "Content-Type" },
		{ direction: "from", input: "Content-Type", expected: "contentType" },
		{ direction: "to", input: "fooBar", expected: "Foo-Bar" },
		{ direction: "from", input: "Foo-Bar", expected: "fooBar" }
	])("Header.Name.$direction($input)", ({ direction, input, expected }) =>
		expect(direction == "to" ? http.Request.Header.Name.to(input) : http.Request.Header.Name.from(input)).toEqual(
			expected
		)
	)
})
