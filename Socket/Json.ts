import { ArrayBuffer } from "./ArrayBuffer"

export class Json {
	get state(): "created" | "opened" | "closed" {
		return this.backend.state
	}
	set listen(value: ((data: any) => void) | undefined) {
		this.backend.listen = value && (data => value(JSON.parse(new TextDecoder().decode(data))))
	}
	set onclose(value: () => void) {
		this.backend.onclose = value
	}
	set onopen(value: () => void) {
		this.backend.onopen = value
	}
	constructor(private readonly backend: ArrayBuffer) {}
	send<T>(data: T): void {
		this.backend.send(new TextEncoder().encode(JSON.stringify(data)))
	}
}
