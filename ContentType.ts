export namespace ContentType {
	export function deduce(body: any): string | undefined {
		let result: string | undefined
		switch (typeof body) {
			case "undefined":
				break
			default:
			case "object":
				result =
					body instanceof ArrayBuffer || ArrayBuffer.isView(body)
						? isPdf(body)
							? "application/pdf"
							: "application/octet-stream"
						: objectContainsBinary(body)
						? "multipart/form-data"
						: "application/json; charset=utf-8"
				break
			case "string":
				result =
					body.slice(0, 9).toLowerCase() == "<!doctype"
						? "text/html; charset=utf-8"
						: /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/.test(body)
						? "application/jwt; charset=utf-8"
						: /^<\?xml version=(.|\n)*\?>(.|\n)*<svg(.|\n)*<\/svg>$/.test(body)
						? "image/svg+xml"
						: "text/plain; charset=utf-8"
				break
		}
		return result
	}

	function isPdf(body: ArrayBuffer | ArrayBufferView): boolean {
		const bytes = new Uint8Array(ArrayBuffer.isView(body) ? body.buffer : body).slice(0, 4)
		return [37, 80, 68, 70].every((current, index) => current == bytes[index])
	}
	function objectContainsBinary(body: any): boolean {
		return (
			typeof body == "object" &&
			body &&
			(body instanceof Blob ||
				ArrayBuffer.isView(body) ||
				Object.entries(body).some(([_, value]) => objectContainsBinary(value)))
		)
	}
}
