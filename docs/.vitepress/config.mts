import { defineConfig } from 'vitepress'

export default defineConfig({
	lang: 'en-US',
	title: "Caerius.NET",
	description: "The official Caerius.NET documentation website",
	themeConfig: {
		logo: 'logo-nobg-hd.png',
		nav: [
			{ text: 'Home', link: '/' },
			{ text: 'Quickstart', link: '/quickstart/what-is-caeriusnet' },
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
					{ text: 'What is Caerius.NET', link: '/quickstart/what-is-caeriusnet' }
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
			message: 'Caerius.NET is a project by Johan (AriusII) Coureuil',
			copyright: 'Copyright © 2024'
		}
	}
})