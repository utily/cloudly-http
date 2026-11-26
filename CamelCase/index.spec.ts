import * as CamelCase from "./index"

describe("CamelCase", () => {
	it.each([
		{ name: "from", function: CamelCase.from, input: "contentType", expected: "Content-Type" },
		{ name: "to", function: CamelCase.to, input: "Content-Type", expected: "contentType" },
		{ name: "to", function: CamelCase.to, input: "content-type", expected: "contentType" },
		{ name: "from", function: CamelCase.from, input: "xRequestId", expected: "X-Request-Id" },
		{ name: "from", function: CamelCase.from, input: "contenttype", expected: "Contenttype" },
		{ name: "to", function: CamelCase.to, input: "X-Request-Id", expected: "xRequestId" },
		{ name: "to", function: CamelCase.to, input: "SEC-WEBSOCKET-ACCEPT", expected: "secWebsocketAccept" },
		{ name: "from", function: CamelCase.from, input: "xAPIKey", expected: "X-A-P-I-Key" },
		{ name: "to", function: CamelCase.to, input: "x-a-p-i-key", expected: "xAPIKey" },
		{ name: "to", function: CamelCase.to, input: "", expected: "" },
		{ name: "from", function: CamelCase.from, input: "", expected: "" },
		{ name: "from", function: CamelCase.from, input: "t", expected: "T" },
		{ name: "to", function: CamelCase.to, input: "T", expected: "t" }
	])("$name $input", ({ function: convert, input, expected }) => expect(convert(input)).toEqual(expected))
})
