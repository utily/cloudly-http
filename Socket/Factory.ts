import { Response } from "../Response"
import { ArrayBuffer as SocketArrayBuffer } from "./ArrayBuffer"
import { Backend } from "./Backend"
import { Json as SocketJson } from "./Json"
import { String as SocketString } from "./String"

export class Factory {
	#json?: SocketJson
	get json(): SocketJson {
		if (!this.#json)
			this.#json = new SocketJson(this.backend, this.isOpen)
		return this.#json
	}
	#string?: SocketString
	get string(): SocketString {
		if (!this.#string)
			this.#string = new SocketString(this.backend, this.isOpen)
		return this.#string
	}
	#arrayBuffer?: SocketArrayBuffer
	get arrayBuffer(): SocketArrayBuffer {
		if (!this.#arrayBuffer)
			this.#arrayBuffer = new SocketArrayBuffer(this.backend, this.isOpen)
		return this.#arrayBuffer
	}
	constructor(private readonly backend: Backend, private readonly isOpen?: boolean) {}
	createResponse(header: Response.Header = {}): Response {
		return { status: 101, socket: this, header }
	}
	
	close(code?: number, reason?: string): void {
		this.backend.close(code, reason)
	}
}
