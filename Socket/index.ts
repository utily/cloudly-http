import { ArrayBuffer as SocketArrayBuffer } from "./ArrayBuffer"
import { Factory as SocketFactory } from "./Factory"
import { Json as SocketJson } from "./Json"
import { Socket as SocketSocket } from "./Socket"
import { String as SocketString } from "./String"

export type Socket<T = any> = SocketSocket<T>
export namespace Socket {
	export type Factory = SocketFactory
	export const Factory = SocketFactory
	export type ArrayBuffer = SocketArrayBuffer
	export type String = SocketString
	export type Json = SocketJson
}
