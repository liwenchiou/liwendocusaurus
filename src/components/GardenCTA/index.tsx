import React from 'react';
import Link from '@docusaurus/Link';
import {trackEvent} from '@site/src/utils/analytics';

interface GardenCTAProps {
  title?: string;
  description?: string;
  type: 'blog' | 'doc';
}

export default function GardenCTA({ 
  title = "感謝你的閱讀！✨", 
  description = "我的數位花園紀錄了我在工程師之路上的學習點滴與生活分享。如果你覺得內容有幫助，歡迎與我交流或分享給更多人。",
  type
}: GardenCTAProps) {
  return (
    <div style={{
      marginTop: '4rem',
      padding: '2rem',
      background: 'rgba(255, 255, 255, 0.03)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '20px',
      backdropFilter: 'blur(10px)',
      textAlign: 'center',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
    }}>
      <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>{title}</h3>
      <p style={{ opacity: 0.8, marginBottom: '2rem', lineHeight: '1.6' }}>{description}</p>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <Link
          className="button button--primary button--lg"
          to={type === 'blog' ? '/blog' : '/docs'}
          style={{ borderRadius: '10px' }}
          onClick={() => trackEvent({
            event: 'cta_click',
            element_category: 'garden_cta',
            element_action: 'navigate',
            element_label: type === 'blog' ? 'back_to_blog' : 'back_to_docs',
          })}
        >
          {type === 'blog' ? '🚀 回到生活分享' : '📚 回到技術筆記'}
        </Link>
        <Link
          className="button button--secondary button--lg"
          to="https://github.com/liwenchiou"
          style={{ borderRadius: '10px' }}
          onClick={() => trackEvent({
            event: 'external_link_click',
            element_category: 'garden_cta',
            element_action: 'navigate',
            element_label: 'github_profile',
          })}
        >
          🐙 追蹤我的 GitHub
        </Link>
      </div>
    </div>
  );
}
