import { Request } from "../index"

describe("Request.Header", () => {
	it("to", async () =>
		expect(Request.Header.to({ contentType: "application/json; charset=utf-8" })).toEqual({
			"Content-Type": "application/json; charset=utf-8"
		}))
	it("toJSON", async () =>
		expect(JSON.stringify({ contentType: "application/json; charset=utf-8" })).toEqual(
			'{"contentType":"application/json; charset=utf-8"}'
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
