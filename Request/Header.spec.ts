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
})
