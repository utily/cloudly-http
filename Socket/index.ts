import { ArrayBuffer as SocketArrayBuffer } from "./ArrayBuffer"
import { Json as SocketJson } from "./Json"
import { String as SocketString } from "./String"

export class Socket {
	#json?: SocketJson
	get json(): SocketJson {
		if (!this.#json)
			this.#json = new SocketJson(this.arrayBuffer)
		return this.#json
	}

	#string?: SocketString
	get string(): SocketString {
		if (!this.#string)
			this.#string = new SocketString(this.arrayBuffer)
		return this.#string
	}

	#arrayBuffer?: SocketArrayBuffer
	get arrayBuffer(): SocketArrayBuffer {
		if (!this.#arrayBuffer)
			this.#arrayBuffer = new SocketArrayBuffer(this.socket, this.isOpen)
		return this.#arrayBuffer
	}
	constructor(private readonly socket: WebSocket, private readonly isOpen?: boolean) {}
}
export namespace Socket {
	export type ArrayBuffer = SocketArrayBuffer
	export type String = SocketString
	export type Json = SocketJson
}
