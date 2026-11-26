import { ContentType } from "./ContentType"

describe("ContentType", () => {
	it.each([
		{ name: "undefined", body: undefined, expected: undefined },
		{ name: "HTML", body: "<!doctype><html></html>", expected: "text/html; charset=utf-8" },
		{
			name: "JWT",
			body: "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.signature",
			expected: "application/jwt; charset=utf-8"
		},
		{ name: "SVG", body: `<?xml version="1.0"?><svg></svg>`, expected: "image/svg+xml" },
		{ name: "plain text", body: "not html, jwt, or svg", expected: "text/plain; charset=utf-8" },
		{ name: "PDF bytes", body: new Uint8Array([37, 80, 68, 70]), expected: "application/pdf" },
		{ name: "PDF buffer", body: new Uint8Array([37, 80, 68, 70]).buffer, expected: "application/pdf" },
		{ name: "binary bytes", body: new Uint8Array([1, 2, 3, 4]), expected: "application/octet-stream" },
		{ name: "binary buffer", body: new Uint8Array([1, 2, 3, 4]).buffer, expected: "application/octet-stream" },
		{ name: "multipart", body: { nested: { bytes: new Uint8Array([1, 2, 3]) } }, expected: "multipart/form-data" },
		{ name: "number", body: 123, expected: "application/json; charset=utf-8" },
		{ name: "null", body: null, expected: "application/json; charset=utf-8" },
		{ name: "object", body: { a: 1, b: { c: "value" } }, expected: "application/json; charset=utf-8" }
	])("deduces $name", ({ body, expected }) => expect(ContentType.deduce(body)).toEqual(expected))
})
