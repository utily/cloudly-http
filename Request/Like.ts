import { Method } from "../Method"
import { Header } from "./Header"

export interface Like {
	method?: string | Method
	url: string | URL
	parameter?: { [key: string]: string | undefined }
	readonly search?: { readonly [key: string]: string | undefined }
	readonly remote?: string
	readonly header?: Header
	readonly body?: any | Promise<any>
}
