export class ArrayBuffer {
	#receiveQueue: globalThis.ArrayBuffer[] = []
	#sendQueue?: globalThis.ArrayBuffer[] = []
	#closed = false
	#backend: WebSocket
	constructor(backend: WebSocket, isOpen?: boolean) {
		this.#backend = backend
		if (isOpen)
			this.#sendQueue = undefined
		this.#backend.addEventListener("open", () => {
			if (this.#onOpen)
				this.#onOpen()
			this.#handleOpen.bind(this)
		})
		this.#backend.addEventListener("message", async (event: MessageEvent) => {
			let data: ArrayBufferLike | Blob | string = event.data
			if (typeof data == "string")
				data = new TextEncoder().encode(data).buffer
			else if (data instanceof Blob || data?.toString() == "[object Blob]")
				data = await (data as Blob).arrayBuffer()
			console.log("received message")
			this.#handleOpen()
			if (this.#onMessage)
				this.#onMessage(data)
			else
				this.#receiveQueue?.push(data)
		})
		this.#backend.addEventListener("close", () => {
			if (this.#onClose)
				this.#onClose()
			this.#closed = true
		})
	}
	get state(): "created" | "opened" | "closed" {
		return this.#closed ? "closed" : this.#sendQueue ? "opened" : "opened"
	}
	#onMessage?: (buffer: globalThis.ArrayBuffer) => void
	set onMessage(value: ((buffer: globalThis.ArrayBuffer) => void) | undefined) {
		if (this.#receiveQueue.length && value) {
			this.#receiveQueue.forEach(value)
			this.#receiveQueue = []
		}
		this.#onMessage = value
	}
	#onClose?: () => void
	set onClose(value: (() => void) | undefined) {
		if (this.state == "closed" && value)
			value()
		this.#onClose = value
	}
	#handleOpen() {
		this.#sendQueue?.forEach(buffer => this.#backend.send(buffer))
		this.#sendQueue = undefined
	}
	#onOpen?: () => void
	set onOpen(value: (() => void) | undefined) {
		if (this.state == "opened" && value)
			value()
		this.#onOpen = value
	}
	send(buffer: globalThis.ArrayBuffer): void {
		if (this.#sendQueue)
			this.#sendQueue.push(buffer)
		else
			this.#backend.send(buffer)
	}
}
