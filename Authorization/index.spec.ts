import { Blob } from "fetch-blob"
import { File } from "fetch-blob/file"
import { FormData as Form } from "formdata-polyfill/esm.min.js"
import { http } from "../index"

globalThis.FormData = Form
globalThis.Blob = Blob
globalThis.File = File

describe("Authorization", () => {
	it("serialize Basic", async () =>
		expect(http.Authorization.serialize({ user: "user", password: "password" })).toEqual("Basic dXNlcjpwYXNzd29yZA=="))
	it("serialize Bearer", async () =>
		expect(http.Authorization.serialize({ bearer: "api-key" })).toEqual("Bearer api-key"))
	it("parse Basic", async () =>
		expect(http.Authorization.parse("Basic dXNlcjpwYXNzd29yZA==")).toEqual({ user: "user", password: "password" }))
	it("parse Bearer", async () => expect(http.Authorization.parse("Bearer api-key")).toEqual({ bearer: "api-key" }))
})
