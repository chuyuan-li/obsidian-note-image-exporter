import tseslint from 'typescript-eslint';
import obsidianmd from "eslint-plugin-obsidianmd";
import globals from "globals";
import { globalIgnores } from "eslint/config";

export default tseslint.config(
	{
		languageOptions: {
			globals: {
				...globals.browser,
			},
			parserOptions: {
				projectService: {
					allowDefaultProject: [
						'eslint.config.mts',
					]
				},
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	...obsidianmd.configs.recommended,
	{
		files: ['**/*.{ts,tsx}'],
		rules: {
			'no-undef': 'off',
		},
	},
	globalIgnores([
		"node_modules",
		"dist",
		"esbuild.config.mjs",
		"version-bump.mjs",
		"versions.json",
		"package.json",
		"package-lock.json",
		"manifest.json",
		"main.js",
		"src/i18n/i18n-react.tsx",
		"src/i18n/i18n-types.ts",
		"src/i18n/i18n-util.async.ts",
		"src/i18n/i18n-util.sync.ts",
		"src/i18n/i18n-util.ts",
	]),
);
