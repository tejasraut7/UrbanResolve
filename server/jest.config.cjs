module.exports = {
  testEnvironment: "node",
  testTimeout: 30000,
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  testMatch: ["**/tests/**/*.test.js"],
  transformIgnorePatterns: [],
};