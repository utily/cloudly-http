import * as Search from "./Search"

describe("Search", () => {
	it("stringify", async () => {
		const result = Search.stringify({ value: 1337, nested: { value: 42, string: "The power of attraction." } })
		expect(result.toString()).toEqual("value=1337&nested[value]=42&nested[string]=The%20power%20of%20attraction.")
	})
	it("stringify 2", async () => {
		const result = Search.stringify({
			threeDSSessionData: "",
			cres:
				"eyJhY3NUcmFuc0lEIjoiZjE5MjEwMWYtYjJlYi00YjBlLThkMzYtY2ZlZjJmOWM1NWY4IiwiY2hhbGxlbmdlQ29tcGxldGlvbkluZCI6IlkiLCJtZXNzYWdlVHlwZSI6IkNSZXMiLCJtZXNzYWdlVmVyc2lvbiI6IjIuMS4wIiwidGhyZWVEU1NlcnZlclRyYW5zSUQiOiI4YmZkZDQ2MC1mZDc3LTRlZWYtOWE4Ny1hOTc4ZTJlMzAzY2YiLCJ0cmFuc1N0YXR1cyI6IlkifQ==",
		})
		expect(result.toString()).toEqual(
			"threeDSSessionData=&cres=eyJhY3NUcmFuc0lEIjoiZjE5MjEwMWYtYjJlYi00YjBlLThkMzYtY2ZlZjJmOWM1NWY4IiwiY2hhbGxlbmdlQ29tcGxldGlvbkluZCI6IlkiLCJtZXNzYWdlVHlwZSI6IkNSZXMiLCJtZXNzYWdlVmVyc2lvbiI6IjIuMS4wIiwidGhyZWVEU1NlcnZlclRyYW5zSUQiOiI4YmZkZDQ2MC1mZDc3LTRlZWYtOWE4Ny1hOTc4ZTJlMzAzY2YiLCJ0cmFuc1N0YXR1cyI6IlkifQ%3D%3D"
		)
	})
	it("parse", async () => {
		const result = Search.parse("value=1337&nested[value]=42&nested[string]=The%20power%20of%20attraction.")
		expect(result).toEqual({ value: "1337", nested: { value: "42", string: "The power of attraction." } })
	})
	it("parse 2", async () => {
		const result = Search.parse(
			"threeDSSessionData=&cres=eyJhY3NUcmFuc0lEIjoiZjE5MjEwMWYtYjJlYi00YjBlLThkMzYtY2ZlZjJmOWM1NWY4IiwiY2hhbGxlbmdlQ29tcGxldGlvbkluZCI6IlkiLCJtZXNzYWdlVHlwZSI6IkNSZXMiLCJtZXNzYWdlVmVyc2lvbiI6IjIuMS4wIiwidGhyZWVEU1NlcnZlclRyYW5zSUQiOiI4YmZkZDQ2MC1mZDc3LTRlZWYtOWE4Ny1hOTc4ZTJlMzAzY2YiLCJ0cmFuc1N0YXR1cyI6IlkifQ%3D%3D"
		)
		expect(result).toEqual({
			threeDSSessionData: "",
			cres:
				"eyJhY3NUcmFuc0lEIjoiZjE5MjEwMWYtYjJlYi00YjBlLThkMzYtY2ZlZjJmOWM1NWY4IiwiY2hhbGxlbmdlQ29tcGxldGlvbkluZCI6IlkiLCJtZXNzYWdlVHlwZSI6IkNSZXMiLCJtZXNzYWdlVmVyc2lvbiI6IjIuMS4wIiwidGhyZWVEU1NlcnZlclRyYW5zSUQiOiI4YmZkZDQ2MC1mZDc3LTRlZWYtOWE4Ny1hOTc4ZTJlMzAzY2YiLCJ0cmFuc1N0YXR1cyI6IlkifQ==",
		})
	})
})
