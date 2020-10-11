import * as http from "../index"

describe("Request", () => {
	const output = {
		method: "GET",
		url: new URL("http://example.com/collection/resource"),
		parameter: {},
		header: {},
		remote: undefined,
		body: undefined,
	}
	it("create url string", () => {
		expect(http.Request.create("http://example.com/collection/resource")).toEqual(output)
	})
	it("create url", () => {
		expect(http.Request.create({ url: "http://example.com/collection/resource" })).toEqual(output)
	})
	it("create method url", () => {
		expect(http.Request.create({ method: "post", url: "http://example.com/collection/resource" })).toEqual({
			...output,
			method: "POST",
		})
	})
	it("create method url object", () => {
		expect(
			http.Request.create({
				method: "post",
				url: "http://example.com/collection/resource",
				body: { property: "value" },
			})
		).toEqual({
			...output,
			method: "POST",
			body: { property: "value" },
		})
	})
})
