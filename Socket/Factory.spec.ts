import { http } from "../index"
import { ArrayBuffer as SocketArrayBuffer } from "./ArrayBuffer"
import { Json as SocketJson } from "./Json"
import { String as SocketString } from "./String"

describe("Socket.Factory", () => {
	function createBackend() {
		const listeners: Record<string, (event?: unknown) => void> = {}
		const backend = {
			close: vi.fn(),
			send: vi.fn(),
			addEventListener: vi.fn((type: string, listener: (event?: unknown) => void) => {
				listeners[type] = listener
			})
		}
		return {
			backend: backend as unknown as ConstructorParameters<typeof http.Socket.Factory>[0],
			backendMock: backend,
			listeners
		}
	}
	it("creates a WebSocket upgrade response with default header", () => {
		const { backend } = createBackend()
		const factory = new http.Socket.Factory(backend)

		expect(factory.createResponse()).toEqual({ status: 101, socket: factory, header: {} })
	})
	it("creates a WebSocket upgrade response with a custom header", () => {
		const { backend } = createBackend()
		const factory = new http.Socket.Factory(backend)
		const header = { contentType: "application/octet-stream" }

		expect(factory.createResponse(header)).toEqual({ status: 101, socket: factory, header })
	})
	it.each([
		{ name: "without arguments", code: undefined, reason: undefined },
		{ name: "with code", code: 1000, reason: undefined },
		{ name: "with code and reason", code: 1001, reason: "test complete" }
	])("closes the backend $name", ({ code, reason }) => {
		const { backend, backendMock } = createBackend()
		const factory = new http.Socket.Factory(backend)

		factory.close(code, reason)

		expect(backendMock.close).toHaveBeenCalledOnce()
		expect(backendMock.close).toHaveBeenCalledWith(code, reason)
	})
	it("creates and caches typed sockets", () => {
		const { backend } = createBackend()
		const factory = new http.Socket.Factory(backend)

		expect(factory.json).toBeInstanceOf(SocketJson)
		expect(factory.json).toBe(factory.json)
		expect(factory.string).toBeInstanceOf(SocketString)
		expect(factory.string).toBe(factory.string)
		expect(factory.arrayBuffer).toBeInstanceOf(SocketArrayBuffer)
		expect(factory.arrayBuffer).toBe(factory.arrayBuffer)
	})
	it.each([
		{ isOpen: true, name: "open" },
		{ isOpen: false, name: "closed" },
		{ isOpen: undefined, name: "without an open state" }
	])("forwards JSON sends according to $name state", ({ isOpen }) => {
		const { backend, backendMock } = createBackend()
		const factory = new http.Socket.Factory(backend, isOpen)

		factory.json.send({ value: "test" })

		if (isOpen) expect(backendMock.send).toHaveBeenCalledWith('{"value":"test"}')
		else expect(backendMock.send).not.toHaveBeenCalled()
	})
	it("sends string and array buffer values through the open socket", () => {
		const { backend, backendMock } = createBackend()
		const factory = new http.Socket.Factory(backend, true)
		const buffer = new globalThis.ArrayBuffer(3)

		factory.string.send("test")
		factory.arrayBuffer.send(buffer)

		expect(backendMock.send).toHaveBeenNthCalledWith(1, "test")
		expect(backendMock.send).toHaveBeenNthCalledWith(2, buffer)
	})
})
