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
		}
	])("from $name", ({ input, expected }) => expect(Response.Header.from(input)).toEqual(expected))
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
})
