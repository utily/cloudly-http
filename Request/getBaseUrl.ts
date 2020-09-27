export function getBaseUrl(url?: string): string | undefined {
	return url && url.split("/", url.includes("//") ? 3 : 1).join("/")
}
