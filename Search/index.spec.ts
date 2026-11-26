import { Search } from "../index"

describe("Search", () => {
	it.each([
		{
			name: "nested values",
			input: { value: 1337, nested: { value: 42, string: "The power of attraction." } },
			expected: "value=1337&nested[value]=42&nested[string]=The%20power%20of%20attraction."
		},
		{
			name: "encoded value",
			input: {
				threeDSSessionData: "",
				cres: "eyJhY3NUcmFuc0lEIjoiZjE5MjEwMWYtYjJlYi00YjBlLThkMzYtY2ZlZjJmOWM1NWY4IiwiY2hhbGxlbmdlQ29tcGxldGlvbkluZCI6IlkiLCJtZXNzYWdlVHlwZSI6IkNSZXMiLCJtZXNzYWdlVmVyc2lvbiI6IjIuMS4wIiwidGhyZWVEU1NlcnZlclRyYW5zSUQiOiI4YmZkZDQ2MC1mZDc3LTRlZWYtOWE4Ny1hOTc4ZTJlMzAzY2YiLCJ0cmFuc1N0YXR1cyI6IlkifQ=="
			},
			expected:
				"threeDSSessionData=&cres=eyJhY3NUcmFuc0lEIjoiZjE5MjEwMWYtYjJlYi00YjBlLThkMzYtY2ZlZjJmOWM1NWY4IiwiY2hhbGxlbmdlQ29tcGxldGlvbkluZCI6IlkiLCJtZXNzYWdlVHlwZSI6IkNSZXMiLCJtZXNzYWdlVmVyc2lvbiI6IjIuMS4wIiwidGhyZWVEU1NlcnZlclRyYW5zSUQiOiI4YmZkZDQ2MC1mZDc3LTRlZWYtOWE4Ny1hOTc4ZTJlMzAzY2YiLCJ0cmFuc1N0YXR1cyI6IlkifQ%3D%3D"
		},
		{
			name: "primitives and undefined",
			input: { boolean: true, number: 7, bigint: 42n, text: "value", missing: undefined },
			expected: "boolean=true&number=7&bigint=42&text=value"
		},
		{
			name: "inherited properties",
			input: Object.assign(Object.create({ hidden: "secret" }), { shown: "value" }),
			expected: "shown=value"
		},
		{ name: "symbol values", input: { token: Symbol("token") }, expected: "token=Symbol(token)" }
	])("stringify $name", ({ input, expected }) => expect(Search.stringify(input).toString()).toEqual(expected))
	it.each([
		{
			name: "nested values",
			input: "value=1337&nested[value]=42&nested[string]=The%20power%20of%20attraction.",
			expected: { value: "1337", nested: { value: "42", string: "The power of attraction." } }
		},
		{
			name: "nested object",
			input:
				"value=1337&nested%5Bvalue%5D=42&nested%5Bstring%5D=The%20power%20of%20attraction.&nested%5Bobject%5D%5Bvalue%5D=Deepest%20level.",
			expected: {
				value: "1337",
				nested: { value: "42", string: "The power of attraction.", object: { value: "Deepest level." } }
			}
		},
		{
			name: "plus signs",
			input: "value=Some+nice+pants+and+an+Iphone%2B",
			expected: { value: "Some nice pants and an Iphone+" }
		},
		{
			name: "encoded value",
			input:
				"threeDSSessionData=&cres=eyJhY3NUcmFuc0lEIjoiZjE5MjEwMWYtYjJlYi00YjBlLThkMzYtY2ZlZjJmOWM1NWY4IiwiY2hhbGxlbmdlQ29tcGxldGlvbkluZCI6IlkiLCJtZXNzYWdlVHlwZSI6IkNSZXMiLCJtZXNzYWdlVmVyc2lvbiI6IjIuMS4wIiwidGhyZWVEU1NlcnZlclRyYW5zSUQiOiI4YmZkZDQ2MC1mZDc3LTRlZWYtOWE4Ny1hOTc4ZTJlMzAzY2YiLCJ0cmFuc1N0YXR1cyI6IlkifQ%3D%3D",
			expected: {
				threeDSSessionData: "",
				cres: "eyJhY3NUcmFuc0lEIjoiZjE5MjEwMWYtYjJlYi00YjBlLThkMzYtY2ZlZjJmOWM1NWY4IiwiY2hhbGxlbmdlQ29tcGxldGlvbkluZCI6IlkiLCJtZXNzYWdlVHlwZSI6IkNSZXMiLCJtZXNzYWdlVmVyc2lvbiI6IjIuMS4wIiwidGhyZWVEU1NlcnZlclRyYW5zSUQiOiI4YmZkZDQ2MC1mZDc3LTRlZWYtOWE4Ny1hOTc4ZTJlMzAzY2YiLCJ0cmFuc1N0YXR1cyI6IlkifQ=="
			}
		},
		{
			name: "sparse arrays",
			input: "values[0]=first&values[2]=third",
			expected: { values: { 0: "first", 2: "third" } }
		},
		{ name: "duplicate keys", input: "value=first&value=second", expected: { value: "second" } }
	])("parse $name", ({ input, expected }) => expect(Search.parse(input)).toEqual(expected))
	it("parse with nested arrays", async () => {
		const result = Search.parse(
			"values[0]=first&values[1]=second&values[2]=the+third&"
				+ "nested[people][0][fname]=John&nested[people][0][lname]=Smith&"
				+ "nested[people][2][fname]=Nick&nested[people][2][lname]=Cage&"
				+ "nested[people][2][kittens][0][name]=purry&nested[people][2][kittens][0][age]=3&nested[people][2][kittens][1][name]=furry&"
				+ "nested[people][1][fname]=foo&nested[people][1][lname]=bar&"
				+ "nested[people][1][puppies][0]=snowy&nested[people][1][puppies][1]=sunny&nested[people][1][puppies][2]=rainy&nested[people][1][puppies][3]=cloudy&"
				+ "nested[groupname]=Random+People"
		)
		expect(result).toEqual({
			values: ["first", "second", "the third"],
			nested: {
				people: [
					{ fname: "John", lname: "Smith" },
					{ fname: "foo", lname: "bar", puppies: ["snowy", "sunny", "rainy", "cloudy"] },
					{ fname: "Nick", lname: "Cage", kittens: [{ name: "purry", age: "3" }, { name: "furry" }] }
				],
				groupname: "Random People"
			}
		})
	})
})
