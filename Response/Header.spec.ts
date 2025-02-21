import { http } from "../index"

describe("Response.Header", () => {
	it("from array", async () =>
		expect(
			http.Response.Header.from([
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
			http.Response.Header.from({
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
			http.Response.Header.to({
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
	it("unknown headers", () => {
		expect(
			http.Response.Header.to({
				contentType: "application/json; charset=utf-8",
				fooBar: "Foo Bar",
			})
		).toEqual({
			"Content-Type": "application/json; charset=utf-8",
			"Foo-Bar": "Foo Bar",
		})
		expect(
			http.Response.Header.from({
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
