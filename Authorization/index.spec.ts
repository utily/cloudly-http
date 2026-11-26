import { http } from "../index"

describe("Authorization", () => {
	it.each([
		[{ user: "user", password: "password" }, true],
		[{ bearer: "api-key" }, true],
		["api-key", true],
		[null, false],
		[{}, false]
	])("is %#", (value, expected) => expect(http.Authorization.is(value)).toBe(expected))
	it.each([
		{
			name: "serialize Basic",
			method: "serialize",
			input: { user: "user", password: "password" },
			expected: "Basic dXNlcjpwYXNzd29yZA=="
		},
		{ name: "serialize Bearer", method: "serialize", input: { bearer: "api-key" }, expected: "Bearer api-key" },
		{ name: "serialize string", method: "serialize", input: "api-key", expected: undefined },
		{
			name: "parse Basic",
			method: "parse",
			input: "Basic dXNlcjpwYXNzd29yZA==",
			expected: { user: "user", password: "password" }
		},
		{ name: "parse Bearer", method: "parse", input: "Bearer api-key", expected: { bearer: "api-key" } },
		{ name: "parse string", method: "parse", input: "api-key", expected: "api-key" }
	])("$name", ({ method, input, expected }) =>
		method == "serialize"
			? expect(http.Authorization.serialize(input)).toEqual(expected)
			: expect(http.Authorization.parse(input as string)).toEqual(expected)
	)

	describe("Bearer", () => {
		it.each([
			[{ bearer: "api-key" }, true],
			[{ bearer: "" }, true]
		])("is %#", async (value, expected) => expect(http.Authorization.Bearer.is(value)).toBe(expected))
		it.each([undefined, null, "Bearer api-key", {}, { bearer: 1 }])("is invalid %#", async value =>
			expect(http.Authorization.Bearer.is(value)).toBeFalsy()
		)
		it.each([
			[{ bearer: "api-key" }, "Bearer api-key"],
			[{ bearer: "" }, "Bearer "],
			[undefined, undefined],
			[null, undefined],
			["Bearer api-key", undefined],
			[{}, undefined],
			[{ bearer: 1 }, undefined]
		])("serialize %#", async (value, expected) => expect(http.Authorization.Bearer.serialize(value)).toBe(expected))
		it.each([
			["Bearer api-key", { bearer: "api-key" }],
			["Bearer ", { bearer: "" }],
			[undefined, undefined],
			["", undefined],
			["Bearer", undefined],
			["bearer api-key", undefined],
			["Basic dXNlcjpwYXNzd29yZA==", undefined]
		])("parse %#", async (value, expected) => expect(http.Authorization.Bearer.parse(value)).toEqual(expected))
	})
})
