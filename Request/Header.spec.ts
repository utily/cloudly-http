import * as parser from "../index"

describe("servly.Request.Header", () => {
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
})
