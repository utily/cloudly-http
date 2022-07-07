import { ArrayBuffer } from "./ArrayBuffer"

export class Json {
	get state(): "created" | "opened" | "closed" {
		return this.backend.state
	}
	set onMessage(value: ((data: any) => void) | undefined) {
		this.backend.onMessage = value && (data => value(JSON.parse(new TextDecoder().decode(data))))
	}
	set onClose(value: () => void) {
		this.backend.onClose = value
	}
	set onOpen(value: () => void) {
		this.backend.onOpen = value
	}
	constructor(private readonly backend: ArrayBuffer) {}
	send<T>(data: T): void {
		this.backend.send(new TextEncoder().encode(JSON.stringify(data)))
	}
}
