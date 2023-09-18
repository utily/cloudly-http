import { Blob } from "fetch-blob"
import { File } from "fetch-blob/file"
import { FormData as Form } from "formdata-polyfill/esm.min.js"
import { http } from "./index"

globalThis.Blob = Blob
globalThis.File = File
globalThis.FormData = Form
describe("http.Search", () => {
	it("stringify", async () => {
		const result = http.Search.stringify({ value: 1337, nested: { value: 42, string: "The power of attraction." } })
		expect(result.toString()).toEqual("value=1337&nested[value]=42&nested[string]=The%20power%20of%20attraction.")
	})
	it("stringify 2", async () => {
		const result = http.Search.stringify({
			threeDSSessionData: "",
			cres: "eyJhY3NUcmFuc0lEIjoiZjE5MjEwMWYtYjJlYi00YjBlLThkMzYtY2ZlZjJmOWM1NWY4IiwiY2hhbGxlbmdlQ29tcGxldGlvbkluZCI6IlkiLCJtZXNzYWdlVHlwZSI6IkNSZXMiLCJtZXNzYWdlVmVyc2lvbiI6IjIuMS4wIiwidGhyZWVEU1NlcnZlclRyYW5zSUQiOiI4YmZkZDQ2MC1mZDc3LTRlZWYtOWE4Ny1hOTc4ZTJlMzAzY2YiLCJ0cmFuc1N0YXR1cyI6IlkifQ==",
		})
		expect(result.toString()).toEqual(
			"threeDSSessionData=&cres=eyJhY3NUcmFuc0lEIjoiZjE5MjEwMWYtYjJlYi00YjBlLThkMzYtY2ZlZjJmOWM1NWY4IiwiY2hhbGxlbmdlQ29tcGxldGlvbkluZCI6IlkiLCJtZXNzYWdlVHlwZSI6IkNSZXMiLCJtZXNzYWdlVmVyc2lvbiI6IjIuMS4wIiwidGhyZWVEU1NlcnZlclRyYW5zSUQiOiI4YmZkZDQ2MC1mZDc3LTRlZWYtOWE4Ny1hOTc4ZTJlMzAzY2YiLCJ0cmFuc1N0YXR1cyI6IlkifQ%3D%3D"
		)
	})
	it("parse", async () => {
		const result = http.Search.parse("value=1337&nested[value]=42&nested[string]=The%20power%20of%20attraction.")
		expect(result).toEqual({ value: "1337", nested: { value: "42", string: "The power of attraction." } })
	})
	it("parse nested", async () => {
		const result = http.Search.parse(
			"value=1337&nested%5Bvalue%5D=42&nested%5Bstring%5D=The%20power%20of%20attraction.&nested%5Bobject%5D%5Bvalue%5D=Deepest%20level."
		)
		expect(result).toEqual({
			value: "1337",
			nested: { value: "42", string: "The power of attraction.", object: { value: "Deepest level." } },
		})
	})
	it("parse space seperatly +", async () => {
		const result = http.Search.parse("value=Some+nice+pants+and+an+Iphone%2B")
		expect(result).toEqual({
			value: "Some nice pants and an Iphone+",
		})
	})
	it("parse 2", async () => {
		const result = http.Search.parse(
			"threeDSSessionData=&cres=eyJhY3NUcmFuc0lEIjoiZjE5MjEwMWYtYjJlYi00YjBlLThkMzYtY2ZlZjJmOWM1NWY4IiwiY2hhbGxlbmdlQ29tcGxldGlvbkluZCI6IlkiLCJtZXNzYWdlVHlwZSI6IkNSZXMiLCJtZXNzYWdlVmVyc2lvbiI6IjIuMS4wIiwidGhyZWVEU1NlcnZlclRyYW5zSUQiOiI4YmZkZDQ2MC1mZDc3LTRlZWYtOWE4Ny1hOTc4ZTJlMzAzY2YiLCJ0cmFuc1N0YXR1cyI6IlkifQ%3D%3D"
		)
		expect(result).toEqual({
			threeDSSessionData: "",
			cres: "eyJhY3NUcmFuc0lEIjoiZjE5MjEwMWYtYjJlYi00YjBlLThkMzYtY2ZlZjJmOWM1NWY4IiwiY2hhbGxlbmdlQ29tcGxldGlvbkluZCI6IlkiLCJtZXNzYWdlVHlwZSI6IkNSZXMiLCJtZXNzYWdlVmVyc2lvbiI6IjIuMS4wIiwidGhyZWVEU1NlcnZlclRyYW5zSUQiOiI4YmZkZDQ2MC1mZDc3LTRlZWYtOWE4Ny1hOTc4ZTJlMzAzY2YiLCJ0cmFuc1N0YXR1cyI6IlkifQ==",
		})
	})
	it("parse with nested arrays", async () => {
		const result = http.Search.parse(
			"values[0]=first&values[1]=second&values[2]=the+third&" +
				"nested[people][0][fname]=John&nested[people][0][lname]=Smith&" +
				"nested[people][2][fname]=Nick&nested[people][2][lname]=Cage&" +
				"nested[people][2][kittens][0][name]=purry&nested[people][2][kittens][0][age]=3&nested[people][2][kittens][1][name]=furry&" +
				"nested[people][1][fname]=foo&nested[people][1][lname]=bar&" +
				"nested[people][1][puppies][0]=snowy&nested[people][1][puppies][1]=sunny&nested[people][1][puppies][2]=rainy&nested[people][1][puppies][3]=cloudy&" +
				"nested[groupname]=Random+People"
		)
		expect(result).toEqual({
			values: ["first", "second", "the third"],
			nested: {
				people: [
					{ fname: "John", lname: "Smith" },
					{ fname: "foo", lname: "bar", puppies: ["snowy", "sunny", "rainy", "cloudy"] },
					{ fname: "Nick", lname: "Cage", kittens: [{ name: "purry", age: "3" }, { name: "furry" }] },
				],
				groupname: "Random People",
			},
		})
	})
})
