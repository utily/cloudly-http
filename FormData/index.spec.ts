import { http } from "../index"

describe("form data", () => {
	const file = new Blob([JSON.stringify({ test: "testing", tester: "potato" }, null, 2)])
	it("to", async () => {
		const result = http.FormData.to({ value: "value", file: file, test: "test", tester: "tester" })
		const data = result.get("*")
		expect(data).toBeInstanceOf(File)
		expect(data).toMatchObject({ name: "blob", size: 49, type: "application/json; charset=utf-8" })
		expect((data as File).lastModified).toEqual(expect.any(Number))
		expect(result.get("file") instanceof Blob).toBeTruthy()
	})
	it.each([
		{
			name: "request",
			fields: { request: "this is a test" },
			expected: { request: "this is a test", file: expect.any(File) }
		},
		{
			name: "keys",
			fields: { key1: "value1", key2: "value2" },
			expected: { key1: "value1", key2: "value2", file: expect.any(File) }
		}
	])("from $name", async ({ fields, expected }) => {
		const data = new FormData()
		for (const [key, value] of Object.entries(fields)) data.append(key, value)
		data.append("file", file)
		const result = await http.FormData.from(data)
		expect(result).toMatchObject(expected)
		expect(result.file as File).toMatchObject({ name: "blob", size: 45, type: "" })
		expect((result.file as File).lastModified).toEqual(expect.any(Number))
	})
	it("back and forth", async () => {
		const to = http.FormData.to({
			file: new File([new Uint8Array([97])], "myfile.jpeg", { type: "image/jpeg", lastModified: 1795711234526 }),
			net: [10, "EUR"],
			vat: [20, "EUR"],
			obj: { nestedNet: [10, "EUR"], nestedVat: [20, "EUR"] }
		})
		const from = await http.FormData.from(to)
		expect(from).toEqual({
			file: new File([new Uint8Array([97])], "myfile.jpeg", { type: "image/jpeg", lastModified: 1795711234526 }),
			net: [10, "EUR"],
			vat: [20, "EUR"],
			obj: { nestedNet: [10, "EUR"], nestedVat: [20, "EUR"] }
		})
	})
})
