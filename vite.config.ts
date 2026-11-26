/// <reference types="vitest/config" />
import { defineConfig } from "vite"

export default defineConfig({
	test: {
		typecheck: { tsconfig: "./tsconfig.json" },
		coverage: {
			reporter: ["text", "json", "html"],
			enabled: true,
			cleanOnRerun: true,
			thresholds: { statements: 99, branches: 95, functions: 99, lines: 99 }
		},
		globals: true,
		include: ["**/*.spec.[tj]s"],
		testTimeout: 20000,
		isolate: false,
		exclude: ["node_modules", "dist"]
	}
})
