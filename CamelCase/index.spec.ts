import * as CamelCase from "../CamelCase"

describe("CamelCase", () => {
	it.each([
		{ name: "from contentType", input: "contentType", convert: CamelCase.from, expected: "Content-Type" },
		{ name: "to Content-Type", input: "Content-Type", convert: CamelCase.to, expected: "contentType" },
		{ name: "to content-type", input: "content-type", convert: CamelCase.to, expected: "contentType" },
		{ name: "from T", input: "t", convert: CamelCase.from, expected: "T" },
		{ name: "to T", input: "T", convert: CamelCase.to, expected: "t" }
	])("$name", ({ input, convert, expected }) => expect(convert(input)).toEqual(expected))
})
