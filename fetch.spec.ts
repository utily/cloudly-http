import * as http from "./index"
import "isomorphic-fetch"

describe("fetch", () => {
	const methods = ["GET", "HEAD", "POST", "DELETE", "OPTIONS", "TRACE", "PATCH"] //CONNECT and PUT will timeout
	methods.forEach(method => {
		it(method, async () => {
			const result = await http.fetch({ method, url: "http://example.com/" })
			expect(typeof result.status).toEqual("number")
		})
	})
})
