# Contributing to `cloudly-http`

This document outlines the coding standards and guidelines for contributing to the cloudly-http project.

## Project Overview

`cloudly-http` is a TypeScript library providing improved handling of HTTP Requests and Responses. The project follows strict coding conventions to maintain consistency and quality across the utily ecosystem.

## Project Setup

1. Install dependencies:

```bash
npm install
```

2. Build the project:

```bash
npm run build
```

3. Run tests:

```bash
npm test
```

## Coding Standards

### TypeScript & Types

1. All code must be written in TypeScript
2. Keep interfaces and types minimal and focused
3. Use generics when a type needs to be flexible (e.g., `Client<Error>`)
4. Prefer interfaces for public APIs
5. Use type guards when runtime type checking is needed

Example:

```typescript
export interface Request {
	url: string
	method: Method
	header?: Request.Header
	body?: any
}

export namespace Request {
	export interface Header {
		contentType?: string
		authorization?: string
		// ...other header fields
	}

	export function create(request: Partial<Request>): Request {
		return {
			url: request.url ?? "",
			method: request.method ?? "GET",
			header: request.header,
			body: request.body,
		}
	}
}
```

### Code Structure

1. Functions should have single return points
2. Use `result` as the variable name for function return values
3. Prefer fewer lines of code over shorter lines
4. Prefer expressions over statements
5. Avoid unnecessary braces
6. Use strict equality (`===` and `!==`) only when necessary
7. Rely on TypeScript's type system for type checking

### File Organization & Structure

1. Main components:

   - Keep HTTP-related functionality in root directory (`Client.ts`, `Request.ts`, etc.)
   - Group related functionality in subdirectories (e.g., `Request/`, `Response/`, `Socket/`)
   - Use index files to re-export functionality
   - Keep directory structures shallow (max 2 levels deep)

2. Implementation files:

   - Aim to keep files under 150 lines of code
   - Each file should have a single responsibility (e.g., `Client.ts` handles HTTP client operations)
   - Split complex components into submodules (e.g., `Request/Header.ts`)
   - Keep class and interface definitions focused

3. Test files:
   - Place test files next to implementation files with `.spec.ts` extension
   - Keep test cases focused on a single behavior
   - Use descriptive test names that explain the expected behavior
   - Group related test cases using `describe` blocks

### Naming Conventions

1. No abbreviations except:

   - "UI" (uppercase because it's a two-letter multi-word abbreviation)
   - "Id" (regular casing)
   - "max"
   - "min"

2. When using abbreviations:

   - Multi-word abbreviations of 1-2 letters stay uppercase (e.g., "UI")
   - All other abbreviations follow normal casing rules regardless of word count:
     - In PascalCase: "Id", "Utf", "Iso", etc.
     - In camelCase: "id", "utf", "iso", etc.

3. Prefer single word identifiers

4. Single letter identifiers only allowed if usage is within 3 lines

5. Use descriptive and clear names for variables and functions

### Testing

1. Always import from the package's index file:

   ```typescript
   import { http } from "../index"
   ```

2. Test both success and error cases:

   ```typescript
   describe("Client", () => {
   	it("should handle successful responses", async () => {
   		const client = new Client("https://api.example.com")
   		const response = await client.get("/data")
   		expect(response).toBeDefined()
   	})

   	it("should handle authorization errors", async () => {
   		const client = new Client("https://api.example.com")
   		const response = await client.get("/protected")
   		expect(response.status).toBe(401)
   	})
   })
   ```

3. Keep test descriptions focused on behavior
4. Test files should match implementation files with `.spec.ts` extension
5. Use meaningful test data that represents real use cases

### Code Formatting

The project uses ESLint and Prettier with the following configuration:

1. Print width: 120 characters
2. Use tabs for indentation
3. No semicolons
4. Double quotes for strings
5. LF line endings

### Import Order

1. Import order is enforced by eslint-plugin-simple-import-sort
2. Imports are grouped in the following order:
   - Core/framework imports
   - External packages
   - Internal modules
   - Relative imports

## Pull Request Process

1. Create a branch for your feature/fix
2. Ensure code passes all tests: `npm test`
3. Ensure code passes linting: `npm run lint`
4. Run the verification script: `npm run verify`
5. Update documentation as needed
6. Create a pull request with a clear description

## Development Workflow

1. Build the project:

   ```bash
   npm run build
   ```

2. Run tests:

   ```bash
   npm test
   ```

3. Check and fix linting:

   ```bash
   npm run lint
   npm run fix
   ```

4. Before submitting changes:
   - Ensure all tests pass
   - Check that changes follow the coding style
   - Update documentation if needed
   - Update README.md if adding new features
   - Create or update examples if appropriate
