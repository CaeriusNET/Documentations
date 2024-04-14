---
layout: home

hero:
  name: "Caerius.NET"
  text: "C# & TSQL enchanced by performance Micro-ORM"
  tagline: Stored Procedure to DTO in µseconds !
  image:
    src: /logo-nobg-hd.png
    alt: VitePress
  actions:
    - theme: brand
      text: What is Caerius.NET?
      link: /quickstart/what-is-caeriusnet
      
    - theme: alt
      text: Quickstart
      link: /quickstart/what-is-caeriusorm
      
    - theme: alt
      text: Github
      link: https://github.com/vuejs/vitepress

features:
  - icon: 🛠️
    title: Focus on Your code
    details: Create your `<i><b>Data Transfer Object</b></i>` (DTOs) from your Stored Procedures in a few lines of code.
  - icon: 🚀
    title: Map fast your Objects
    details: Map your DTOs to your objects in micro-seconds.
---

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #8f00fd 30%, #6ae8f4);

  --vp-home-hero-image-background-image: linear-gradient(-45deg, #8f00fd 50%, #6ae8f4 50%);
  --vp-home-hero-image-filter: blur(44px);
}

@media (min-width: 640px) {
  :root {
    --vp-home-hero-image-filter: blur(56px);
  }
}

@media (min-width: 960px) {
  :root {
    --vp-home-hero-image-filter: blur(68px);
  }
}
</style>