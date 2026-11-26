import * as http from "./index"

describe("fetch", () => {
	const methods = ["GET", "HEAD", "POST", "DELETE", "OPTIONS", "TRACE", "PATCH"] //CONNECT and PUT will timeout
	it.skip.each(methods)("%s", async method => {
		const result = await http.fetch({ method, url: "http://example.com/" })
		expect(typeof result.status).toEqual("number")
	})
})
