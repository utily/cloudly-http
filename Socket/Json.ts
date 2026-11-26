import { Message } from "./Message"
import { Socket } from "./Socket"

export class Json extends Socket<any> {
	protected async processReceived(data: Message | any): Promise<any> {
		return JSON.parse(
			typeof Blob != "undefined" && data instanceof Blob
				? await data.text()
				: data?.arrayBuffer
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
