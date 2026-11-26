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
})
