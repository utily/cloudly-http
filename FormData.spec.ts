import { Blob } from "fetch-blob"
import { File } from "fetch-blob/file"
import { FormData as Form } from "formdata-polyfill/esm.min.js"
import { http } from "./index"

globalThis.Blob = Blob
globalThis.File = File
globalThis.FormData = Form
describe("FormData", () => {
	it("blob", () => {
		expect(new Blob() instanceof Blob).toEqual(true)
	})
	it("to", async () => {
		let form = http.FormData.to({ a: 123, b: "qwe", c: false, d: null, e: [123, 456], f: { g: 789 } })
		let data = form.get("")
		expect(data instanceof Blob && data.type.startsWith("application/json")).toEqual(true)
		expect(JSON.parse(await (data as Blob).text())).toEqual({
			a: 123,
			b: "qwe",
			c: false,
			d: null,
			e: [123, 456],
			f: { g: 789 },
		})
		form = http.FormData.to({
			a: 123,
			b: { c: new Blob([], { type: "application/octet-stream" }) },
			d: new Blob([], { type: "application/octet-stream" }),
		})
		data = form.get("")
		expect(data instanceof Blob).toEqual(true)
		expect(JSON.parse(await (data as Blob).text())).toEqual({ a: 123, b: {} })
		data = form.get("b.c")
		expect(data instanceof Blob).toEqual(true)
		expect((data as Blob).size).toEqual(0)
		data = form.get("d")
		expect(data instanceof Blob).toEqual(true)
		expect((data as Blob).size).toEqual(0)
	})
	it("from", async () => {
		let form = new FormData()
		form.append(
			"",
			new Blob(
				[
					new TextEncoder().encode(
						JSON.stringify({
							a: 123,
							b: "qwe",
							c: false,
							d: null,
							e: [123, 456],
							f: { g: 789 },
						})
					),
				],
				{ type: "application/json" }
			)
		)
		let data = await http.FormData.from(form)
		expect(data).toEqual({
			a: 123,
			b: "qwe",
			c: false,
			d: null,
			e: [123, 456],
			f: { g: 789 },
		})
		form = new FormData()
		form.append(
			"",
			new Blob(
				[
					new TextEncoder().encode(
						JSON.stringify({
							a: { b: 123 },
						})
					),
				],
				{ type: "application/json" }
			)
		)
		form.append("a.c", new Blob([], { type: "application/octet-stream" }))
		data = await http.FormData.from(form)
		expect(data).toEqual({ a: { b: 123, c: new File([], "blob", { type: "application/octet-stream" }) } })
	})
	it("from + to", async () => {
		const form = http.FormData.to({
			a: 123,
			b: "qwe",
			c: false,
			d: null,
			e: [123, 456],
			f: { g: 789 },
			h: new Blob([]),
			i: { j: 123, k: new Blob([], { type: "application/octet-stream" }) },
		})
		const result = await http.FormData.from(form)
		expect(result).toEqual({
			a: 123,
			b: "qwe",
			c: false,
			d: null,
			e: [123, 456],
			f: { g: 789 },
			h: new File([], "blob"),
			i: { j: 123, k: new File([], "blob", { type: "application/octet-stream" }) },
		})
	})
})
