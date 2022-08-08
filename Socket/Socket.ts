import { Backend } from "./Backend"
import { Message } from "./Message"

export abstract class Socket<T = any> {
	#receiveQueue: T[] = []
	#sendQueue?: Message[] = []
	#closed = false
	#backend: Backend
	get state(): "opened" | "closed" {
		return this.#closed ? "closed" : "opened"
	}
	#onMessage?: (message: T) => void
	set onMessage(value: ((message: T) => void) | undefined) {
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
	constructor(backend: Backend, isOpen?: boolean) {
		this.#backend = backend
		if (isOpen)
			this.#sendQueue = undefined
		this.#backend.addEventListener("open", () => {
			if (this.#onOpen)
				this.#onOpen()
			this.#handleOpen.bind(this)
		})
		this.#backend.addEventListener("message", async (event: MessageEvent) => {
			const data = this.processReceived(event.data)
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
	protected abstract processReceived(data: Message): T
	protected abstract processSend(data: T): Message
	send(message: T): void {
		if (this.#sendQueue)
			this.#sendQueue.push(this.processSend(message))
		else
			this.#backend.send(this.processSend(message))
	}
}
