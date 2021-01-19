import * as Search from "./Search"

describe("Search", () => {
	it("stringify", async () => {
		const result = Search.stringify({ value: 1337, nested: { value: 42, string: "The power of attraction." } })
		expect(result.toString()).toEqual("value=1337&nested[value]=42&nested[string]=The power of attraction.")
	})
	it("parse", async () => {
		const result = Search.parse("value=1337&nested[value]=42&nested[string]=The power of attraction.")
		expect(result).toEqual({ value: "1337", nested: { value: "42", string: "The power of attraction." } })
	})
})
