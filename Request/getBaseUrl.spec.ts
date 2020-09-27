import { getBaseUrl } from "./getBaseUrl"

describe("Request.getBaseUrl", () => {
	it("http://localhost:123/path/to/nothing.at.all", () =>
		expect(getBaseUrl("http://localhost:123/path/to/nothing.at.all")).toEqual("http://localhost:123"))
	it("https://www.example.com/path/to/nothing.at.all", () =>
		expect(getBaseUrl("https://www.example.com/path/to/nothing.at.all")).toEqual("https://www.example.com"))
	it("//www.example.com/path/to/nothing.at.all", () =>
		expect(getBaseUrl("//www.example.com/path/to/nothing.at.all")).toEqual("//www.example.com"))
	it("www.example.com/path/to/nothing.at.all", () =>
		expect(getBaseUrl("www.example.com/path/to/nothing.at.all")).toEqual("www.example.com"))
})
