import * as http from "../index"
import WebSocket from "ws"
;(global.WebSocket as any) = WebSocket

describe("Like", () => {
	it("is", () => {
		const socket = new WebSocket("wss://localhost")
		socket.onerror = error => error
		expect(http.Response.Like.is({ status: 101, webSocket: socket })).toEqual(true)
		expect(http.Response.Like.is({ status: 200, header: { contentType: "application/json" } })).toEqual(true)
	})
})
