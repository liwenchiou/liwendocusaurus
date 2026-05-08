import React from 'react';
import Giscus from '@giscus/react';
import { useColorMode } from '@docusaurus/theme-common';

export default function GiscusComponent() {
  const { colorMode } = useColorMode();

  return (
    <div style={{ marginTop: '4rem', paddingBottom: 'max(env(safe-area-inset-bottom), 4rem)' }}>
      <hr style={{ opacity: 0.1, marginBottom: '2rem' }} />
      <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>💬</span> 歡迎留言討論
      </h3>
      <Giscus
        id="comments"
        repo="liwenchiou/liwendocusaurus"
        repoId="R_kgDOSWih0Q"
        category="Announcements"
        categoryId="DIC_kwDOSWih0c4C8hH1"
        mapping="pathname"
        term="Welcome to my Digital Garden!"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={colorMode === 'dark' ? 'transparent_dark' : 'light'}
        lang="zh-TW"
        loading="lazy"
      />
    </div>
  );
}
