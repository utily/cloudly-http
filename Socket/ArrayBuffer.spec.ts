import { describe, expect, it, vi } from "vitest"
import { ArrayBuffer as SocketArrayBuffer } from "./ArrayBuffer"
import { Backend } from "./Backend"

function createBackend() {
	const listeners = new Map<string, (event: MessageEvent) => unknown>()
	const backend = {
		close: vi.fn(),
		send: vi.fn(),
		addEventListener(type: string, listener: (event: MessageEvent) => unknown) {
			listeners.set(type, listener)
		}
	} as unknown as Backend
	return { backend, listeners }
}

async function receive(listeners: Map<string, (event: MessageEvent) => unknown>, data: unknown) {
	await listeners.get("message")?.(new MessageEvent("message", { data }))
}

describe("Socket.ArrayBuffer", () => {
	it.each([
		{ name: "empty", input: "", expected: [] },
		{ name: "ASCII", input: "hello", expected: [104, 101, 108, 108, 111] },
		{ name: "Unicode", input: "å", expected: [195, 165] }
	])("processReceived $name strings", async ({ input, expected }) => {
		const { backend, listeners } = createBackend()
		const socket = new SocketArrayBuffer(backend, true)
		const onMessage = vi.fn()
		socket.onMessage = onMessage

		await receive(listeners, input)

		expect(onMessage).toHaveBeenCalledOnce()
		const received = onMessage.mock.calls[0]?.[0] as globalThis.ArrayBuffer
		expect(Array.from(new Uint8Array(received))).toEqual(expected)
	})
	it("processReceived preserves an ArrayBuffer", async () => {
		const { backend, listeners } = createBackend()
		const socket = new SocketArrayBuffer(backend, true)
		const onMessage = vi.fn()
		socket.onMessage = onMessage
		const input = new globalThis.ArrayBuffer(4)
		new Uint8Array(input).set([1, 2, 3, 4])

		await receive(listeners, input)

		expect(onMessage.mock.calls[0]?.[0]).toBe(input)
	})
	it("processReceived awaits arrayBuffer()", async () => {
		const { backend, listeners } = createBackend()
		const socket = new SocketArrayBuffer(backend, true)
		const onMessage = vi.fn()
		socket.onMessage = onMessage
		const input = new Blob([new Uint8Array([7, 8, 9])], { type: "application/octet-stream" })

		await receive(listeners, input)

		const received = onMessage.mock.calls[0]?.[0] as globalThis.ArrayBuffer
		expect(Array.from(new Uint8Array(received))).toEqual([7, 8, 9])
	})
	it("processSend forwards ArrayBuffer", () => {
		const { backend } = createBackend()
		const socket = new SocketArrayBuffer(backend, true)
		const input = new globalThis.ArrayBuffer(3)

		socket.send(input)

		expect(backend.send).toHaveBeenCalledWith(input)
	})
	it("queues sends until open", () => {
		const { backend, listeners } = createBackend()
		const socket = new SocketArrayBuffer(backend)
		const input = new globalThis.ArrayBuffer(2)

		socket.send(input)
		expect(backend.send).not.toHaveBeenCalled()

		listeners.get("open")?.(new MessageEvent("open"))

		expect(backend.send).toHaveBeenCalledOnce()
		expect(backend.send).toHaveBeenCalledWith(input)
		expect(socket.state).toBe("opened")
	})
	it("queues received values until onMessage is set", async () => {
		const { backend, listeners } = createBackend()
		const socket = new SocketArrayBuffer(backend, true)
		const input = new globalThis.ArrayBuffer(2)

		await receive(listeners, input)
		const onMessage = vi.fn()
		socket.onMessage = onMessage

		expect(onMessage).toHaveBeenCalledOnce()
		expect(onMessage).toHaveBeenCalledWith(input)
	})
	it("reports closed state", () => {
		const { backend, listeners } = createBackend()
		const socket = new SocketArrayBuffer(backend, true)
		const onClose = vi.fn()
		socket.onClose = onClose

		listeners.get("close")?.(new MessageEvent("close"))

		expect(onClose).toHaveBeenCalledOnce()
		expect(socket.state).toBe("closed")
	})
})
