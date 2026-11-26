import { Backend } from "./Backend"
import { Message } from "./Message"
import { Socket } from "./Socket"

class TestBackend implements Backend {
	readonly sent: Message[] = []
	readonly closed: [number?, string?][] = []
	readonly listeners = new Map<string, (event?: any) => any>()

	close(code?: number, reason?: string): void {
		this.closed.push([code, reason])
	}
	send(data: Message): void {
		this.sent.push(data)
	}
	addEventListener<K extends keyof WebSocketEventMap>(
		type: K,
		listener: (this: WebSocket, event: WebSocketEventMap[K]) => any
	): void {
		this.listeners.set(type, event => listener.call({} as WebSocket, event))
	}
	emit(type: "open" | "message" | "close", event?: any): any {
		return this.listeners.get(type)?.(event)
	}
}

class TestSocket extends Socket<string> {
	protected processReceived(data: Message): string {
		return typeof data == "string" ? data : new TextDecoder().decode(data as ArrayBufferView)
	}
	protected processSend(data: string): Message {
		return `sent:${data}`
	}
}

describe("Socket", () => {
	it("queues sends until open", () => {
		const backend = new TestBackend()
		const socket = new TestSocket(backend)

		socket.send("first")
		socket.send("second")
		expect(backend.sent).toEqual([])

		backend.emit("open")
		expect(backend.sent).toEqual(["sent:first", "sent:second"])

		socket.send("third")
		expect(backend.sent).toEqual(["sent:first", "sent:second", "sent:third"])
	})
	it("sends immediately when created open", () => {
		const backend = new TestBackend()
		const socket = new TestSocket(backend, true)

		socket.send("direct")
		expect(backend.sent).toEqual(["sent:direct"])
	})
	it("calls open handler immediately if opened", () => {
		const backend = new TestBackend()
		const socket = new TestSocket(backend, true)
		const onOpen = vi.fn()

		socket.onOpen = onOpen
		expect(onOpen).toHaveBeenCalledOnce()

		socket.onOpen = undefined
		backend.emit("open")
		expect(onOpen).toHaveBeenCalledOnce()
	})
	it("calls open handler on open event", () => {
		const backend = new TestBackend()
		const socket = new TestSocket(backend)
		const onOpen = vi.fn()

		socket.onOpen = onOpen
		backend.emit("open")
		expect(onOpen).toHaveBeenCalledTimes(2)
	})
	it("queues messages until handler is set", async () => {
		const backend = new TestBackend()
		const socket = new TestSocket(backend)
		const onMessage = vi.fn()

		await backend.emit("message", { data: "first" })
		await backend.emit("message", { data: "second" })
		expect(onMessage).not.toHaveBeenCalled()

		socket.onMessage = onMessage
		expect(onMessage.mock.calls.map(([message]) => message)).toEqual(["first", "second"])

		await backend.emit("message", { data: "third" })
		expect(onMessage.mock.calls.map(([message]) => message)).toEqual(["first", "second", "third"])
	})
	it("does not deliver new messages after handler is removed", async () => {
		const backend = new TestBackend()
		const socket = new TestSocket(backend)
		const onMessage = vi.fn()

		await backend.emit("message", { data: "queued" })
		socket.onMessage = onMessage
		socket.onMessage = undefined
		await backend.emit("message", { data: "new" })

		expect(onMessage.mock.calls.map(([message]) => message)).toEqual(["queued"])
	})
	it("sets closed state before close handler", () => {
		const backend = new TestBackend()
		const socket = new TestSocket(backend)
		const onClose = vi.fn(() => {
			expect(socket.state).toBe("closed")
		})

		socket.onClose = onClose
		backend.emit("close")

		expect(socket.state).toBe("closed")
		expect(onClose).toHaveBeenCalledOnce()

		const lateOnClose = vi.fn()
		socket.onClose = lateOnClose
		expect(lateOnClose).toHaveBeenCalledOnce()
	})
})
