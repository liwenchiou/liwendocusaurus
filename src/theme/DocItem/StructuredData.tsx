import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useDoc} from '@docusaurus/plugin-content-docs/client';

export default function DocItemStructuredData() {
  const {siteConfig} = useDocusaurusContext();
  const {metadata, frontMatter} = useDoc();
  const url = new URL(metadata.permalink, siteConfig.url).toString();

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    '@id': url,
    mainEntityOfPage: url,
    url,
    headline: metadata.title,
    description: metadata.description,
    ...(frontMatter.keywords?.length ? {keywords: frontMatter.keywords} : {}),
    author: {
      '@type': 'Person',
      '@id': 'https://garden.liwen.studio/about#liwen-chiou',
      name: 'Liwen Chiou',
      url: 'https://garden.liwen.studio/about',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Liwen Studio',
      url: 'https://www.liwen.studio',
    },
  };

  return (
    <Head>
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
    </Head>
  );
}
