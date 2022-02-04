import * as parser from "../index"

describe("Request.Header", () => {
	it("to", async () =>
		expect(
			parser.Request.Header.to({
				contentType: "application/json; charset=utf-8",
			})
		).toEqual({
			"Content-Type": "application/json; charset=utf-8",
		}))
	it("toJSON", async () =>
		expect(JSON.stringify({ contentType: "application/json; charset=utf-8" })).toEqual(
			'{"contentType":"application/json; charset=utf-8"}'
		))
	it("new cf headers", () => {
		expect(
			parser.Request.Header.to({
				contentType: "application/json; charset=utf-8",
				cfConnectionIp: "127.0.0.1",
				cfIpCountry: "SE",
			})
		).toEqual({
			"Content-Type": "application/json; charset=utf-8",
			"CF-Connecting-IP": "127.0.0.1",
			"CF-IPCountry": "SE",
		})
		expect(
			parser.Request.Header.from({
				"Content-Type": "application/json; charset=utf-8",
				"CF-Connecting-IP": "127.0.0.1",
				"CF-IPCountry": "SE",
			})
		).toEqual({
			contentType: "application/json; charset=utf-8",
			cfConnectionIp: "127.0.0.1",
			cfIpCountry: "SE",
		})
	})
	it("custom headers", () => {
		expect(
			parser.Request.Header.to({
				xModNonce: "some_session_id",
				xModRetry: "true",
				xAuthToken: "tOkEnStRiNg",
				xTrackingId: "some_tracking_id",
			})
		).toEqual({
			"x-mod-nonce": "some_session_id",
			"x-mod-retry": "true",
			"X-Auth-Token": "tOkEnStRiNg",
			"x-tracking-id": "some_tracking_id",
		})
		expect(
			parser.Request.Header.from({
				"x-mod-nonce": "some_session_id",
				"x-mod-retry": "true",
				"X-Auth-Token": "tOkEnStRiNg",
				"x-tracking-id": "some_tracking_id",
			})
		).toEqual({
			xModNonce: "some_session_id",
			xModRetry: "true",
			xAuthToken: "tOkEnStRiNg",
			xTrackingId: "some_tracking_id",
		})
	})
})
