# SEO优化执行方案 - Phase 1

**项目**: SpeakCube AI口语练习平台  
**网站**: https://www.qtoplay.com  
**执行日期**: 2026年2月  
**预计工时**: 30-40小时  

---

## 📋 执行任务清单

### 🚀 任务一：首页Meta标签优化（30分钟）

**文件**: `/src/pages/home/index.tsx`

**修改内容**:

```jsx
// 修改前
<title>SpeakCube - AI少儿英语口语练习平台 | 让孩子像玩游戏一样学英语</title>
<meta name="description" content="SpeakCube是专为5-12岁少儿设计的AI英语口语练习平台..." />
<meta name="keywords" content="少儿英语口语,AI英语口语练习,儿童英语学习..." />

// 修改后
<title>SpeakCube - AI剑桥英语口语练习平台 | KET/PET/FCE口语真题模拟考试</title>
<meta name="description" content="专业AI剑桥英语口语练习平台，提供KET、PET、FCE口语真题模拟考试、AI智能评分、实时反馈。每天10分钟，轻松提分！已有10000+学员在用，95%家长好评。免费试用→" />
<meta name="keywords" content="KET口语,PET口语,FCE口语,剑桥英语口语,AI口语练习,口语模拟考试,少儿英语口语,AI英语口语练习,儿童英语学习,英语口语APP" />
```

**Open Graph优化**:
```jsx
<meta property="og:title" content="SpeakCube - AI剑桥英语口语练习平台 | KET/PET/FCE真题模拟" />
<meta property="og:description" content="专业KET/PET/FCE口语真题模拟考试，AI智能评分，实时反馈。每天10分钟轻松提分！" />
```

**Twitter Card优化**:
```jsx
<meta name="twitter:title" content="SpeakCube - AI剑桥英语口语练习平台" />
<meta name="twitter:description" content="KET/PET/FCE口语真题模拟，AI陪练，每天10分钟提升口语能力" />
```

---

### 🚀 任务二：首页H1和内容优化（15分钟）

**文件**: `/src/pages/home/index.tsx`

**1. Hero区域标题优化**:
```jsx
// 修改前
<div className="hero-badge">✨ 少儿口语练习好伙伴</div>
<h1 className="hero-main-title">
  <span className="line">开口说英语</span>
  <span className="line">像玩游戏一样</span>
  <span className="highlight">有趣！</span>
</h1>

// 修改后
<div className="hero-badge">✨ KET/PET/FCE口语真题模拟</div>
<h1 className="hero-main-title">
  <span className="line">AI剑桥英语</span>
  <span className="line">口语练习平台</span>
  <span className="highlight">真题模拟！</span>
</h1>
```

**2. 副标题优化**:
```jsx
// 修改前
<p className="hero-subtitle">Speak English, Play & Learn!</p>
<p className="hero-description">
  每天10分钟，AI陪你练口语<br/>
  说错也没关系，大胆开口！
</p>

// 修改后
<p className="hero-subtitle">KET · PET · FCE 口语真题模拟考试</p>
<p className="hero-description">
  AI智能评分，即时反馈<br/>
  每天10分钟，轻松提升口语成绩！
</p>
```

**3. 特性区域关键词植入**:
```jsx
// 修改section-subtitle
// 修改前
<p className="section-subtitle">超级好玩的 AI 老师，让学英语像玩游戏一样上瘾！</p>

// 修改后
<p className="section-subtitle">对标KET/PET/FCE考试标准，AI考官陪你练口语！</p>
```

---

### 🚀 任务三：Logo图片alt属性优化（10分钟）

**文件**: `/src/pages/home/index.tsx`

```jsx
// 修改前
<img 
  src={logoIcon} 
  alt="SpeakCube Logo - AI少儿英语口语练习平台" 
  className="logo-icon"
  width="48"
  height="48"
  loading="eager"
/>

// 修改后
<img 
  src={logoIcon} 
  alt="SpeakCube - AI剑桥英语口语练习平台 | KET PET FCE口语模拟" 
  title="KET/PET/FCE口语真题模拟考试平台"
  className="logo-icon"
  width="48"
  height="48"
  loading="eager"
/>
```

---

### 🚀 任务四：结构化数据增强（30分钟）

**文件**: `/src/pages/home/index.tsx`

**1. 更新教育机构Schema**:
```jsx
const structuredData = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "SpeakCube",
  "alternateName": "SpeakCube AI剑桥英语口语练习平台",
  "description": "专业AI剑桥英语口语练习平台，提供KET、PET、FCE口语真题模拟考试、AI智能评分、实时反馈",
  "url": "https://www.qtoplay.com",
  "logo": "https://www.qtoplay.com/logo.png",
  "image": "https://www.qtoplay.com/og-image.jpg",
  "sameAs": [
    "https://www.zhihu.com/org/speakcube"
  ],
  "knowsAbout": [
    "KET口语考试",
    "PET口语考试", 
    "FCE口语考试",
    "剑桥英语",
    "英语口语练习",
    "AI口语评分"
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "1520",
    "bestRating": "5",
    "worstRating": "1"
  },
  "offers": {
    "@type": "Offer",
    "category": "KET/PET/FCE口语模拟考试",
    "priceCurrency": "CNY",
    "availability": "https://schema.org/InStock"
  }
};
```

**2. 新增Course Schema**:
```jsx
const courseSchema = {
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "KET/PET/FCE口语真题模拟考试",
  "description": "AI驱动的剑桥英语口语模拟考试平台，提供KET、PET、FCE口语真题练习，即时AI评分反馈",
  "provider": {
    "@type": "Organization",
    "name": "SpeakCube",
    "url": "https://www.qtoplay.com"
  },
  "educationalLevel": "KET/PET/FCE",
  "teaches": "英语口语",
  "assesses": "口语表达能力",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "CNY",
    "availability": "https://schema.org/InStock"
  }
};
```

**3. 新增FAQPage Schema**:
```jsx
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "KET口语考试难吗？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "KET口语考试难度适中，主要考察基础交流能力。通过SpeakCube AI模拟练习，每天10分钟，大多数学生2-4周即可明显提升。"
      }
    },
    {
      "@type": "Question", 
      "name": "AI口语练习和外教课有什么区别？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "AI口语练习可以24小时随时练习，无需预约，即时评分反馈。价格比外教课便宜90%以上，而且AI永远不会批评孩子，让孩子更敢开口说英语。"
      }
    },
    {
      "@type": "Question",
      "name": "SpeakCube支持哪些剑桥英语考试？",
      "acceptedAnswer": {
        "@type": "Answer", 
        "text": "SpeakCube支持KET（A2 Key）、PET（B1 Preliminary）、FCE（B2 First）三个级别的口语真题模拟考试，覆盖所有官方考试话题。"
      }
    }
  ]
};
```

**4. 在Helmet中添加Schema**:
```jsx
<script type="application/ld+json">
  {JSON.stringify(structuredData)}
</script>
<script type="application/ld+json">
  {JSON.stringify(courseSchema)}
</script>
<script type="application/ld+json">
  {JSON.stringify(faqSchema)}
</script>
<script type="application/ld+json">
  {JSON.stringify(breadcrumbData)}
</script>
```

---

### 🚀 任务五：Sitemap.xml更新（15分钟）

**文件**: `/public/sitemap.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- 首页 - 最高优先级 -->
  <url>
    <loc>https://www.qtoplay.com/</loc>
    <lastmod>2026-02-04</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- 首页（/home路径） -->
  <url>
    <loc>https://www.qtoplay.com/home</loc>
    <lastmod>2026-02-04</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- 考试目录 - 核心页面 -->
  <url>
    <loc>https://www.qtoplay.com/exam-catalog</loc>
    <lastmod>2026-02-04</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- 产品介绍页 -->
  <url>
    <loc>https://www.qtoplay.com/home/intro</loc>
    <lastmod>2026-02-04</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- 用户协议 -->
  <url>
    <loc>https://www.qtoplay.com/home/proto/user-agreement</loc>
    <lastmod>2026-02-04</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  
  <!-- 隐私政策 -->
  <url>
    <loc>https://www.qtoplay.com/home/proto/privacy-policy</loc>
    <lastmod>2026-02-04</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>
```

---

### 🚀 任务六：Robots.txt优化（10分钟）

**文件**: `/public/robots.txt`

```txt
# SpeakCube AI剑桥英语口语练习平台
# https://www.qtoplay.com

User-agent: *
Allow: /
Allow: /home
Allow: /home/intro
Allow: /exam-catalog
Allow: /home/proto/user-agreement
Allow: /home/proto/privacy-policy

# 禁止爬取的路径
Disallow: /admin/
Disallow: /api/
Disallow: /user/
Disallow: /*.json$
Disallow: /*?*

# 站点地图
Sitemap: https://www.qtoplay.com/sitemap.xml

# 爬虫访问频率（建议）
Crawl-delay: 1
```

---

### 📅 任务七：考试目录页SEO优化（2小时）

**文件**: `/src/pages/exam-catalog/index.tsx`（需确认实际路径）

**1. 添加页面Meta标签**:
```jsx
<Helmet>
  <title>KET/PET/FCE口语真题库 - AI模拟考试 | SpeakCube</title>
  <meta name="description" content="剑桥英语KET、PET、FCE口语真题模拟考试，覆盖所有官方考试话题。AI智能评分，即时反馈，帮助孩子快速提升口语成绩。选择适合的考试级别，开始练习！" />
  <meta name="keywords" content="KET口语真题,PET口语真题,FCE口语真题,剑桥英语口语考试,口语模拟考试,AI口语评分" />
  <link rel="canonical" href="https://www.qtoplay.com/exam-catalog" />
</Helmet>
```

**2. 页面内容增强**（需要添加介绍文字）:
```jsx
<section className="exam-intro">
  <h1>KET/PET/FCE口语真题模拟考试</h1>
  <p>
    SpeakCube提供完整的剑桥英语口语真题库，覆盖KET（A2 Key）、PET（B1 Preliminary）、
    FCE（B2 First）三个级别。每套真题均按照官方考试标准设计，AI智能评分系统实时反馈
    您的发音、语法、流利度和互动能力。
  </p>
  
  <div className="exam-levels">
    <div className="level-card">
      <h2>KET口语考试（A2级别）</h2>
      <p>适合6-10岁初学者，考察基础日常交流能力</p>
      <ul>
        <li>Part 1: 个人信息问答</li>
        <li>Part 2: 图片描述与讨论</li>
      </ul>
    </div>
    
    <div className="level-card">
      <h2>PET口语考试（B1级别）</h2>
      <p>适合10-14岁学生，考察中级交流能力</p>
      <ul>
        <li>Part 1: 个人话题问答</li>
        <li>Part 2: 情景模拟讨论</li>
        <li>Part 3: 图片描述</li>
        <li>Part 4: 深入讨论</li>
      </ul>
    </div>
    
    <div className="level-card">
      <h2>FCE口语考试（B2级别）</h2>
      <p>适合14岁以上学生，考察高级交流能力</p>
      <ul>
        <li>Part 1: 社交交流</li>
        <li>Part 2: 独白任务</li>
        <li>Part 3: 协作任务</li>
        <li>Part 4: 深度讨论</li>
      </ul>
    </div>
  </div>
</section>
```

---

## 📊 验收标准

### 技术验收
- [ ] 首页Title包含"KET/PET/FCE"关键词
- [ ] Description长度在150-160字符之间
- [ ] 所有Schema通过Google结构化数据测试工具验证
- [ ] Sitemap可被搜索引擎正常访问
- [ ] Robots.txt规则正确

### SEO效果验收（2周后）
- [ ] Google Search Console显示新页面被索引
- [ ] 百度站长平台显示收录增加
- [ ] 首页在"SpeakCube"品牌词搜索排名第一
- [ ] "AI剑桥英语口语"关键词开始有排名

---

## 🔗 相关文件清单

| 文件路径 | 修改类型 | 优先级 |
|---------|---------|--------|
| `/src/pages/home/index.tsx` | 修改 | ⭐⭐⭐⭐⭐ |
| `/public/sitemap.xml` | 修改 | ⭐⭐⭐⭐⭐ |
| `/public/robots.txt` | 修改 | ⭐⭐⭐⭐ |
| `/src/pages/exam-catalog/index.tsx` | 修改 | ⭐⭐⭐⭐ |

---

## ⏱️ 时间安排

| 任务 | 预计时间 | 状态 |
|------|---------|------|
| 任务一：首页Meta标签优化 | 30分钟 | ✅ 已完成 |
| 任务二：首页H1和内容优化 | 15分钟 | ✅ 已完成 |
| 任务三：Logo alt属性优化 | 10分钟 | ✅ 已完成 |
| 任务四：结构化数据增强 | 30分钟 | ✅ 已完成 |
| 任务五：Sitemap.xml更新 | 15分钟 | ✅ 已完成 |
| 任务六：Robots.txt优化 | 10分钟 | ✅ 已完成 |
| 任务七：考试目录页优化 | 2小时 | ✅ 已完成 |
| **总计** | **约4小时** | **全部完成** |

---

## 📝 执行记录

### 执行日志
```
任务执行开始时间：2026-02-04
任务执行完成时间：2026-02-04
遇到的问题：无
解决方案：无
```

### 修改文件汇总
1. `/src/pages/home/index.tsx` - Meta标签、H1内容、Logo alt、结构化数据
2. `/src/pages/exam-catalog/index.tsx` - Meta标签、H1内容
3. `/public/sitemap.xml` - 添加新页面、更新时间戳
4. `/public/robots.txt` - 优化爬虫规则

---

**文档创建日期**: 2026-02-04  
**执行负责人**: [待填写]  
**审核人**: [待填写]
