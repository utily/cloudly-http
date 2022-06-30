import "isomorphic-fetch"
import * as http from "./index"

describe("fetch", () => {
	const methods = ["GET", "HEAD", "POST", "DELETE", "OPTIONS", "TRACE", "PATCH"] //CONNECT and PUT will timeout
	methods.forEach(method => {
		it.skip(method, async () => {
			const result = await http.fetch({ method, url: "http://example.com/" })
			expect(typeof result.status).toEqual("number")
		})
	})
})
