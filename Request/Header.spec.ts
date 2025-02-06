import { http } from "../index"

describe("Request.Header", () => {
	it("to", async () =>
		expect(
			http.Request.Header.to({
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
			http.Request.Header.to({
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
			http.Request.Header.from({
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
			http.Request.Header.to({
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
			http.Request.Header.from({
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
	it("unknown headers", () => {
		expect(
			http.Request.Header.to({
				contentType: "application/json; charset=utf-8",
				fooBar: "Foo Bar",
			})
		).toEqual({
			"Content-Type": "application/json; charset=utf-8",
			"Foo-Bar": "Foo Bar",
		})
		expect(
			http.Request.Header.from({
				"Content-Type": "application/json; charset=utf-8",
				"Foo-Bar": "Foo Bar",
			})
		).toEqual({
			contentType: "application/json; charset=utf-8",
			fooBar: "Foo Bar",
		})
	})
	it("Header.Name.to(contentType)", () => expect(http.Response.Header.Name.to("contentType")).toEqual("Content-Type"))
	it("Header.Name.from(Content-Type)", () =>
		expect(http.Response.Header.Name.from("Content-Type")).toEqual("contentType"))
	it("Header.Name.to(fooBar)", () => expect(http.Response.Header.Name.to("fooBar")).toEqual("Foo-Bar"))
	it("Header.Name.from(Foo-Bar)", () => expect(http.Response.Header.Name.from("Foo-Bar")).toEqual("fooBar"))
})
