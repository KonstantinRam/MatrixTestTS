// jest.config.cjs
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'], //ts was missing somehow
    testMatch: [
        '**/__tests__/**/*.+(ts|tsx|js)',
        '**/?(*.)+(spec|test).+(ts|tsx|js)'
    ],

    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                useESM: true, // that was missing! doh
            },
        ],
    },
    extensionsToTreatAsEsm: ['.ts'],

    moduleNameMapper: {
        // for module.
        '^(\\.{1,2}/.*)\\.js$': '$1',
    }
};