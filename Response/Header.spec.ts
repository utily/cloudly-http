import * as parser from "../index"

describe("Response.Header", () => {
	it("from array", async () =>
		expect(
			parser.Response.Header.from([
				["Content-Type", "application/json; charset=utf-8"],
				["Allow", "GET, PUT"],
				["CF-Connecting-IP", "127.0.0.1"],
				["CF-IPCountry", "SE"],
			])
		).toEqual({
			contentType: "application/json; charset=utf-8",
			allow: ["GET", "PUT"],
			cfConnectionIp: "127.0.0.1",
			cfIpCountry: "SE",
		}))
	it("from object", async () =>
		expect(
			parser.Response.Header.from({
				"Content-Type": "application/json; charset=utf-8",
				Allow: "GET, PUT",
				"CF-Connecting-IP": "127.0.0.1",
				"CF-IPCountry": "SE",
			})
		).toEqual({
			contentType: "application/json; charset=utf-8",
			allow: ["GET", "PUT"],
			cfConnectionIp: "127.0.0.1",
			cfIpCountry: "SE",
		}))
	it("to", async () =>
		expect(
			parser.Response.Header.to({
				contentType: "application/json; charset=utf-8",
				allow: ["GET", "PUT"],
				cfConnectionIp: "127.0.0.1",
				cfIpCountry: "SE",
			})
		).toEqual({
			"Content-Type": "application/json; charset=utf-8",
			Allow: "GET, PUT",
			"CF-Connecting-IP": "127.0.0.1",
			"CF-IPCountry": "SE",
		}))
})
