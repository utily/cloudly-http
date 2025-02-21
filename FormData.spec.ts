import { http } from "./index"

describe("form data", () => {
	const file = new Blob([JSON.stringify({ test: "testing", tester: "potato" }, null, 2)], { type: "application/json" })
	it("to", async () => {
		const result = http.FormData.to({ value: "value", file: file, test: "test", tester: "tester" })
		expect(result.get("")).toEqual(
			new File([new TextEncoder().encode(JSON.stringify({ value: "value", test: "test", tester: "tester" }))], "blob", {
				type: "application/json; charset=utf-8",
			})
		)
		expect(result.get("file") instanceof Blob).toEqual(true)
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
})
