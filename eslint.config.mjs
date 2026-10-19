import { dirname } from "path";
import { fileURLToPath } from "url";

import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

// eslint-config-next is still published as an eslintrc-style config, so it is
// pulled into flat config through FlatCompat.
const eslintConfig = [
  { ignores: [".next/**", "out/**", "build/**", "node_modules/**", "next-env.d.ts"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Import grouping and ordering convention — see "Import order" in
      // CONTRIBUTING.md. `npm run lint -- --fix` applies it automatically.
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", ["parent", "sibling", "index"]],
          pathGroups: [{ pattern: "@/**", group: "internal" }],
          pathGroupsExcludedImportTypes: ["builtin"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
    },
  },
];

export default eslintConfig;
