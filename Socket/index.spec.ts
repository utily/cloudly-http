import { Socket } from "../index"

class Backend {
	readonly sent: (string | ArrayBufferLike | Blob | ArrayBufferView)[] = []
	readonly closed: { code?: number; reason?: string }[] = []
	#listeners = new Map<keyof WebSocketEventMap, ((this: WebSocket, event: any) => any)[]>()
	close(code?: number, reason?: string): void {
		this.closed.push({ code, reason })
	}
	send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
		this.sent.push(data)
	}
	addEventListener<K extends keyof WebSocketEventMap>(
		type: K,
		listener: (this: WebSocket, event: WebSocketEventMap[K]) => any
	): void {
		this.#listeners.set(type, [...(this.#listeners.get(type) ?? []), listener])
	}
	emit<K extends keyof WebSocketEventMap>(type: K, event: WebSocketEventMap[K]): void {
		this.#listeners.get(type)?.forEach(listener => listener.call(this as unknown as WebSocket, event))
	}
}

describe("Socket.Factory", () => {
	it("caches sockets", () => {
		const factory = new Socket.Factory(new Backend())
		expect(factory.json).toBe(factory.json)
		expect(factory.string).toBe(factory.string)
		expect(factory.arrayBuffer).toBe(factory.arrayBuffer)
	})
	it.each([
		{ name: "default", header: undefined, expected: {} },
		{ name: "custom", header: { protocol: "example" }, expected: { protocol: "example" } }
	])("creates $name response", ({ header, expected }) => {
		const factory = new Socket.Factory(new Backend())
		expect(factory.createResponse(header)).toEqual({ status: 101, socket: factory, header: expected })
	})
	it("closes backend", () => {
		const backend = new Backend()
		new Socket.Factory(backend).close(1000, "done")
		expect(backend.closed).toEqual([{ code: 1000, reason: "done" }])
	})
})

describe("Socket", () => {
	it("queues sends until receiving data", () => {
		const backend = new Backend()
		const socket = new Socket.Factory(backend).string
		socket.send("first")
		socket.send("second")
		expect(backend.sent).toEqual([])
		backend.emit("message", { data: "received" } as MessageEvent)
		expect(backend.sent).toEqual(["first", "second"])
	})
	it("sends immediately when open", () => {
		const backend = new Backend()
		const socket = new Socket.Factory(backend, true).json
		socket.send({ value: 42 })
		expect(backend.sent).toEqual(['{"value":42}'])
	})
	it("buffers received messages", () => {
		const backend = new Backend()
		const socket = new Socket.Factory(backend, true).string
		const received: string[] = []
		backend.emit("message", { data: "first" } as MessageEvent)
		backend.emit("message", { data: "second" } as MessageEvent)
		socket.onMessage = message => received.push(message)
		backend.emit("message", { data: "third" } as MessageEvent)
		expect(received).toEqual(["first", "second", "third"])
	})
	it("handles open and close callbacks", () => {
		const backend = new Backend()
		const socket = new Socket.Factory(backend).string
		const opened = vi.fn()
		const closed = vi.fn()
		backend.emit("open", {} as Event)
		socket.onOpen = opened
		backend.emit("open", {} as Event)
		socket.onOpen = undefined
		backend.emit("close", {} as CloseEvent)
		expect(socket.state).toBe("closed")
		socket.onClose = closed
		expect(opened).toHaveBeenCalledTimes(2)
		expect(closed).toHaveBeenCalledOnce()
		backend.emit("close", {} as CloseEvent)
		socket.onClose = undefined
		expect(closed).toHaveBeenCalledTimes(2)
	})
})

describe("Socket.String", () => {
	it.each([
		{ name: "string", data: "hello" },
		{ name: "binary", data: new TextEncoder().encode("hello") },
		{ name: "blob-like", data: { arrayBuffer: () => new TextEncoder().encode("hello").buffer } }
	])("receives $name", ({ data }) => {
		const backend = new Backend()
		const socket = new Socket.Factory(backend, true).string
		const received = vi.fn()
		socket.onMessage = received
		backend.emit("message", { data } as MessageEvent)
		expect(received).toHaveBeenCalledWith("hello")
	})
})

describe("Socket.Json", () => {
	it.each([
		{ name: "string", data: '{"value":42}' },
		{ name: "binary", data: new TextEncoder().encode('{"value":42}') },
		{ name: "arrayBuffer", data: { arrayBuffer: () => new TextEncoder().encode('{"value":42}').buffer } }
	])("receives $name", ({ data }) => {
		const backend = new Backend()
		const socket = new Socket.Factory(backend, true).json
		const received = vi.fn()
		socket.onMessage = received
		backend.emit("message", { data } as MessageEvent)
		expect(received).toHaveBeenCalledWith({ value: 42 })
	})
})

describe("Socket.ArrayBuffer", () => {
	it.each([
		{ name: "string", data: "hello", expected: new TextEncoder().encode("hello").buffer },
		{ name: "binary", data: new TextEncoder().encode("hello").buffer },
		{
			name: "arrayBuffer",
			data: { arrayBuffer: () => new TextEncoder().encode("hello").buffer },
			expected: new TextEncoder().encode("hello").buffer
		}
	])("receives $name", ({ data, expected }) => {
		const backend = new Backend()
		const socket = new Socket.Factory(backend, true).arrayBuffer
		const received = vi.fn()
		socket.onMessage = received
		backend.emit("message", { data } as MessageEvent)
		expect(received).toHaveBeenCalledWith(expected ?? data)
		socket.send(received.mock.calls[0]?.[0])
		expect(backend.sent).toEqual([expected ?? data])
	})
})
