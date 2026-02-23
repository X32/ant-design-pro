import React from 'react';
import { Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { Link } from '@umijs/max';
import type { BreadcrumbItem } from 'antd';
import './index.less';

export interface BreadcrumbItemProps {
  title: string;
  path?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItemProps[];
  className?: string;
}

/**
 * 面包屑导航组件
 * 提供结构化的页面层级导航，提升用户体验和SEO
 */
const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({ items, className }) => {
  const breadcrumbItems: BreadcrumbItem[] = [
    {
      title: (
        <span className="breadcrumb-home">
          <HomeOutlined />
          <span className="breadcrumb-text">首页</span>
        </span>
      ),
      href: '/home',
    },
    ...items.map((item, index) => ({
      title: (
        <span className="breadcrumb-item">
          {item.icon && <span className="breadcrumb-icon">{item.icon}</span>}
          <span className="breadcrumb-text">{item.title}</span>
        </span>
      ),
      href: item.path,
      ...(index === items.length - 1 && { href: undefined }), // 最后一项不可点击
    })),
  ];

  return (
    <div className={`breadcrumb-nav-container ${className || ''}`}>
      <nav aria-label="面包屑导航">
        <Breadcrumb items={breadcrumbItems} className="custom-breadcrumb" />
      </nav>
    </div>
  );
};

export default BreadcrumbNav;
