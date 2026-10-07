import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      // Приведения типов запрещены: только type guard'ы или явная типизация.
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/consistent-type-assertions": ["error", { assertionStyle: "never" }],
      "no-restricted-syntax": [
        "error",
        {
          selector: "ExportAllDeclaration",
          message: "Barrel-файлы экспортируют конкретные имена, без export * from.",
        },
      ],
      // FSD: импорт слайса только через его public API (index.ts) или @x.
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/(entities|features|widgets|views)/[^/]+/(?!@x/).+",
              message: "Импортируйте слайс через его public API: @/<layer>/<slice>.",
            },
            {
              regex: "^@/shared/(ui|lib)/[^/]+/.+",
              message: "Импортируйте сегмент shared через его index: @/shared/<segment>/<name>.",
            },
            {
              regex: "^@/(app|components|lib)(/|$)",
              message: "Старые пути: используйте слои FSD.",
            },
          ],
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
