import { Message } from "./Message"
import { Socket } from "./Socket"

export class String extends Socket<string> {
	protected async processReceived(data: Message | any): Promise<string> {
		return typeof data == "string"
			? data
			: data == null
				? ""
				: typeof data.arrayBuffer == "function"
					? new TextDecoder().decode(await data.arrayBuffer())
					: new TextDecoder().decode(data)
	}
	protected processSend(data: string): string {
		return data
	}
}
