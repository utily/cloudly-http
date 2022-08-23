export interface Backend {
	close(code?: number, reason?: string): void
	send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void
	addEventListener<K extends keyof WebSocketEventMap>(
		type: K,
		listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any
	): void
}
