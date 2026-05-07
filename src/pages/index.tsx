import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          Code meets Culture. <br/> Engineering meets Life.
        </Heading>
        <p className="hero__subtitle">
          這裡是 Liwen 的數位花園。我喜歡研究網頁架構、觀察工程師的職涯心理，也會在這裡分享我如何跟 AI 協作來提升生產力。
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/next-js-notes/day-01">
            技術筆記 🛠️
          </Link>
          <Link
            className="button button--secondary button--lg"
            style={{marginLeft: '1rem'}}
            to="/blog">
            生活分享 ☕
          </Link>
        </div>
      </div>
    </header>
  );
}

function HomepageDetailedAbout() {
  return (
    <section className={styles.aboutSection}>
      <div className="container">
        <div className="row">
          <div className="col col--8 col--offset-2">
            <Heading as="h2" className="text--center margin-bottom--lg">
              Beyond the Code: 我的開發哲學
            </Heading>
            <div className={styles.aboutContent}>
              <p>
                我是一個熱衷於研究 <strong>現代網頁技術</strong> 與 <strong>系統架構</strong> 的工程師。
                在 Liwen Studio 裡，我不只希望程式碼能跑，更在意系統的穩定性與開發過程中的流暢感。
              </p>
              <p>
                從紮實的前端基礎出發，我的學習範圍也延伸到了全端開發與效能調整。我深信，一名優秀的工程師不該只是埋頭寫程式，
                還需要具備對 <strong>工程心理 (Engineering Psychology)</strong> 的洞察，理解我們如何在壓力與創新之間找到平衡。
              </p>
              <p>
                在生活中，我透過 <strong>12 週目標管理系統</strong>，努力在「週末爸爸」的家庭時光與「軟體工程師」的嚴謹工作之間取得平衡。
                對我來說，AI 不是要取代誰的工具，而是能跟我一起思考、一起 Vibe 的合作夥伴。
              </p>
              <p className={clsx('text--center', styles.italic)}>
                「寫程式不只是為了解決功能，更是為了用邏輯去梳理真實世界的複雜。」
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <HomepageDetailedAbout />
      </main>
    </Layout>
  );
}
