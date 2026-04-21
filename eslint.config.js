import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "off", // tsc уже проверяет
      // Намеренный паттерн "sync-ref": `someRef.current = value` в render-теле хука
      // сохраняет актуальные значения для callbacks без stale closure.
      "react-hooks/refs": "warn",
      // setState синхронно внутри эффекта используется намеренно для анимационных сбросов.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  {
    ignores: ["dist/**", "vite/**", "scripts/**", "src/editor/**"],
  },
  prettierConfig,
);
