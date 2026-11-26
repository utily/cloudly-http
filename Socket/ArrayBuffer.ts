import { Message } from "./Message"
import { Socket } from "./Socket"

export class ArrayBuffer extends Socket<globalThis.ArrayBuffer> {
	protected async processReceived(data: Message | any): Promise<globalThis.ArrayBuffer> {
		return typeof data?.arrayBuffer == "function"
			? await data.arrayBuffer()
			: typeof data == "string"
				? new TextEncoder().encode(data).buffer
				: data
	}
	protected processSend(data: globalThis.ArrayBuffer): Message {
		return data
	}
}
