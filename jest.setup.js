// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock environment variables for tests
process.env.GOOGLE_PROJECT_ID = 'test-project'
process.env.GOOGLE_CLIENT_EMAIL = 'test@test.com'
process.env.GOOGLE_SPREADSHEET_ID = 'test-spreadsheet-id'
process.env.GOOGLE_PRIVATE_KEY = 'test-private-key'
process.env.NODE_ENV = 'test'
