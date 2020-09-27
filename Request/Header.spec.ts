import * as parser from "../index"

describe("servly.Request.Header", () => {
	it("toJSON", async () =>
		expect(JSON.stringify(parser.Request.Header.from({ "Content-Type": "application/json; charset=utf-8" }))).toEqual(
			'{"Content-Type":"application/json; charset=utf-8"}'
		))
})
