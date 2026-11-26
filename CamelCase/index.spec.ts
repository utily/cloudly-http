import * as CamelCase from "./CamelCase"

describe("CamelCase", () => {
	it.each([
		{ name: "from", function: CamelCase.from, input: "contentType", expected: "Content-Type" },
		{ name: "to", function: CamelCase.to, input: "Content-Type", expected: "contentType" },
		{ name: "to", function: CamelCase.to, input: "content-type", expected: "contentType" },
		{ name: "from", function: CamelCase.from, input: "t", expected: "T" },
		{ name: "to", function: CamelCase.to, input: "T", expected: "t" }
	])("$name $input", ({ function: convert, input, expected }) => expect(convert(input)).toEqual(expected))
})
