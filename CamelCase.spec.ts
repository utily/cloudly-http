import * as CamelCase from "./CamelCase"

describe("CamelCase", () => {
	it("from contentType", async () => expect(CamelCase.from("contentType")).toEqual("Content-Type"))
	it("to Content-Type", async () => expect(CamelCase.to("Content-Type")).toEqual("contentType"))
	it("to content-type", async () => expect(CamelCase.to("content-type")).toEqual("contentType"))
	it("from T", async () => expect(CamelCase.from("t")).toEqual("T"))
	it("to T", async () => expect(CamelCase.to("T")).toEqual("t"))
})
