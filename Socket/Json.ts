import { Message } from "./Message"
import { Socket } from "./Socket"

export class Json extends Socket<any> {
	protected processReceived(data: Message | any): any {
		return JSON.parse(
			data?.arrayBuffer
				? new TextDecoder().decode(data.arrayBuffer())
				: typeof data != "string"
				? new TextDecoder().decode(data)
				: data
		)
	}
	protected processSend(data: any): string {
		return JSON.stringify(data)
	}
}
