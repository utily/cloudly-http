import { Message } from "./Backend/Message"
import { Socket } from "./Socket"

export class String extends Socket<string> {
	protected processReceived(data: Message | any): string {
		return data?.arrayBuffer
			? new TextDecoder().decode(data.arrayBuffer())
			: typeof data != "string"
			? new TextDecoder().decode(data)
			: data
	}
	protected processSend(data: string): string {
		return data
	}
}
