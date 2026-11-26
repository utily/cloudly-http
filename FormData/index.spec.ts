import { http } from "../index"

describe("form data", () => {
	const file = new Blob([JSON.stringify({ test: "testing", tester: "potato" }, null, 2)], { type: "application/json" })
	it("to", async () => {
		const result = http.FormData.to({ value: "value", file: file, test: "test", tester: "tester" })
		const resultFile = result.get("")
		expect(resultFile).toBeInstanceOf(File)
		expect(resultFile?.type).toBe("application/json; charset=utf-8")
		expect(await (resultFile as File).text()).toBe(JSON.stringify({ value: "value", test: "test", tester: "tester" }))
		expect(result.get("file") instanceof Blob).toBeTruthy()
	})
	it("from", async () => {
		const data = new FormData()
		data.append("request", "this is a test")
		data.append("file", file)
		const result = await http.FormData.from(data)
		expect(result).toEqual({ request: "this is a test", file: { test: "testing", tester: "potato" } })
	})
	it("from 2", async () => {
		const data = new FormData()
		data.append("key1", "value1")
		data.append("key2", "value2")
		data.append("file", file)
		const result = await http.FormData.from(data)
		expect(result).toEqual({ file: { test: "testing", tester: "potato" }, key1: "value1", key2: "value2" })
	})
	it("to handles nested arrays and nested objects", async () => {
		const attachment = new Blob(["content"], { type: "text/plain" })
		const data = { profile: { list: [1, null, { name: "potato", attachment }, [2, { nested: true }]] } }
		const result = http.FormData.to(data)
		const serialized = result.get("")
		expect(serialized).toBeInstanceOf(File)
		expect(await (serialized as File).text()).toBe(
			JSON.stringify({ profile: { list: [1, null, { name: "potato" }, [2, { nested: true }]] } })
		)
		expect(result.get("profile.list.attachment")).toBeInstanceOf(File)
	})
	it("from merges json into existing nested object", async () => {
		const data = new FormData()
		data.append("", new Blob([JSON.stringify({ ignored: true })], { type: "application/json" }))
		data.append("user.name", "Jane")
		data.append("user.preferences.theme", "dark")
		data.append(
			"user",
			new Blob([JSON.stringify({ role: "admin", preferences: { locale: "en" } })], { type: "application/json" })
		)
		const result = await http.FormData.from(data)
		expect(result).toEqual({ user: { name: "Jane", role: "admin", preferences: { theme: "dark", locale: "en" } } })
	})
	it("helpers", async () => {
		expect(http.FormData.isObject({})).toBe(true)
		expect(http.FormData.isObject([])).toBe(false)
		expect(http.FormData.isObject(null)).toBeNull()

		const data = new FormData()
		data.append("text", "value")
		data.append("json", new File([JSON.stringify({ value: 1 })], "payload.json", { type: "application/json" }))
		data.append("bytes", new File([new Uint8Array([1, 2, 3])], "payload.bin", { type: "application/octet-stream" }))
		expect(await http.FormData.toObject(data)).toEqual({ text: "value", json: { value: 1 }, bytes: [1, 2, 3] })
	})
})
