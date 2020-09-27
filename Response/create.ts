import { Response } from "."

export function create<T>(response: Response<T> | any): Required<Response<T>> {
	if (
		typeof response.status == "number" &&
		typeof response.response == "object" &&
		response.response.status == response.status
	)
		// TODO: remove this once authly is changed to never include response property
		delete response.response
	const result: Required<Response<T>> = Response.is(response)
		? { status: 200, header: {}, body: "", ...response }
		: {
				status: (typeof response == "object" && typeof response.status == "number" && response.status) || 200,
				header:
					(response.status == 301 || response.status == 302) && response.location
						? { location: response.location }
						: {},
				body: response,
		  }
	if (!result.header.contentType)
		switch (typeof result.body) {
			default:
			case "object":
				result.header.contentType = "application/json; charset=utf-8"
				break
			case "string":
				result.header.contentType =
					result.body.slice(0, 9).toLowerCase() == "<!doctype"
						? "text/html; charset=utf-8"
						: /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/.test(result.body)
						? "application/jwt; charset=utf-8"
						: "text/plain; charset=utf-8"
				break
		}
	return result
}
