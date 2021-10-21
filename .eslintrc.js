module.exports = {
  root: true,
  extends: ["@inrupt/eslint-config-react"],
  rules: {
    "@typescript-eslint/ban-ts-comment": 0,
    "header/header": "off",
    "react/prop-types": "off",
    "jsx-a11y/label-has-associated-control": 0,
    "import/no-unresolved": 0,
    "no-shadow": 0,
  },
};
