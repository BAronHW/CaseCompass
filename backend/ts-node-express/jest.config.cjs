/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  rootDir: "./test",
  testEnvironment: "node",
  transform: {
    "^.+\.tsx?$": ["ts-jest",{}],
  },
};