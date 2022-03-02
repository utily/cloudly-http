export function to(name: string): string {
	return name.toLowerCase().replace(/-[a-z]/g, match => match.substring(1).toUpperCase())
}
export function from(name: string): string {
	const result = name.replace(/[A-Z]/g, match => "-" + match)
	return result[0].toUpperCase() + result.substring(1)
}
