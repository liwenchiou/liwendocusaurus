import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: "Liwen's Digital Garden",
  tagline: "技術深耕、工程文化與 AI 協作的實踐紀錄",
  favicon: "img/og-image.png",

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: "https://garden.liwen.studio",
  // Set the /<baseUrl>/ pathname under which your site is served
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "liwenchiou", // Usually your GitHub org/user name.
  projectName: "liwendocusaurus", // Usually your repo name.
  trailingSlash: false,

  onBrokenLinks: "throw",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "zh-Hant",
    locales: ["zh-Hant"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ["rss", "atom"],
            xslt: true,
          },
          // Useful options to enforce blogging best practices
          onInlineTags: "warn",
          onInlineAuthors: "warn",
          onUntruncatedBlogPosts: "warn",
          blogSidebarCount: 0,
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
        gtag: {
          trackingID: "G-Q6K8KV1028",
          anonymizeIP: true,
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: "img/og-image.png",
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    docs: {
      sidebar: {
        hideable: true,
      },
    },
    navbar: {
      title: "LW Docusaurus",
      logo: {
        alt: "LW Docusaurus Logo",
        src: "img/og-image.png",
      },
      items: [
        {
          type: "doc",
          docId: "intro",
          position: "left",
          label: "技術筆記",
        },
        { to: "/blog", label: "生活分享", position: "left" },
        { to: "/about", label: "關於我", position: "left" },
        {
          href: "https://www.liwen.studio",
          label: "Liwen Studio 官網",
          position: "right",
        },
      ],
    },
    metadata: [
      { name: 'keywords', content: '網頁開發, 全端工程師, 工程心理學, AI 協作, 12 週目標管理, Liwen Studio, 數位花園' },
      { name: 'author', content: 'Liwen Chiou' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    footer: {
      style: "dark",
      links: [
        {
          title: "技術筆記",
          items: [
            {
              label: "Next.js 30 天學習筆記",
              to: "/docs/learning/next-js-notes/day-01",
            },
            {
              label: "六角學院",
              to: "/docs/learning/hexschool/react-course/course-notes-js-fundamentals",
            },
          ],
        },
        {
          title: "生活分享",
          items: [
            {
              label: "所有文章",
              to: "/blog",
            },
          ],
        },
        {
          title: "關於我",
          items: [
            {
              label: "Liwen Studio 官網",
              href: "https://www.liwen.studio",
            },
            {
              label: "GitHub",
              href: "https://github.com/liwenchiou",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Liwen Studio. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
