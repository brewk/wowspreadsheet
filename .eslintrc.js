// Documentation:
//   http://eslint.org/docs/rules/
module.exports = {
    "env": {
        "browser": true
    },
    "extends": "eslint:recommended",
    "rules": {
        // Braces should be on their own lines
        "brace-style": [
            "error",
            "allman"
        ],
        // Indent code with 4 spaces
        "indent": [
            "error",
            4,
            {
                "SwitchCase": 1,
                "MemberExpression": 1
            }
        ],
        // Objects with more than 3 properties should be on multiple lines
        "object-curly-newline": [
            "error",
            {
                "multiline": true,
                "minProperties": 3
            }
        ],
        // Objects should have spaces around curly braces for readability
        "object-curly-spacing": [
            "error",
            "always"
        ],
        // Use double quotes for strings
        "quotes": [
            "error",
            "double"
        ],
        // Always include optional semicolons
        "semi": [
            "error",
            "always"
        ],
        "default-case":            2, // Switch statements should always have a default case
        "keyword-spacing":         2, // Ensure spaces are around keywords
        "no-array-constructor":    2, // Do not allow Array(), use [] notation instead
        "no-bitwise":              2, // Disallow bitwise operators
        "no-multiple-empty-lines": 2, // Do not allow more than 2 consecutive newlines
        "curly":                   2, // Control structures should always have curly braces
        "no-extend-native":        2, // Disallow extending of native javascript objects
        "no-caller":               2, // Disallow use of caller/callee
        "no-shadow":               2, // Disallow shadowed variable declarations
        "dot-notation":            2, // Enforce dot notation when possible
    }
};
