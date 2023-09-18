import { Blob } from "fetch-blob"
import { File } from "fetch-blob/file"
import { FormData as Form } from "formdata-polyfill/esm.min.js"
import * as CamelCase from "./CamelCase"

globalThis.Blob = Blob
globalThis.File = File
globalThis.FormData = Form
describe("CamelCase", () => {
	it("from contentType", async () => expect(CamelCase.from("contentType")).toEqual("Content-Type"))
	it("to Content-Type", async () => expect(CamelCase.to("Content-Type")).toEqual("contentType"))
	it("to content-type", async () => expect(CamelCase.to("content-type")).toEqual("contentType"))
	it("from T", async () => expect(CamelCase.from("t")).toEqual("T"))
	it("to T", async () => expect(CamelCase.to("T")).toEqual("t"))
})
