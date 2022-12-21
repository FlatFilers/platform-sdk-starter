module.exports = {
    roots: ['<rootDir>/src', '<rootDir>/examples'],
    testEnvironment: 'node',
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
}
