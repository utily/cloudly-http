import { Backend } from "./Backend"
import { Json } from "./Json"
import { Message } from "./Message"

class TestJson extends Json {
	serialize(data: any): any {
		return this.processSend(data)
	}
	deserialize(data: Message): Promise<any> {
		return Promise.resolve(this.processReceived(data))
	}
}

class TestBackend implements Backend {
	sent: unknown[] = []
	private listeners: Record<string, (event: any) => void> = {}

	close(): void {}
	send(data: unknown): void {
		this.sent.push(data)
	}
	addEventListener(type: string, listener: (event: any) => void): void {
		this.listeners[type] = listener
	}
	emit(type: string, data: any): void {
		this.listeners[type]?.({ data })
	}
}

describe("Json", () => {
	const backend = { close() {}, send() {}, addEventListener() {} } as unknown as Backend
	const json = new TestJson(backend)
	it.each([
		{ data: { name: "Ada", active: true, count: 2 }, expected: '{"name":"Ada","active":true,"count":2}' },
		{ data: [1, "two", null, false], expected: '[1,"two",null,false]' },
		{ data: "hello", expected: '"hello"' },
		{ data: 42, expected: "42" },
		{ data: false, expected: "false" },
		{ data: null, expected: "null" },
		{ data: "snowman ☃", expected: '"snowman ☃"' },
		{ data: NaN, expected: "null" },
		{ data: Infinity, expected: "null" },
		{ data: undefined, expected: undefined }
	])("serializes $data", ({ data, expected }) => {
		expect(json.serialize(data)).toBe(expected)
	})
	it("throws for circular values", () => {
		const circular: { self?: unknown } = {}
		circular.self = circular
		expect(() => json.serialize(circular)).toThrow(TypeError)
	})
	it("throws for unsupported BigInt values", () => {
		expect(() => json.serialize(BigInt(9007199254740993))).toThrow(TypeError)
	})
	it.each([
		{ data: '{"name":"Ada","active":true}', expected: { name: "Ada", active: true } },
		{ data: '[1,"two",null,false]', expected: [1, "two", null, false] },
		{ data: '"hello"', expected: "hello" },
		{ data: "42", expected: 42 },
		{ data: "false", expected: false },
		{ data: "null", expected: null },
		{ data: '"snowman ☃"', expected: "snowman ☃" },
		{ data: ' \n { "value" : 7 } \t', expected: { value: 7 } }
	])("deserializes $data", async ({ data, expected }) => {
		await expect(json.deserialize(data)).resolves.toEqual(expected)
	})
	it("deserializes UTF-8 ArrayBuffers and views", async () => {
		const encoded = new TextEncoder().encode('{"value":"☃"}')
		await expect(json.deserialize(encoded.buffer)).resolves.toEqual({ value: "☃" })
		await expect(json.deserialize(encoded)).resolves.toEqual({ value: "☃" })
	})
	it("deserializes blobs", async () => {
		await expect(json.deserialize(new Blob(['{"value":"blob"}']))).resolves.toEqual({ value: "blob" })
	})
	it("throws for malformed JSON", async () => {
		await expect(json.deserialize("{invalid")).rejects.toBeInstanceOf(SyntaxError)
	})
	it("sends serialized values through the backend", () => {
		const backend = new TestBackend()
		const socket = new Json(backend, true)
		socket.send({ value: 7 })
		socket.send([1, 2, 3])
		expect(backend.sent).toEqual(['{"value":7}', "[1,2,3]"])
	})
	it("deserializes backend messages", async () => {
		const backend = new TestBackend()
		const socket = new Json(backend)
		const received: unknown[] = []
		socket.onMessage = value => received.push(value)
		backend.emit("message", '{"value":7}')
		await Promise.resolve()
		expect(received).toEqual([{ value: 7 }])
	})
})
