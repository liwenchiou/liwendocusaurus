import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: '設計策略',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        我們從底層邏輯出發，為您的數位產品打造穩固且具擴展性的架構藍圖。
      </>
    ),
  },
  {
    title: '技術卓越',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        追求極致的性能與代碼質量。我們利用最新的技術棧，將複雜的設計轉化為流暢的用戶體驗。
      </>
    ),
  },
  {
    title: '創新方案',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        不滿足於現狀。我們持續探索數位邊界，為您的商業挑戰提供前瞻性的解決方案。
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
