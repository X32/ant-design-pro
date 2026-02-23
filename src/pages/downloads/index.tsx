import React from 'react';
import { Helmet, history } from '@umijs/max';
import { Button } from 'antd';
import { DownloadIcon, FileIcon, FileTextIcon } from '@/components/HandDrawnIcons';
import BreadcrumbNav from '@/components/BreadcrumbNav';
import type { BreadcrumbItemProps } from '@/pages/exam-areas/types';
import logoIcon from '@/img/icon_200.png';
import './index.less';

const DownloadsPage: React.FC = () => {
  // 下载文件列表
  const downloadFiles = [
    {
      id: 1,
      name: 'KET备考偷懒包',
      description: '7个场景共约300个核心词汇，5个万能写作模板，每日40分钟训练计划，真题音频清单',
      size: '15.2 MB',
      url: '/downloads/ket-materials.zip',
      icon: <FileIcon size={64} />,
      category: 'KET',
      color: '#FFD93D'
    },
    {
      id: 2,
      name: 'PET备考偷懒包',
      description: ' 8个场景共约500个核心词汇，6个写作模板，每日40分钟训练计划，真题音频清单',
      size: '',
      url: '/downloads/pet-materials.zip',
      icon: <FileTextIcon size={64} />,
      category: 'PET',
      color: '#4ECDC4'
    },
    {
      id: 3,
      name: 'FCE备考偷懒包',
      description: '800个高频核心词汇，7种写作题型模板，30天备考计划，听力资源清单',
      size: '22.8 MB',
      url: '/downloads/fce-materials.zip',
      icon: <DownloadIcon size={64} />,
      category: 'FCE',
      color: '#FF6B6B'
    },
   
  ];

  const handleDownload = (url: string, filename: string) => {
    // 创建一个隐藏的 a 标签来触发下载
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 面包屑导航数据
  const breadcrumbItems: BreadcrumbItemProps[] = [
    { title: '首页', href: '/home' },
    { title: '资料下载' }
  ];

  return (
    <div className="downloads-page">
      {/* SEO Meta Tags */}
      <Helmet>
        <title>资料下载 - 口语魔方SpeakCube | 剑桥英语口语备考资料</title>
        <meta
          name="description"
          content="免费下载KET、PET、FCE剑桥英语口语备考资料，包含真题集、词汇表、话题解析等，助力学生高效备考。"
        />
        <meta
          name="keywords"
          content="口语魔方,资料下载,KET资料,PET资料,FCE资料,剑桥英语,口语备考"
        />
      </Helmet>

      {/* 导航栏 */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <img
              src={logoIcon}
              alt="口语魔方SpeakCube"
              className="logo-icon"
              width="48"
              height="48"
              loading="eager"
              decoding="async"
            />
            <span className="logo-text">口语魔方SpeakCube</span>
          </div>
          <ul className="nav-links">
            <li>
              <a href="/home">首页</a>
            </li>
            <li>
              <a href="/about">品牌</a>
            </li>
            <li>
              <a href="/downloads" className="active">资料</a>
            </li>
            <li>
              <a href="/ket-speaking">KET专区</a>
            </li>
            <li>
              <a href="/pet-speaking">PET专区</a>
            </li>
            <li>
              <a href="/fce-speaking">FCE专区</a>
            </li>
          </ul>
          <Button className="cta-button" onClick={() => history.push('/home')}>
            返回首页
          </Button>
        </div>
      </nav>

      {/* 面包屑导航 */}
      <BreadcrumbNav items={breadcrumbItems} />

      {/* 页面标题区域 */}
      <section className="downloads-header">
        <div className="header-content">
          <div className="header-badge">📚 资料中心</div>
          <h1 className="header-title">
            <span className="title-line">免费下载</span>
            <span className="title-line">剑桥英语口语备考资料</span>
          </h1>
          <p className="header-description">
            精心整理的KET、PET、FCE备考资料<br />
            包含真题、词汇、话题解析，助你高效备考！
          </p>
        </div>
      </section>

      {/* 下载文件列表 */}
      <section className="downloads-content">
        <div className="downloads-grid">
          {downloadFiles.map((file) => (
            <div key={file.id} className="download-card" style={{ '--card-color': file.color } as React.CSSProperties}>
              <div className="card-icon">
                {file.icon}
              </div>
              <div className="card-content">
                <div className="card-category">{file.category}</div>
                <h3 className="card-title">{file.name}</h3>
                <p className="card-description">{file.description}</p>
                <div className="card-meta">
                  {/* <span className="card-size">📦 {file.size}</span> */}
                </div>
                <Button
                  className="download-button"
                  size="large"
                  onClick={() => handleDownload(file.url, file.name + '.zip')}
                >
                  <DownloadIcon size={24} />
                  下载资料
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 温馨提示 */}
      <section className="downloads-notice">
        <div className="notice-content">
          <h2>💡 温馨提示</h2>
          <ul className="notice-list">
            <li>所有资料均为官方真题及相关学习材料，内容真实可靠</li>
            <li>建议先下载对应等级的资料包，根据学习进度选择全套资料</li>
            <li>下载过程中如遇到问题，请联系客服获取帮助</li>
            <li>资料会定期更新，请关注网站获取最新版本</li>
          </ul>
        </div>
      </section>

      {/* 返回按钮 */}
      <section className="downloads-footer">
        <Button className="back-button" size="large" onClick={() => window.location.href = '/home'}>
          返回首页
        </Button>
      </section>
    </div>
  );
};

export default DownloadsPage;
