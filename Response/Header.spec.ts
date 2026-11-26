import { http } from "../index"

describe("Response.Header", () => {
	it("from array", async () =>
		expect(
			http.Response.Header.from([
				["Content-Type", "application/json; charset=utf-8"],
				["Allow", "GET, PUT"],
				["CF-Connecting-IP", "127.0.0.1"],
				["CF-IPCountry", "SE"]
			])
		).toEqual({
			contentType: "application/json; charset=utf-8",
			allow: ["GET", "PUT"],
			cfConnectionIp: "127.0.0.1",
			cfIpCountry: "SE"
		}))
	it("from object", async () =>
		expect(
			http.Response.Header.from({
				"Content-Type": "application/json; charset=utf-8",
				Allow: "GET, PUT",
				"CF-Connecting-IP": "127.0.0.1",
				"CF-IPCountry": "SE"
			})
		).toEqual({
			contentType: "application/json; charset=utf-8",
			allow: ["GET", "PUT"],
			cfConnectionIp: "127.0.0.1",
			cfIpCountry: "SE"
		}))
	it("to", async () =>
		expect(
			http.Response.Header.to({
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
		expect(http.Response.Header.to({ contentType: "application/json; charset=utf-8", fooBar: "Foo Bar" })).toEqual({
			"Content-Type": "application/json; charset=utf-8",
			"Foo-Bar": "Foo Bar"
		})
		expect(
			http.Response.Header.from({ "Content-Type": "application/json; charset=utf-8", "Foo-Bar": "Foo Bar" })
		).toEqual({ contentType: "application/json; charset=utf-8", fooBar: "Foo Bar" })
	})
	it("is", () => {
		expect(http.Response.Header.is({ contentType: "application/json", allow: ["GET", "POST"] })).toBe(true)
		expect(http.Response.Header.is({ allow: "GET" })).toBe(false)
		expect(() => http.Response.Header.is(null)).toThrow(TypeError)
	})
	it("from Headers instance", () =>
		expect(http.Response.Header.from(new Headers({ Allow: "GET, POST", "Content-Type": "application/json" }))).toEqual({
			allow: ["GET", "POST"],
			contentType: "application/json"
		}))
	it("from object keeps list values", () =>
		expect(http.Response.Header.from({ Allow: ["GET", "PATCH"], Vary: ["Accept", "Origin"] } as any)).toEqual({
			allow: ["GET", "PATCH"],
			vary: ["Accept", "Origin"]
		}))
	it("toString", () =>
		expect(http.Response.Header.toString({ contentType: "application/json", allow: ["GET", "PUT"] })).toEqual(
			"contentType: application/json\nallow: GET,PUT"
		))
	it("fromAny", () => {
		expect(
			http.Response.Header.fromAny(
				{ header: { contentType: "application/json" }, status: 302, location: "https://example.com/next" },
				{ cacheControl: "no-store" }
			)
		).toEqual({ contentType: "application/json", location: "https://example.com/next", cacheControl: "no-store" })
		expect(http.Response.Header.fromAny("not-an-object", { cacheControl: "no-store" })).toEqual({
			cacheControl: "no-store"
		})
	})
	it.each([
		{ direction: "to", input: "contentType", expected: "Content-Type" },
		{ direction: "from", input: "Content-Type", expected: "contentType" },
		{ direction: "to", input: "fooBar", expected: "Foo-Bar" },
		{ direction: "from", input: "Foo-Bar", expected: "fooBar" }
	])("Header.Name.$direction($input)", ({ direction, input, expected }) =>
		expect(direction == "to" ? http.Response.Header.Name.to(input) : http.Response.Header.Name.from(input)).toEqual(
			expected
		)
	)
})
