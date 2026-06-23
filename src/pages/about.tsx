import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import styles from './about.module.css';

export default function About() {
  const [currentProject, setCurrentProject] = useState(0);
  const projects = [
    {
      title: 'ezdcbot',
      desc: <>為了解決 Serverless 環境下 Discord Bot 部署的痛點，我從零打造了這個 <strong>完全零依賴 (Zero Dependency)</strong> 的輕量級推播套件。</>,
      detail: <>捨棄笨重的 WebSocket 建立連線，改採原生 <code>fetch</code> 實作，專注於高效能的 HTTP 請求與 Thread 管理，完美適配無伺服器架構。</>,
      github: 'https://github.com/liwenchiou/ezdcbot',
      doc: '/docs/projects-business/side-projects/ezdcbot/intro'
    },
    {
      title: 'ghaction-lis',
      desc: <>為了無縫追蹤 CI/CD 部署進度，我開發了這款 <strong>終端機專用的部署監聽器</strong>，能即時解析 GitHub Actions 狀態。</>,
      detail: <>支援 PAT 認證與 CLI 自動串接，開發者能在終端機內直觀掌握部署成功或失敗原因，大幅降低在 IDE 與瀏覽器間頻繁切換的開發成本。</>,
      github: 'https://github.com/liwenchiou/ghaction-lis',
      doc: '/docs/projects-business/side-projects/ghaction-lis/intro'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentProject((prev) => (prev + 1) % projects.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [projects.length]);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "mainEntity": {
      "@type": "Person",
      "name": "Liwen Chiou",
      "jobTitle": "Digital Architect / CTO",
      "url": "https://garden.liwen.studio/about",
      "sameAs": [
        "https://github.com/liwenchiou",
        "https://www.liwen.studio"
      ],
      "knowsAbout": ["React", "Next.js", "Node.js", "System Architecture", "Software Engineering"]
    }
  };

  return (
    <Layout title="關於我" description="Liwen 的數位建築師履歷與技術棧。專注於現代網頁架構、系統設計與效能優化。">
      <Head>
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        <meta property="og:type" content="profile" />
      </Head>
      <div className={styles.container}>
        
        <header className={styles.header}>
          <h1 className={styles.title}>I'm Liwen.<br/>A Digital Architect.</h1>
          <p className={styles.subtitle}>
            將複雜的商業需求轉化為堅固、優雅的現代網頁架構。我專注於系統設計、效能優化與工程心理學的完美平衡。
          </p>
        </header>

        <main className={styles.bentoGrid}>
          
          {/* Philosophy / Intro Block */}
          <div className={`${styles.card} ${styles.philosophy}`}>
            <h2 className={styles.cardTitle}>開發哲學 (Philosophy)</h2>
            <p>
              身為一名「數位建築師」，我認為程式碼不僅是驅動機器執行的指令，更是乘載商業邏輯與團隊協作的基礎設施。
            </p>
            <p style={{ marginBottom: 0 }}>
              從 React SPA 邁向 Next.js 全端架構，我的設計理念始終是：<strong>「高內聚、低耦合」</strong>。我不盲目追求最新技術，而是根據場景選擇最穩健的工具，並透過 12 週目標管理系統，確保每個迭代都能精準交付價值。
            </p>
          </div>

          {/* Avatar Block */}
          <div className={`${styles.card} ${styles.avatarCard}`}>
            <img 
              src="https://github.com/liwenchiou.png" 
              alt="Liwen" 
              className={styles.avatar} 
            />
          </div>

          {/* Tech Stack Block */}
          <div className={`${styles.card} ${styles.techStack}`}>
            <h2 className={styles.cardTitle}>技術模組 (Stack)</h2>
            <div className={styles.tagContainer}>
              <span className={styles.tag}>React</span>
              <span className={styles.tag}>Next.js</span>
              <span className={styles.tag}>TypeScript</span>
              <span className={styles.tag}>Node.js</span>
              <span className={styles.tag}>Tailwind CSS</span>
              <span className={styles.tag}>PostgreSQL</span>
              <span className={styles.tag}>REST API</span>
              <span className={styles.tag}>Agentic AI</span>
            </div>
          </div>

          {/* Open Source Block (Deck Carousel) */}
          <div className={`${styles.card} ${styles.openSource}`} style={{ position: 'relative', padding: 0, backgroundColor: 'transparent', border: 'none' }}>
            <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '300px' }}>
              {projects.map((project, idx) => {
                const isActive = currentProject === idx;
                
                return (
                  <div 
                    key={idx}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      backgroundColor: 'var(--ifm-color-emphasis-1000)',
                      borderRadius: '16px',
                      padding: '2.5rem',
                      border: '1px solid var(--ifm-color-emphasis-800)',
                      boxShadow: isActive ? '0 10px 40px rgba(0,0,0,0.3)' : '0 4px 10px rgba(0,0,0,0.1)',
                      transform: isActive ? 'translateY(0) scale(1)' : 'translateY(18px) scale(0.95)',
                      opacity: isActive ? 1 : 0.4,
                      zIndex: isActive ? 10 : 1,
                      transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      cursor: isActive ? 'default' : 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                    onClick={() => !isActive && setCurrentProject(idx)}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 className={styles.cardTitle} style={{ marginBottom: 0 }}>開源架構: {project.title}</h2>
                        
                        {/* Pagination Dots */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {projects.map((_, dotIdx) => (
                            <div 
                              key={dotIdx}
                              onClick={(e) => { e.stopPropagation(); setCurrentProject(dotIdx); }} 
                              style={{ 
                                width: '8px', 
                                height: '8px', 
                                borderRadius: '50%', 
                                backgroundColor: currentProject === dotIdx ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-400)', 
                                cursor: 'pointer',
                                transition: 'background-color 0.3s ease'
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      
                      <div style={{ minHeight: '120px' }}>
                        <p className={styles.openSourceText}>{project.desc}</p>
                        <p className={styles.openSourceText} style={{ marginBottom: 0 }}>{project.detail}</p>
                      </div>
                    </div>
                    
                    <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1.5rem', opacity: isActive ? 1 : 0, transition: 'opacity 0.3s ease', transitionDelay: isActive ? '0.3s' : '0s' }}>
                      <a href={project.github} target="_blank" rel="noreferrer" className={styles.link} style={{ color: 'var(--ifm-color-emphasis-100)' }} onClick={e => !isActive && e.preventDefault()}>
                        GitHub ↗
                      </a>
                      <a href={project.doc} className={styles.link} style={{ color: 'var(--ifm-color-emphasis-100)' }} onClick={e => !isActive && e.preventDefault()}>
                        技術筆記 ↗
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Experience Block */}
          <div className={`${styles.card} ${styles.community}`}>
            <h2 className={styles.cardTitle}>經歷與社群 (Experience & Community)</h2>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                <div>
                  <div className={styles.listTitle}>Liwen Studio 創辦人 / 技術長</div>
                  <div className={styles.listDesc}>提供一站式技術顧問、系統規劃與軟體開發服務</div>
                </div>
                <div className={styles.listDate}>2026 - Present</div>
              </li>
              <li className={styles.listItem}>
                <div>
                  <div className={styles.listTitle}>六角學院 Node.js 直播班</div>
                  <div className={styles.listDesc}>精進後端系統設計、資料庫架構與 RESTful API 開發</div>
                </div>
                <div className={styles.listDate}>2026</div>
              </li>
              <li className={styles.listItem}>
                <div>
                  <div className={styles.listTitle}>六角學院 前端培訓班</div>
                  <div className={styles.listDesc}>完成從純前端 SPA 到現代全端架構的思維轉型</div>
                </div>
                <div className={styles.listDate}>2025</div>
              </li>
            </ul>
          </div>

        </main>

        {/* Minimal Footer */}
        <footer style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--ifm-color-emphasis-200)', display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--ifm-color-emphasis-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              Business & Consulting
            </h3>
            <a href="https://www.liwen.studio" target="_blank" rel="noreferrer" className={styles.link}>
              前往 Liwen Studio 官網 ↗
            </a>
          </div>
          <div>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--ifm-color-emphasis-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              Connect
            </h3>
            <a href="https://github.com/liwenchiou" target="_blank" rel="noreferrer" className={styles.link}>
              GitHub ↗
            </a>
          </div>
        </footer>

      </div>
    </Layout>
  );
}
