import { Helmet } from '@umijs/max';
import React from 'react';
import type { SEOConfig } from '../types';

interface PageSEOProps {
  seo: SEOConfig;
  examType: string;
  pageTitle?: string;
}

/**
 * 子页面 SEO 头部组件
 * 用于覆盖 ExamAreaLayout 中的默认 SEO 配置
 */
const PageSEO: React.FC<PageSEOProps> = ({ seo, examType, pageTitle }) => {
  const title = pageTitle || seo.title;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={seo.keywords.join(',')} />

      {/* Open Graph / Facebook */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={seo.description} />

      {/* Twitter Card */}
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={seo.description} />

      {/* 结构化数据 - Article */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: seo.h1Title,
          description: seo.description,
          keywords: seo.keywords.join(','),
          author: {
            '@type': 'Organization',
            name: 'SpeakCube',
          },
        })}
      </script>

      {/* 结构化数据 - Breadcrumb */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: '首页',
              item: 'https://www.speakcube.cn/home',
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: `${examType}口语专区`,
              item: `https://www.speakcube.cn/${examType.toLowerCase()}-speaking`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: seo.h1Title,
            },
          ],
        })}
      </script>
    </Helmet>
  );
};

export default PageSEO;
