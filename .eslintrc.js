// Documentation:
//   http://eslint.org/docs/rules/
module.exports = {
    "env": {
        "browser": true
    },
    "extends": "eslint:recommended",
    "rules": {
        // Indent code with 4 spaces
        "indent": [
            "error",
            4,
            {
                "SwitchCase": 1,
                "MemberExpression": 1
            }
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
        // Braces should be on their own lines
        "brace-style": [
            "error",
            "allman"
        ],
        // Ensure spaces are around keywords
        "keyword-spacing": [
            "error"
        ],
        // Objects should have spaces around curly braces for readability
        "object-curly-spacing": [
            "error",
            "always"
        ],
        // Objects with more than 3 properties should be on multiple lines
        "object-curly-newline": [
            "error",
            {
                "multiline": true,
                "minProperties": 3
            }
        ],
        // Do not allow more than 2 consecutive newlines
        "no-multiple-empty-lines": [
            "error"
        ],
        // Do not allow Array(), use [] notation instead
        "no-array-constructor": [
            "error"
        ],
        // Switch statements should always have a default case
        "default-case": [
            "error"
        ]
    }
};
