import { Serializer } from "../index"

describe("serializer", () => {
	it("send standard form data", async () => {
		const data = new FormData()
		const file = new Blob([JSON.stringify({ test: "testing", tester: "potato" }, null, 2)], { type: "application/pdf" })
		data.append("request", "value1")
		data.append("remittanceAdvice", file)
		const result = await Serializer.serialize(data, "multipart/form-data")
		expect(result).toEqual(data)
	})
	it.each([
		{
			name: "simple object",
			data: { a: 123, b: "qwe", c: false, d: null, e: [123, 456], f: { g: 789 } },
			expected: undefined
		},
		{
			name: "nested blobs",
			data: {
				a: 123,
				b: {
					c: new Blob([new TextEncoder().encode("The Power of Attraction.")], { type: "application/octet-stream" }),
					c1: "attraction"
				},
				d: new Blob([new TextEncoder().encode("The Power of Attraction.")], { type: "application/octet-stream" })
			},
			expected: {
				"*": { a: 123, b: { c1: "attraction" } },
				"b.c": [
					84, 104, 101, 32, 80, 111, 119, 101, 114, 32, 111, 102, 32, 65, 116, 116, 114, 97, 99, 116, 105, 111, 110, 46
				],
				d: [
					84, 104, 101, 32, 80, 111, 119, 101, 114, 32, 111, 102, 32, 65, 116, 116, 114, 97, 99, 116, 105, 111, 110, 46
				]
			}
		}
	])("serialize $name", async ({ data, expected }) => {
		const serialized = await Serializer.serialize(data, "multipart/form-data")
		expect(serialized).toBeInstanceOf(FormData)
		if (expected) {
			const result = Object.fromEntries((serialized as FormData).entries())
			expect(
				Object.fromEntries(
					await Promise.all(
						Object.entries(result).map(async ([property, value]) => [
							property,
							!(value instanceof File)
								? value
								: value.type.startsWith("application/json")
									? JSON.parse(await value.text())
									: new Array(...new Uint8Array(await value.arrayBuffer()))
						])
					)
				)
			).toEqual(expected)
		}
	})
	it.each([
		{ name: "unknown content type", contentType: "application/x-unknown" },
		{ name: "missing content type", contentType: undefined }
	])("returns body for $name", async ({ contentType }) => {
		const body = { keep: true }
		expect(await Serializer.serialize(body, contentType)).toBe(body)
	})
	it("uses serializer when content type includes parameters", async () => {
		expect(await Serializer.serialize({ a: 123 }, "application/json; charset=utf-8")).toBe('{"a":123}')
	})
	it("registers serializer for multiple content types", async () => {
		const custom = async (body: any, contentType?: string) => `${contentType}:${body}`
		Serializer.add(custom, "application/vnd.serializer-test-a+json", "application/vnd.serializer-test-b+json")
		expect(await Serializer.serialize("value1", "application/vnd.serializer-test-a+json")).toBe(
			"application/vnd.serializer-test-a+json:value1"
		)
		expect(await Serializer.serialize("value2", "application/vnd.serializer-test-b+json; charset=utf-8")).toBe(
			"application/vnd.serializer-test-b+json; charset=utf-8:value2"
		)
	})
	it("uses latest serializer for same content type", async () => {
		Serializer.add(async body => `first:${body}`, "application/vnd.serializer-test-c+json")
		Serializer.add(async body => `second:${body}`, "application/vnd.serializer-test-c+json")
		expect(await Serializer.serialize("value", "application/vnd.serializer-test-c+json")).toBe("second:value")
	})
})
