import type { Config } from "tailwindcss";
import { AspectUITheme, colors } from "aspect-ui/AspectUITheme";

const colorsPalette = {
	...colors,
	primary: {
		"50": "#f4f7fb",
		"100": "#e8eef6",
		"200": "#ccdceb",
		"300": "#9fc0da",
		"400": "#6b9ec5",
		"500": "#4883af",
		"600": "#366893",
		"700": "#2c5274",
		"800": "#294863",
		"900": "#263e54",
		"950": "#192838",
	},
};

const config: Config = {
	darkMode: ["class"],
	important: true,
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				background: "var(--background)",
				foreground: "var(--foreground)",
			},
		},
	},
	plugins: [],
};

export default AspectUITheme(config, colorsPalette);
