import * as parser from "../index"

describe("servly.Response.Header", () => {
	it("from array", async () =>
		expect(
			parser.Response.Header.from([
				["Content-Type", "application/json; charset=utf-8"],
				["Allow", "GET, PUT"],
			])
		).toEqual({
			contentType: "application/json; charset=utf-8",
			allow: ["GET", "PUT"],
		}))
	it("from object", async () =>
		expect(
			parser.Response.Header.from({
				"Content-Type": "application/json; charset=utf-8",
				Allow: "GET, PUT",
			})
		).toEqual({
			contentType: "application/json; charset=utf-8",
			allow: ["GET", "PUT"],
		}))
	it("to", async () =>
		expect(
			parser.Response.Header.to({
				contentType: "application/json; charset=utf-8",
				allow: ["GET", "PUT"],
			})
		).toEqual({
			"Content-Type": "application/json; charset=utf-8",
			Allow: "GET, PUT",
		}))
})
