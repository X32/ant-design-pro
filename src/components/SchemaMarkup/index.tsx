/**
 * Schema Markup 组件
 * 为页面添加 Schema.org 结构化数据，优化 AI 搜索引擎引用
 *
 * @see https://schema.org/
 * @see https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
 */

import { Helmet } from '@umijs/max';
import React from 'react';

interface ArticleSchemaProps {
  /** 文章标题 */
  headline: string;
  /** 文章描述 */
  description: string;
  /** 作者名称 */
  authorName?: string;
  /** 发布日期 */
  datePublished?: string;
  /** 修改日期 */
  dateModified?: string;
  /** 页面 URL */
  url?: string;
  /** 关键词 */
  keywords?: string[];
}

/**
 * Article Schema 组件
 * 用于文章页面
 */
export const ArticleSchema: React.FC<ArticleSchemaProps> = ({
  headline,
  description,
  authorName = 'SpeakCube',
  datePublished = '2024-01-01',
  dateModified = new Date().toISOString().split('T')[0],
  url = 'https://www.speakcube.cn',
  keywords = [],
}) => {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: headline,
    description: description,
    author: {
      '@type': 'Organization',
      name: authorName,
      url: 'https://www.speakcube.cn',
    },
    publisher: {
      '@type': 'Organization',
      name: 'SpeakCube',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.speakcube.cn/logo.png',
      },
    },
    datePublished: datePublished,
    dateModified: dateModified,
    url: url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    keywords: keywords.join(', '),
    inLanguage: 'zh-CN',
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
    </Helmet>
  );
};

interface FAQSchemaProps {
  /** FAQ 问题列表 */
  questions: Array<{
    question: string;
    answer: string;
  }>;
}

/**
 * FAQPage Schema 组件
 * 用于 FAQ 页面（Perplexity 特别偏好）
 */
export const FAQSchema: React.FC<FAQSchemaProps> = ({ questions }) => {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
    </Helmet>
  );
};

interface WebPageSchemaProps {
  /** 页面名称 */
  name: string;
  /** 页面描述 */
  description: string;
  /** 页面 URL */
  url?: string;
}

/**
 * WebPage Schema 组件
 * 用于普通页面
 */
export const WebPageSchema: React.FC<WebPageSchemaProps> = ({
  name,
  description,
  url = 'https://www.speakcube.cn',
}) => {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: name,
    description: description,
    url: url,
    publisher: {
      '@type': 'Organization',
      name: 'SpeakCube',
      url: 'https://www.speakcube.cn',
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
    </Helmet>
  );
};

interface OrganizationSchemaProps {
  /** 组织名称 */
  name: string;
  /** 别名 */
  alternateName?: string;
  /** 描述 */
  description?: string;
  /** URL */
  url?: string;
  /** Logo URL */
  logoUrl?: string;
  /** 社交媒体链接 */
  sameAs?: string[];
}

/**
 * Organization Schema 组件
 * 用于组织信息
 */
export const OrganizationSchema: React.FC<OrganizationSchemaProps> = ({
  name,
  alternateName,
  description,
  url = 'https://www.speakcube.cn',
  logoUrl = 'https://www.speakcube.cn/logo.png',
  sameAs = [],
}) => {
  const schemaData: any = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: name,
    url: url,
    logo: {
      '@type': 'ImageObject',
      url: logoUrl,
    },
  };

  if (alternateName) {
    schemaData.alternateName = alternateName;
  }

  if (description) {
    schemaData.description = description;
  }

  if (sameAs.length > 0) {
    schemaData.sameAs = sameAs;
  }

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
    </Helmet>
  );
};

export default {
  ArticleSchema,
  FAQSchema,
  WebPageSchema,
  OrganizationSchema,
};
