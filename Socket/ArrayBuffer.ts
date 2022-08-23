import { Message } from "./Message"
import { Socket } from "./Socket"

export class ArrayBuffer extends Socket<globalThis.ArrayBuffer> {
	protected processReceived(data: Message | any): globalThis.ArrayBuffer {
		return data?.arrayBuffer
			? data.arrayBuffer()
			: typeof data == "string"
			? new TextEncoder().encode(data).buffer
			: data
	}
	protected processSend(data: globalThis.ArrayBuffer): Message {
		return data
	}
}
