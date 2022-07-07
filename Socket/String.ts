import { ArrayBuffer } from "./ArrayBuffer"

export class String {
	get state(): "created" | "opened" | "closed" {
		return this.backend.state
	}
	set listen(value: ((string: string) => void) | undefined) {
		this.backend.onMessage = value && (string => value(new TextDecoder().decode(string)))
	}
	set onclose(value: () => void) {
		this.backend.onClose = value
	}
	set onopen(value: () => void) {
		this.backend.onOpen = value
	}
	constructor(private readonly backend: ArrayBuffer) {}
	send(string: string): void {
		this.backend.send(new TextEncoder().encode(string))
	}
}
