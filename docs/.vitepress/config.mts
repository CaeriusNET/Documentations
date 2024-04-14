import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
	lang: 'en-US',
	title: "CaeriusOrm",
	description: "The official CaeriusOrm documentation website",
	themeConfig: {
		// logo: '/logo.png',
		// https://vitepress.dev/reference/default-theme-config
		nav: [
			{ text: 'Home', link: '/' },
			{ text: 'Quickstart', link: '/quickstart/what-is-caeriusorm' },
			{
				text: 'Documentation',
				items: [
					{ text: 'Installation', link: '/installation' },
					{ text: 'Usage', link: '/usage' },
					{ text: 'API', link: '/api' }
				]
			},
		],

		sidebar: [
			{
				text: 'Quickstart Introduction',
				items: [
					{ text: 'What is CaeriusOrm', link: '/quickstart/what-is-caeriusorm' }
				]
			},
			{
				text: 'Documentation',
				items: [
					{ text: 'Installation', link: '/documentation/installation' },
					{ text: 'Usage', link: '/documentation/usage' },
					{ text: 'API', link: '/documentation/api' }
				]
			}
		],

		socialLinks: [
			{ icon: 'github', link: 'https://github.com/vuejs/vitepress' }
		],

		lastUpdated: {
			text: 'Updated at',
			formatOptions: {
				dateStyle: 'full',
				timeStyle: 'medium'
			}
		},

		footer: {
			message: 'CaeriusOrm is a project by Johan (AriusII) Coureuil',
			copyright: 'Copyright © 2024'
		}
	}
})
