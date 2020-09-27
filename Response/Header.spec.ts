import * as parser from "../index"

describe("servly.Response.Header", () => {
	it("from", async () =>
		expect(
			parser.Response.Header.from({ "Content-Type": "application/json; charset=utf-8", allow: ["GET", "PUT"] })
		).toEqual({
			contentType: "application/json; charset=utf-8",
			allow: ["GET", "PUT"],
		}))
})
