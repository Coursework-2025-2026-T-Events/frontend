import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react-dom",
              importNames: ["findDOMNode", "hydrate", "render", "unmountComponentAtNode"],
              message: "Legacy React DOM APIs are not allowed in new code. Use the React 18+/Next.js App Router APIs instead.",
            },
          ],
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "CallExpression[callee.object.name='React'][callee.property.name='createFactory']",
          message: "React.createFactory is a legacy API and must not be used.",
        },
        {
          selector: "CallExpression[callee.object.name='ReactDOM'][callee.property.name=/^(findDOMNode|hydrate|render|unmountComponentAtNode)$/]",
          message: "Legacy ReactDOM APIs are not allowed. Use Next.js App Router and modern React roots instead.",
        },
        {
          selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
          message: "dangerouslySetInnerHTML requires a documented security review and must not be introduced casually.",
        },
        {
          selector: "TSTypeReference[typeName.name='any'], TSAnyKeyword",
          message: "Avoid any in application code. Model the data explicitly or narrow unknown values.",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
