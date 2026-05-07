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
    title: '技術深耕',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        從技術底層到系統架構的實戰紀錄。我追求程式碼的品質與系統的穩定性，並把這些學習過程都記錄下來。
      </>
    ),
  },
  {
    title: '工程文化',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        除了寫程式，我也很在意人的成長。這裡會討論工程師的心理壓力、職涯發展，以及如何優化我們的工作流程。
      </>
    ),
  },
  {
    title: 'AI 協作',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        擁抱 AI 時代。透過實踐 Vibe Coding 與 AI 工具，重新定義開發流程，把時間留給更有創造力的思考。
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
