import React, { useState } from 'react';
import { Input, Select, DatePicker, Button, Space, Row, Col, Divider } from 'antd';
import { SearchOutlined, ReloadOutlined, ExportOutlined, DeleteOutlined } from '@ant-design/icons';
import type { RangePickerProps } from 'antd/es/date-picker';

interface SearchBarProps {
  onSearchChange: (params: any) => void;
  onExport?: () => void;
  onBatchDelete?: () => void;
}

const { Option } = Select;

const SearchBar: React.FC<SearchBarProps> = ({ onSearchChange, onExport, onBatchDelete }) => {
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [role, setRole] = useState('');
  const [dateRange, setDateRange] = useState<RangePickerProps['value']>(null);

  // 搜索
  const handleSearch = () => {
    onSearchChange({
      keyword,
      status,
      role,
      dateRange: dateRange ? [dateRange[0]?.format('YYYY-MM-DD') || '', dateRange[1]?.format('YYYY-MM-DD') || ''] : null,
    });
  };

  // 重置
  const handleReset = () => {
    setKeyword('');
    setStatus('');
    setRole('');
    setDateRange(null);
    onSearchChange({
      keyword: '',
      status: '',
      role: '',
      dateRange: null,
    });
  };

  // 导出
  const handleExport = () => {
    if (onExport) {
      onExport();
    }
  };

  // 批量删除
  const handleBatchDelete = () => {
    if (onBatchDelete) {
      onBatchDelete();
    }
  };

  return (
    <div className="search-bar">
      <Row gutter={16} align="middle">
        {/* 多维度搜索 */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <Space.Compact style={{ width: '100%' }}>
            <Input
              placeholder="搜索会话标题、消息内容、用户ID"
              prefix={<SearchOutlined />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onPressEnter={handleSearch}
            />
            <Button type="primary" onClick={handleSearch}>
              搜索
            </Button>
          </Space.Compact>
        </Col>

        {/* 多条件筛选 */}
        <Col xs={24} sm={12} md={16} lg={18}>
          <Space wrap size="small">
            <Select
              placeholder="状态"
              style={{ width: 120 }}
              value={status}
              onChange={(value) => setStatus(value)}
            >
              <Option value="active">有效</Option>
              <Option value="deleted">已删除</Option>
            </Select>

            <Select
              placeholder="角色"
              style={{ width: 120 }}
              value={role}
              onChange={(value) => setRole(value)}
            >
              <Option value="user">用户</Option>
              <Option value="assistant">助手</Option>
              <Option value="system">系统</Option>
            </Select>

            <DatePicker.RangePicker
              placeholder={['开始日期', '结束日期']}
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
              style={{ width: 280 }}
            />

            <Divider type="vertical" />

            <Button
              icon={<ReloadOutlined />}
              onClick={handleReset}
            >
              重置
            </Button>

            <Button
              icon={<ExportOutlined />}
              onClick={handleExport}
            >
              导出
            </Button>

            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleBatchDelete}
            >
              批量删除
            </Button>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default SearchBar;