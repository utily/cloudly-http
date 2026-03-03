# Cloudly HTTP

A TypeScript library for improved handling of HTTP Requests and Responses. This library provides a robust, type-safe way to make HTTP requests with features like automatic content-type handling, response parsing, and WebSocket support.

## Features

- 🔒 Type-safe HTTP client with generic error handling
- 🔄 Automatic request/response content-type parsing
- 🎯 Customizable request preprocessing and response postprocessing
- 🔑 Built-in authorization header support
- 🌐 WebSocket support with JSON, string, and ArrayBuffer messaging
- 📝 Form data and URL-encoded data handling
- 🚦 Configurable error and unauthorized request handling

## Installation

```bash
npm install cloudly-http
```

## Basic Usage

```typescript
import { Client } from "cloudly-http"

// Create a client
const client = new Client("https://api.example.com", "your-api-key")

// Make requests
const data = await client.get("/users")
const user = await client.post("/users", { name: "John" })
```

## Advanced Features

### Custom Authorization

```typescript
const client = new Client("https://api.example.com", undefined, {
	getHeader: async request => ({
		authorization: `Bearer ${await getToken()}`,
	}),
})
```

### Handle Unauthorized Requests

```typescript
const client = new Client("https://api.example.com", "initial-token", {
	onUnauthorized: async client => {
		const newToken = await refreshToken()
		client.key = newToken
		return true // retry the request
	},
})
```

### WebSocket Support

```typescript
import { Socket } from "cloudly-http"

const socket = new Socket.Json(websocket)
socket.send({ type: "message", content: "Hello!" })
```

## API Documentation

### Client

The main class for making HTTP requests:

- `get<R>(path: string, header?: Request.Header): Promise<R | Error>`
- `post<R>(path: string, request: any, header?: Request.Header): Promise<R | Error>`
- `put<R>(path: string, request: any, header?: Request.Header): Promise<R | Error>`
- `patch<R>(path: string, request: any, header?: Request.Header): Promise<R | Error>`
- `delete<R>(path: string, header?: Request.Header): Promise<R | Error>`

### Request/Response Processing

- Automatic content-type handling for common types:
  - JSON (`application/json`)
  - Form data (`multipart/form-data`)
  - URL-encoded data (`application/x-www-form-urlencoded`)
  - Plain text (`text/plain`, `text/html`)
  - PDF (`application/pdf`)

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## License

Released under the [MIT License](./LICENSE).
