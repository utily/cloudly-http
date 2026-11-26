import { FormData as HttpFormData } from "../index"

describe("form data", () => {
	const file = new Blob([JSON.stringify({ test: "testing", tester: "potato" }, null, 2)])
	it("to", async () => {
		const result = HttpFormData.to({ value: "value", file: file, test: "test", tester: "tester" })
		const data = result.get("*")
		expect(data).toBeInstanceOf(File)
		expect(data).toMatchObject({ name: "blob", size: 49, type: "application/json; charset=utf-8" })
		expect((data as File).lastModified).toEqual(expect.any(Number))
		expect(result.get("file") instanceof Blob).toBeTruthy()
	})
	it("to nested values", async () => {
		const attachment = new Blob(["attachment"], { type: "text/plain" })
		const result = HttpFormData.to({
			primitive: 0,
			enabled: false,
			missing: undefined,
			empty: null,
			nested: { value: "kept", attachment, deeper: { value: "nested" } },
			matrix: [[1, 2], [{ value: "deep" }]]
		})
		const metadata = result.get("*") as File
		expect(JSON.parse(await metadata.text())).toEqual({
			primitive: 0,
			enabled: false,
			empty: null,
			nested: { value: "kept", deeper: { value: "nested" } },
			matrix: [[1, 2], [{ value: "deep" }]]
		})
		expect(result.get("nested.attachment")).toBeInstanceOf(File)
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
		const result = await HttpFormData.from(data)
		expect(result).toMatchObject(expected)
		expect(result.file as File).toMatchObject({ name: "blob", size: 45, type: "" })
		expect((result.file as File).lastModified).toEqual(expect.any(Number))
	})
	it("from merges fields", async () => {
		const data = new FormData()
		data.append(
			"*",
			new Blob([JSON.stringify({ profile: { name: "Ada" }, retained: true, list: [1] })], { type: "application/json" })
		)
		data.append(
			"*",
			new Blob([JSON.stringify({ profile: { active: true }, list: [2], added: "value" })], {
				type: "application/json; charset=utf-8"
			})
		)
		data.append(
			"profile",
			new Blob([JSON.stringify({ location: { city: "Stockholm" } })], { type: "application/json" })
		)
		data.append("profile.note", "first")
		data.append("profile.note", "second")
		data.append("profile.avatar", file)
		data.append("payload", new Blob([JSON.stringify({ parsed: true })], { type: "application/json" }))

		const result = await HttpFormData.from(data)

		expect(result).toEqual({
			profile: { name: "Ada", active: true, location: { city: "Stockholm" }, note: "second", avatar: expect.any(File) },
			retained: true,
			list: [2],
			added: "value",
			payload: { parsed: true }
		})
	})
	it("from rejects invalid json", async () => {
		const data = new FormData()
		data.append("value", new Blob(["{"], { type: "application/json" }))
		await expect(HttpFormData.from(data)).rejects.toThrow()
	})
	it("back and forth", async () => {
		const to = HttpFormData.to({
			file: new File([new Uint8Array([97])], "myfile.jpeg", { type: "image/jpeg", lastModified: 1795711234526 }),
			net: [10, "EUR"],
			vat: [20, "EUR"],
			obj: {
				nestedNet: [10, "EUR"],
				nestedVat: [20, "EUR"],
				file: new File([new Uint8Array([98])], "nested.jpeg", { type: "image/jpeg", lastModified: 1795711234526 })
			}
		})
		const from = await HttpFormData.from(to)
		expect(from).toEqual({
			file: new File([new Uint8Array([97])], "myfile.jpeg", { type: "image/jpeg", lastModified: 1795711234526 }),
			net: [10, "EUR"],
			vat: [20, "EUR"],
			obj: {
				nestedNet: [10, "EUR"],
				nestedVat: [20, "EUR"],
				file: new File([new Uint8Array([98])], "nested.jpeg", { type: "image/jpeg", lastModified: 1795711234526 })
			}
		})
	})
	it.each([
		{ value: {}, expected: true },
		{ value: new Date(), expected: true },
		{ value: [], expected: false },
		{ value: null, expected: false },
		{ value: "value", expected: false },
		{ value: 0, expected: false }
	])("isObject $value", ({ value, expected }) => expect(Boolean(HttpFormData.isObject(value))).toBe(expected))
})
