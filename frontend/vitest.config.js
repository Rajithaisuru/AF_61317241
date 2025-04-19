import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true, // Enable global test functions like describe, it, expect
    environment: 'jsdom', // Use jsdom for DOM-related tests
    setupFiles: './setupTests.js', // Path to your setup file
  },
});