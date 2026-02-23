import React from 'react';
import { Card, Typography, Divider, Timeline, Alert } from 'antd';
import { BulbOutlined, RocketOutlined, CalendarOutlined, TrophyOutlined } from '@ant-design/icons';
import ExamAreaLayout from '../components/ExamAreaLayout';
import PageSEO from '../components/PageSEO';
import { EXAM_CONFIGS } from '../types';
import './pages.less';

const { Title, Paragraph, Text } = Typography;

/**
 * KET备考攻略页面
 */
const KETTips: React.FC = () => {
  const config = EXAM_CONFIGS.KET;

  return (
    <ExamAreaLayout examType="KET">
      <PageSEO seo={config.pages.tips} examType="KET" />
      <div className="exam-info-page">
        <Card className="info-card">
          <Title level={2}>
            <BulbOutlined /> KET备考攻略
          </Title>
          
          <Divider />

          <Alert
            message="备考建议"
            description="KET考试重点考察基础英语能力，建议考生每天坚持练习15-20分钟，持续2-3个月即可看到明显进步。"
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Title level={3}>
            <CalendarOutlined /> 备考时间规划
          </Title>
          
          <Timeline
            mode="left"
            items={[
              {
                label: '第1-2周',
                children: (
                  <div>
                    <Text strong>熟悉考试</Text>
                    <ul className="info-list">
                      <li>了解KET考试形式和评分标准</li>
                      <li>熟悉口语考试的两个部分</li>
                      <li>练习基本的自我介绍</li>
                      <li>积累常用词汇（约1000个）</li>
                    </ul>
                  </div>
                ),
              },
              {
                label: '第3-6周',
                children: (
                  <div>
                    <Text strong>基础训练</Text>
                    <ul className="info-list">
                      <li>每天练习Part 1个人问题回答</li>
                      <li>学习Part 2看图说话技巧</li>
                      <li>纠正发音和语调问题</li>
                      <li>扩展话题词汇量</li>
                    </ul>
                  </div>
                ),
              },
              {
                label: '第7-10周',
                children: (
                  <div>
                    <Text strong>强化练习</Text>
                    <ul className="info-list">
                      <li>完成大量真题模拟</li>
                      <li>提高回答的完整性和流利度</li>
                      <li>练习不同话题的表达</li>
                      <li>模拟考试计时训练</li>
                    </ul>
                  </div>
                ),
              },
              {
                label: '考前1-2周',
                children: (
                  <div>
                    <Text strong>冲刺复习</Text>
                    <ul className="info-list">
                      <li>每天至少1次完整模拟考试</li>
                      <li>复习常见话题和高频词汇</li>
                      <li>调整心态，保持自信</li>
                      <li>确保发音清晰流畅</li>
                    </ul>
                  </div>
                ),
              },
            ]}
          />

          <Divider />

          <Title level={3}>
            <RocketOutlined /> Part 1 备考技巧
          </Title>
          
          <Title level={4}>常见问题类型</Title>
          <ul className="info-list">
            <li><Text strong>个人信息：</Text>姓名、年龄、居住地、家庭成员</li>
            <li><Text strong>日常生活：</Text>学校、爱好、日常活动</li>
            <li><Text strong>喜好偏好：</Text>最喜欢的食物、颜色、科目等</li>
          </ul>

          <Title level={4}>回答技巧</Title>
          <ul className="info-list">
            <li>✅ 回答要完整，不要只说Yes/No</li>
            <li>✅ 适当扩展答案，添加1-2句相关内容</li>
            <li>✅ 使用简单但正确的语法结构</li>
            <li>✅ 保持语速适中，发音清晰</li>
            <li>✅ 如果没听清可以礼貌地请求重复</li>
          </ul>

          <div className="example-box">
            <Text strong>示例问题：</Text>What's your favorite subject at school?
            <br />
            <Text type="danger">❌ 差的回答：</Text>Math.
            <br />
            <Text type="success">✅ 好的回答：</Text>My favorite subject is math. I like it because it's interesting and I'm good at solving problems.
          </div>

          <Divider />

          <Title level={3}>
            <RocketOutlined /> Part 2 备考技巧
          </Title>

          <Title level={4}>答题步骤</Title>
          <ul className="info-list">
            <li>仔细观察图片，理解场景和人物</li>
            <li>快速浏览提示问题</li>
            <li>组织语言，准备开始描述</li>
            <li>按照提示卡的问题顺序回答</li>
            <li>注意与搭档互动和交流</li>
          </ul>

          <Title level={4}>描述技巧</Title>
          <ul className="info-list">
            <li>✅ 使用现在进行时描述图中正在发生的事</li>
            <li>✅ 使用"There is/are"句型描述图中物品</li>
            <li>✅ 表达个人观点时使用"I think/I like"</li>
            <li>✅ 主动询问搭档的意见增加互动</li>
            <li>✅ 保持积极的肢体语言和眼神交流</li>
          </ul>

          <Divider />

          <Title level={3}>
            <TrophyOutlined /> 高分秘诀
          </Title>
          
          <div className="tips-grid">
            <Card size="small" title="📚 词汇积累">
              <Paragraph>
                掌握1000-1500个常用词汇，特别是日常生活、学校、家庭、爱好等话题的词汇。
              </Paragraph>
            </Card>

            <Card size="small" title="🗣️ 多开口">
              <Paragraph>
                每天至少练习15分钟口语，可以对着镜子练习或使用SpeakCube AI陪练。
              </Paragraph>
            </Card>

            <Card size="small" title="👂 多听多模仿">
              <Paragraph>
                听英语儿歌、看英语动画片，模仿标准发音和语调。
              </Paragraph>
            </Card>

            <Card size="small" title="💪 保持自信">
              <Paragraph>
                不要害怕犯错，保持微笑和自信的态度，这会给考官留下好印象。
              </Paragraph>
            </Card>

            <Card size="small" title="⏰ 控制时间">
              <Paragraph>
                回答要充分但不要太长，Part 1每个问题约15-20秒，Part 2总共5-6分钟。
              </Paragraph>
            </Card>

            <Card size="small" title="🎯 针对性训练">
              <Paragraph>
                使用SpeakCube的AI评分功能，找出薄弱环节进行针对性练习。
              </Paragraph>
            </Card>
          </div>

          <Divider />

          <Title level={3}>考试当天注意事项</Title>
          <ul className="info-list">
            <li>✅ 提前到达考场，熟悉环境</li>
            <li>✅ 携带准考证和有效身份证件</li>
            <li>✅ 穿着舒适得体的服装</li>
            <li>✅ 保持放松的心态，相信自己</li>
            <li>✅ 听清考官指示，如有疑问及时询问</li>
            <li>✅ 说话时看着考官或搭档，保持眼神交流</li>
          </ul>
        </Card>
      </div>
    </ExamAreaLayout>
  );
};

export default KETTips;
