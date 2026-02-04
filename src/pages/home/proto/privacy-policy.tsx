import React from 'react';
import { Card, Typography, Button, Divider } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { history } from '@umijs/max';
import './index.less';

const { Title, Paragraph, Text } = Typography;

/**
 * 隐私政策页面
 */
const PrivacyPolicy: React.FC = () => {
  return (
    <div className="proto-container">
      {/* 顶部导航栏 */}
      <div className="proto-header">
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => history.back()}
          size="large"
        >
          返回
        </Button>
        <Title level={2} style={{ margin: 0 }}>隐私政策</Title>
        <div style={{ width: 80 }} /> {/* 占位，保持标题居中 */}
      </div>

      <div className="proto-content">
        <Card className="proto-card" bordered={false}>
          <div className="proto-header-text">
            <Text type="secondary">更新日期：2024年12月</Text>
            <Text type="secondary">生效日期：2024年12月</Text>
          </div>

          <Divider />

          <div className="proto-section">
            <Title level={3}>引言</Title>
            <Paragraph>
              本平台（以下简称"我们"）深知个人信息对您的重要性，我们将按照法律法规的规定，保护您的
              个人信息及隐私安全。我们制定本《隐私政策》并特别提示：希望您在使用本平台及相关服务前
              仔细阅读并理解本隐私政策，以便做出适当的选择。
            </Paragraph>
            <Paragraph>
              本隐私政策将帮助您了解：
            </Paragraph>
            <ul className="proto-list">
              <li>我们会收集哪些信息</li>
              <li>我们如何使用这些信息</li>
              <li>您如何管理自己的信息</li>
            </ul>
          </div>

          <Divider />

          <div className="proto-section">
            <Title level={4}>一、我们收集的信息</Title>
            <Paragraph>
              在您使用我们的服务时，我们可能会收集以下信息：
            </Paragraph>
            
            <Title level={5}>1.1 您主动提供的信息</Title>
            <Paragraph>
              • <Text strong>账号注册信息：</Text>当您注册账号时，我们会收集您的手机号码、电子邮箱地址、
              用户名、密码等信息。
            </Paragraph>
            <Paragraph>
              • <Text strong>个人资料信息：</Text>您可以选择填写昵称、头像、性别、生日等个人资料信息。
            </Paragraph>
            <Paragraph>
              • <Text strong>支付信息：</Text>当您购买付费服务时，我们需要收集您的支付信息，以便完成交易。
            </Paragraph>

            <Title level={5}>1.2 我们在您使用服务过程中收集的信息</Title>
            <Paragraph>
              • <Text strong>日志信息：</Text>当您使用我们的服务时，我们可能会自动收集您对我们服务的
              详细使用情况，并作为有关网络日志保存，包括但不限于您的登录账号、IP地址、浏览器类型、
              使用的语言、访问日期和时间。
            </Paragraph>
            <Paragraph>
              • <Text strong>设备信息：</Text>我们可能会收集您使用的设备信息，包括设备型号、操作系统
              版本、设备识别码、浏览器类型等。
            </Paragraph>
            <Paragraph>
              • <Text strong>位置信息：</Text>当您使用与位置有关的服务时，我们可能会记录您设备所在的
              位置信息，以便为您提供相关服务。
            </Paragraph>
            <Paragraph>
              • <Text strong>语音信息：</Text>当您使用口语练习功能时，我们会收集您的语音数据用于评分和
              反馈，这些数据会被加密存储并仅用于提供服务。
            </Paragraph>
          </div>

          <Divider />

          <div className="proto-section">
            <Title level={4}>二、我们如何使用收集的信息</Title>
            <Paragraph>
              我们严格遵守法律法规的规定以及与用户的约定，将收集的信息用于以下用途：
            </Paragraph>
            <ul className="proto-list">
              <li><Text strong>提供服务：</Text>向您提供您使用的各项服务，维护、改进这些服务。</li>
              <li><Text strong>账号管理：</Text>用于注册、登录、账号管理等功能。</li>
              <li><Text strong>安全保障：</Text>用于身份验证、安全防范、诈骗监测、预防或禁止非法活动、
              降低风险、存档和备份用途。</li>
              <li><Text strong>服务优化：</Text>帮助我们设计新服务，改善我们现有服务。</li>
              <li><Text strong>评估改进：</Text>评估我们服务中的广告和其他促销及推广活动的效果，并加以改善。</li>
              <li><Text strong>推荐内容：</Text>向您推荐您可能感兴趣的内容，包括但不限于向您发出产品和
              服务信息。</li>
              <li><Text strong>通知提醒：</Text>用于向您发送重要通知，如软件更新、服务条款变更等。</li>
            </ul>
          </div>

          <Divider />

          <div className="proto-section">
            <Title level={4}>三、我们如何共享、转让、公开披露您的个人信息</Title>
            
            <Title level={5}>3.1 共享</Title>
            <Paragraph>
              我们不会与本平台以外的任何公司、组织和个人共享您的个人信息，但以下情况除外：
            </Paragraph>
            <ul className="proto-list">
              <li>获得您的明确同意后，我们会与其他方共享您的个人信息；</li>
              <li>在法定情形下的共享：根据适用的法律法规、法律程序、政府的强制命令或司法裁定而需共享
              您的个人信息；</li>
              <li>在法律要求或允许的范围内，为了保护您或社会公众的利益、财产或安全免遭损害而有必要
              提供您的个人信息给第三方。</li>
            </ul>

            <Title level={5}>3.2 转让</Title>
            <Paragraph>
              我们不会将您的个人信息转让给任何公司、组织和个人，但以下情况除外：
            </Paragraph>
            <ul className="proto-list">
              <li>获得您的明确同意；</li>
              <li>根据适用的法律法规、法律程序的要求、强制性的行政或司法要求所必须的情况进行提供；</li>
              <li>符合与您签署的相关协议或其他的法律文件约定所提供；</li>
              <li>在涉及合并、收购、资产转让或类似的交易时，如涉及到个人信息转让，我们会要求新的
              持有您个人信息的公司、组织继续受本隐私政策的约束，否则我们将要求该公司、组织重新向您
              征求授权同意。</li>
            </ul>

            <Title level={5}>3.3 公开披露</Title>
            <Paragraph>
              我们仅会在以下情况下，公开披露您的个人信息：
            </Paragraph>
            <ul className="proto-list">
              <li>获得您明确同意后；</li>
              <li>基于法律的披露：在法律、法律程序、诉讼或政府主管部门强制性要求的情况下，我们可能
              会公开披露您的个人信息。</li>
            </ul>
          </div>

          <Divider />

          <div className="proto-section">
            <Title level={4}>四、我们如何保护您的个人信息</Title>
            <Paragraph>
              4.1 我们已采用符合业界标准、合理可行的安全防护措施保护您提供的个人信息安全，防止个人
              信息遭到未经授权访问、公开披露、使用、修改、损坏或丢失。
            </Paragraph>
            <Paragraph>
              4.2 我们会采取合理可行的措施，尽力避免收集无关的个人信息。我们只会在达成本政策所述
              目的所需的期限内保留您的个人信息，除非法律有强制的存留要求。
            </Paragraph>
            <Paragraph>
              4.3 互联网并非绝对安全的环境，我们强烈建议您通过安全方式、使用复杂密码，协助我们保证
              您的账号安全。
            </Paragraph>
            <Paragraph>
              4.4 在不幸发生个人信息安全事件后，我们将按照法律法规的要求向您告知：安全事件的基本
              情况和可能的影响、我们已采取或将要采取的处置措施、您可自主防范和降低风险的建议、对您
              的补救措施等。
            </Paragraph>
          </div>

          <Divider />

          <div className="proto-section">
            <Title level={4}>五、您如何管理自己的信息</Title>
            
            <Title level={5}>5.1 访问、更新和删除</Title>
            <Paragraph>
              我们鼓励您更新和修改您的信息以使其更准确有效。您能通过本平台访问您的信息，并根据对
              应信息的管理方式自行完成或要求我们进行修改、补充和删除。
            </Paragraph>

            <Title level={5}>5.2 公开与分享</Title>
            <Paragraph>
              我们的多项服务可让您不仅与您的社交网络、也与使用该服务的所有用户公开分享您的相关信息，
              例如，您在我们的服务中所上传或发布的信息、您对其他人上传或发布的信息作出的回应，以及
              包括与这些信息有关的位置数据和日志信息。请您谨慎考虑通过我们的服务上传、发布和交流的
              信息内容。
            </Paragraph>

            <Title level={5}>5.3 注销账号</Title>
            <Paragraph>
              您可以在个人设置中申请注销您的账号。在您注销账号后，我们将停止为您提供产品或服务，
              并根据您的要求删除您的个人信息，法律法规另有规定的除外。
            </Paragraph>
          </div>

          <Divider />

          <div className="proto-section">
            <Title level={4}>六、未成年人信息保护</Title>
            <Paragraph>
              6.1 我们非常重视对未成年人个人信息的保护。若您是未满18周岁的未成年人，在使用我们的
              服务前，应事先取得您的家长或法定监护人的同意。
            </Paragraph>
            <Paragraph>
              6.2 对于经父母或法定监护人同意而收集未成年人个人信息的情况，我们只会在受到法律允许、
              父母或监护人明确同意或者保护未成年人所必要的情况下使用或公开披露此信息。
            </Paragraph>
            <Paragraph>
              6.3 如果我们发现自己在未事先获得可证实的父母或法定监护人同意的情况下收集了未成年人的
              个人信息，则会设法尽快删除相关数据。
            </Paragraph>
          </div>

          <Divider />

          <div className="proto-section">
            <Title level={4}>七、Cookie和同类技术</Title>
            <Paragraph>
              7.1 为确保网站正常运转、为您获得更轻松的访问体验，我们会在您的计算机或移动设备上存储
              Cookie、Flash Cookie，或您的浏览器或关联应用程序提供的其他通常包含标识符、站点名称
              以及一些号码和字符的本地存储（统称"Cookie"）。
            </Paragraph>
            <Paragraph>
              7.2 如果您的浏览器或浏览器附加服务允许，您可修改对Cookie的接受程度或拒绝我们的Cookie。
              有关详情，请参见 AboutCookies.org。但如果您这么做，在某些情况下可能会影响您安全访问
              我们的网站，且可能需要在每次访问我们的网站时更改用户设置。
            </Paragraph>
          </div>

          <Divider />

          <div className="proto-section">
            <Title level={4}>八、隐私政策的更新</Title>
            <Paragraph>
              8.1 我们可能适时修订本隐私政策内容。如该等变更会导致您在本隐私政策项下权利的实质减损，
              我们将在变更生效前，通过在页面显著位置提示、向您发送电子邮件等方式通知您。
            </Paragraph>
            <Paragraph>
              8.2 在该种情况下，若您继续使用我们的服务，即表示同意受经修订的隐私政策约束。
            </Paragraph>
          </div>

          <Divider />

          <div className="proto-section">
            <Title level={4}>九、如何联系我们</Title>
            <Paragraph>
              如您对本隐私政策或您个人信息的相关事宜有任何问题、意见或建议，请通过以下方式与我们
              联系：Email:2260837959@qq.com 或者 QQ:2260837959
            </Paragraph>
            <Paragraph>
              我们将在收到您的反馈后尽快予以回复。
            </Paragraph>
          </div>

          <Divider />

          <div className="proto-footer">
            <Paragraph type="secondary">
              感谢您对我们的信任，我们将竭诚为您提供更加优质的服务！
            </Paragraph>
          </div>
        </Card>

        {/* 底部操作按钮 */}
        <div className="proto-action-footer">
          <Button size="large" onClick={() => history.back()}>
            返回
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
