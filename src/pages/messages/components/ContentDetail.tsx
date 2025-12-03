import React, { useState } from 'react';
import { Button, Space, Form, Input, Select, Modal, message, Descriptions } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Content, Message } from '../types';

interface ContentDetailProps {
  contents: Content[];
  selectedMessage: Message | null;
  onContentUpdate: (contents: Content[]) => void;
}

const { Option } = Select;

const ContentDetail: React.FC<ContentDetailProps> = ({ contents, selectedMessage, onContentUpdate }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [form] = Form.useForm();

  // 显示模态框
  const showModal = (content?: Content) => {
    if (content) {
      setEditingContent(content);
      form.setFieldsValue({
        content: content.content,
        contentType: content.contentType,
      });
    } else {
      setEditingContent(null);
      form.resetFields();
      form.setFieldsValue({ contentType: 'text' });
    }
    setIsModalVisible(true);
  };

  // 关闭模态框
  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingContent(null);
  };

  // 保存内容
  const handleSave = () => {
    form.validateFields().then(values => {
      let updatedContents = [...contents];
      if (editingContent) {
        // 编辑模式
        updatedContents = updatedContents.map(content =>
          content.id === editingContent.id
            ? { ...content, ...values }
            : content
        );
        message.success('内容更新成功');
      } else {
        // 添加模式
        const newContent: Content = {
          id: `CONTENT_${Date.now()}`,
          messageId: selectedMessage?.id || '',
          sequence: updatedContents.length + 1,
          ...values,
        };
        updatedContents.push(newContent);
        message.success('内容添加成功');
      }
      onContentUpdate(updatedContents);
      setIsModalVisible(false);
      setEditingContent(null);
    }).catch(errorInfo => {
      console.log('Validation failed:', errorInfo);
    });
  };

  // 删除内容
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条内容吗？',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        const updatedContents = contents.filter(content => content.id !== id);
        // 重新排序序号
        const reorderedContents = updatedContents.map((content, index) => ({
          ...content,
          sequence: index + 1,
        }));
        onContentUpdate(reorderedContents);
        message.success('内容删除成功');
      },
    });
  };

  // 渲染内容项
  const renderContentItem = (content: Content) => {
    return (
      <div key={content.id} className="content-item">
        <div className="content-header">
          <span className="sequence-number">序号: {content.sequence}</span>
          <span className={`content-type type-${content.contentType}`}>
            {content.contentType === 'text' ? '文本' :
             content.contentType === 'image' ? '图片' :
             content.contentType === 'audio' ? '音频' : '视频'}
          </span>
        </div>
        <div className="content-body">
          {content.contentType === 'image' ? (
            <img
              src={content.content}
              alt="内容图片"
              className="content-image"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHRleHQtYW5jaG9yPSJtaWRkbGUiIHg9IjEwMCIgeT0iNzUiIGZpbGw9IiM5OTkiPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
              }}
            />
          ) : (
            <div className="content-text">{content.content}</div>
          )}
        </div>
        <div className="content-footer">
          <Space size="small">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => showModal(content)}
            >
              编辑
            </Button>
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              onClick={() => handleDelete(content.id)}
            >
              删除
            </Button>
          </Space>
        </div>
      </div>
    );
  };

  // 空状态处理
  if (!selectedMessage) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📝</div>
        <div className="empty-text">请先选择中间的消息</div>
      </div>
    );
  }

  return (
    <div>
      {/* 消息基础信息 */}
      <div style={{ marginBottom: 24, padding: 16, background: '#fff', borderRadius: 4 }}>
        <Descriptions title="消息基础信息" column={1} size="small">
          <Descriptions.Item label="消息ID">{selectedMessage.id}</Descriptions.Item>
          <Descriptions.Item label="角色">
            <span className={`role-${selectedMessage.role}`}>
              {selectedMessage.role === 'user' ? '用户' :
               selectedMessage.role === 'assistant' ? '助手' : '系统'}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="序号">{selectedMessage.sequence}</Descriptions.Item>
          <Descriptions.Item label="类型">
            <span className={`type-${selectedMessage.type}`}>
              {selectedMessage.type === 'text' ? '文本' :
               selectedMessage.type === 'image' ? '图片' :
               selectedMessage.type === 'audio' ? '音频' : '视频'}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">{selectedMessage.createTime}</Descriptions.Item>
        </Descriptions>
      </div>

      {/* 内容列表标题 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h4 style={{ margin: 0 }}>内容列表 ({contents.length} 条)</h4>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          添加内容
        </Button>
      </div>

      {/* 内容列表 */}
      <div>
        {contents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <div className="empty-text">暂无内容，点击"添加内容"按钮开始创建</div>
          </div>
        ) : (
          contents.sort((a, b) => a.sequence - b.sequence).map(renderContentItem)
        )}
      </div>

      {/* 添加/编辑模态框 */}
      <Modal
        title={editingContent ? '编辑内容' : '添加内容'}
        visible={isModalVisible}
        onOk={handleSave}
        onCancel={handleCancel}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="contentType"
            label="内容类型"
            rules={[{ required: true, message: '请选择内容类型' }]}
          >
            <Select>
              <Option value="text">文本</Option>
              <Option value="image">图片</Option>
              <Option value="audio">音频</Option>
              <Option value="video">视频</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入内容' }]}
          >
            <Input.TextArea rows={4} placeholder="请输入内容" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ContentDetail;