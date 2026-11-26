import { describe, expect, it, vi } from "vitest"
import { Backend } from "./Backend"
import { Message } from "./Message"
import { String as SocketString } from "./String"

class TestString extends SocketString {
	public receive(data: Message | any): Promise<string> {
		return this.processReceived(data)
	}
	public encode(data: string): string {
		return this.processSend(data)
	}
}

describe("Socket.String", () => {
	it.each([
		{ name: "empty", input: "", expected: "" },
		{ name: "Unicode", input: "Hello, 世界", expected: "Hello, 世界" }
	])("receive $name strings unchanged", async ({ input, expected }) => {
		const socket = new TestString(createBackend().backend)
		await expect(socket.receive(input)).resolves.toBe(expected)
	})
	it.each([
		{ name: "ArrayBuffer", input: () => new TextEncoder().encode("Grüße").buffer },
		{ name: "ArrayBufferView", input: () => new TextEncoder().encode("Grüße") },
		{ name: "DataView", input: () => new DataView(new TextEncoder().encode("Grüße").buffer) }
	])("receive $name", async ({ input }) => {
		const socket = new TestString(createBackend().backend)
		await expect(socket.receive(input())).resolves.toBe("Grüße")
	})
	it.each([
		{ name: "content", input: () => new Blob(["héllo"]), expected: "héllo" },
		{ name: "empty", input: () => new Blob([]), expected: "" }
	])("receive $name Blob", async ({ input, expected }) => {
		const socket = new TestString(createBackend().backend)
		await expect(socket.receive(input())).resolves.toBe(expected)
	})
	it("uses replacement characters for malformed UTF-8", async () => {
		const socket = new TestString(createBackend().backend)
		await expect(socket.receive(new Uint8Array([0xf0, 0x28, 0x8c, 0x28]))).resolves.toBe("�(�(")
	})
	it.each([
		{ name: "null", input: null },
		{ name: "undefined", input: undefined }
	])("receive $name as empty string", async ({ input }) => {
		const socket = new TestString(createBackend().backend)
		await expect(socket.receive(input)).resolves.toBe("")
	})
	it.each([
		{ name: "Unicode", input: "héllo" },
		{ name: "empty", input: "" }
	])("processSend $name unchanged", ({ input }) => {
		const socket = new TestString(createBackend().backend, true)
		expect(socket.encode(input)).toBe(input)
	})
	it("sends strings through the backend unchanged", () => {
		const { backend, sent } = createBackend()
		const socket = new TestString(backend, true)
		socket.send("héllo")
		socket.send("")
		expect(sent).toEqual(["héllo", ""])
	})
	it("delivers decoded message events through onMessage", async () => {
		const { backend, listeners } = createBackend()
		const socket = new TestString(backend, true)
		const received: string[] = []
		socket.onMessage = message => received.push(message)
		listeners.message?.({ data: new TextEncoder().encode("event ü") })
		await vi.waitFor(() => expect(received).toEqual(["event ü"]))
	})
})

function createBackend() {
	const listeners: Record<string, ((event: any) => void) | undefined> = {}
	const sent: unknown[] = []
	const backend: Backend = {
		close: vi.fn(),
		send: vi.fn((data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
			sent.push(data)
		}),
		addEventListener: vi.fn((type: string, listener: (event: any) => void) => {
			listeners[type] = listener
		}) as Backend["addEventListener"]
	}
	return { backend, listeners, sent }
}
