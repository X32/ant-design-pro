import React, { useState } from 'react';
import { Table, Button, Input, Select, Space, Pagination, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';

const { Option } = Select;

// 模拟角色数据
const mockRoles = [
  { id: 1, name: '管理员', dataType: '全部', priceShield: '是', remark: '拥有所有权限', sort: 1, status: '启用' },
  { id: 2, name: '编辑', dataType: '文章', priceShield: '否', remark: '可编辑文章', sort: 2, status: '启用' },
  { id: 3, name: '审核员', dataType: '审核', priceShield: '是', remark: '可审核内容', sort: 3, status: '禁用' },
  { id: 4, name: '访客', dataType: '浏览', priceShield: '否', remark: '仅可浏览', sort: 4, status: '启用' },
];

const UserRoleManager: React.FC = () => {
  const [roles, setRoles] = useState(mockRoles);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 中文文本配置
  const messages = {
    title: '用户角色管理',
    search: '搜索',
    reset: '重置',
    add: '添加',
    delete: '删除',
    enable: '启用',
    disable: '禁用',
    assignFunction: '分配功能',
    assignButton: '分配按钮',
    edit: '编辑',
    id: 'ID',
    roleName: '角色名称',
    dataType: '数据类型',
    priceShield: '价格屏蔽',
    remark: '备注',
    sort: '排序',
    status: '状态',
    operation: '操作',
  };

  // 表格列配置
  const columns = [
    {
      title: (
        <Input.Checkbox
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedRows(roles.map((role) => role.id));
            } else {
              setSelectedRows([]);
            }
          }}
        />
      ),
      key: 'selection',
      render: (text: any, record: any) => (
        <Input.Checkbox
          checked={selectedRows.includes(record.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedRows([...selectedRows, record.id]);
            } else {
              setSelectedRows(selectedRows.filter((id) => id !== record.id));
            }
          }}
        />
      ),
    },
    { title: messages.id, dataIndex: 'id', key: 'id' },
    { title: messages.roleName, dataIndex: 'name', key: 'name' },
    { title: messages.dataType, dataIndex: 'dataType', key: 'dataType' },
    { title: messages.priceShield, dataIndex: 'priceShield', key: 'priceShield' },
    { title: messages.remark, dataIndex: 'remark', key: 'remark' },
    { title: messages.sort, dataIndex: 'sort', key: 'sort' },
    { title: messages.status, dataIndex: 'status', key: 'status' },
    {
      title: messages.operation,
      key: 'operation',
      render: (text: any, record: any) => (
        <Space size='middle'>
          <Button type='link' icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            {messages.edit}
          </Button>
          <Button type='link' danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
            {messages.delete}
          </Button>
          <Button type='link' onClick={() => handleAssignFunction(record)}>
            {messages.assignFunction}
          </Button>
          <Button type='link' onClick={() => handleAssignButton(record)}>
            {messages.assignButton}
          </Button>
        </Space>
      ),
    },
  ];

  // 搜索功能
  const handleSearch = () => {
    message.info(`搜索: ${searchText}`);
    // 实际应用中这里会调用API进行搜索
  };

  // 重置功能
  const handleReset = () => {
    setSearchText('');
    message.info('已重置搜索条件');
  };

  // 添加角色
  const handleAdd = () => {
    message.info('添加角色');
    // 实际应用中这里会打开添加角色的模态框
  };

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedRows.length === 0) {
      message.warning('请选择要删除的角色');
      return;
    }
    message.info(`删除角色: ${selectedRows.join(', ')}`);
    setSelectedRows([]);
    // 实际应用中这里会调用API进行批量删除
  };

  // 批量启用
  const handleBatchEnable = () => {
    if (selectedRows.length === 0) {
      message.warning('请选择要启用的角色');
      return;
    }
    message.info(`启用角色: ${selectedRows.join(', ')}`);
    setSelectedRows([]);
    // 实际应用中这里会调用API进行批量启用
  };

  // 批量禁用
  const handleBatchDisable = () => {
    if (selectedRows.length === 0) {
      message.warning('请选择要禁用的角色');
      return;
    }
    message.info(`禁用角色: ${selectedRows.join(', ')}`);
    setSelectedRows([]);
    // 实际应用中这里会调用API进行批量禁用
  };

  // 编辑角色
  const handleEdit = (record: any) => {
    message.info(`编辑角色: ${record.name}`);
    // 实际应用中这里会打开编辑角色的模态框
  };

  // 删除角色
  const handleDelete = (id: number) => {
    message.info(`删除角色: ${id}`);
    // 实际应用中这里会调用API进行删除
  };

  // 分配功能
  const handleAssignFunction = (record: any) => {
    message.info(`分配功能给角色: ${record.name}`);
    // 实际应用中这里会打开分配功能的模态框
  };

  // 分配按钮
  const handleAssignButton = (record: any) => {
    message.info(`分配按钮给角色: ${record.name}`);
    // 实际应用中这里会打开分配按钮的模态框
  };

  return (
    <div>
      <h1>{messages.title}</h1>

      {/* 搜索功能区 */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
        <Input
          placeholder={messages.search}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
        />

        <Button type='primary' onClick={handleSearch} icon={<SearchOutlined />}>
          {messages.search}
        </Button>

        <Button onClick={handleReset} icon={<ReloadOutlined />}>
          {messages.reset}
        </Button>
      </div>

      {/* 列表上方操作按钮 */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <Button type='primary' onClick={handleAdd} icon={<PlusOutlined />}>
          {messages.add}
        </Button>

        <Button danger onClick={handleBatchDelete} disabled={selectedRows.length === 0}>
          {messages.delete}
        </Button>

        <Button type='default' onClick={handleBatchEnable} disabled={selectedRows.length === 0}>
          {messages.enable}
        </Button>

        <Button type='default' onClick={handleBatchDisable} disabled={selectedRows.length === 0}>
          {messages.disable}
        </Button>
      </div>

      {/* 角色列表 */}
      <Table
        dataSource={roles}
        columns={columns}
        rowKey='id'
        pagination={false}
        bordered
      />

      {/* 分页 */}
      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={roles.length}
          onChange={(page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          }}
        />
      </div>
    </div>
  );
};

export default UserRoleManager;