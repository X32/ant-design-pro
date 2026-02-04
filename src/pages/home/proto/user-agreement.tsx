import React from 'react';
import { Card, Typography, Button, Divider } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { history } from '@umijs/max';
import './index.less';

const { Title, Paragraph, Text } = Typography;

/**
 * 用户协议页面
 */
const UserAgreement: React.FC = () => {
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
        <Title level={2} style={{ margin: 0 }}>用户协议</Title>
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
            <Title level={3}>欢迎使用本平台服务！</Title>
            <Paragraph>
              请您仔细阅读以下条款。如果您对本协议的任何条款表示异议，您可以选择不使用本平台服务。
              当您注册成功，无论是进入本平台，还是在本平台上发布任何内容（即「内容」），均意味着您
              （即「用户」）完全接受本协议项下的全部条款。
            </Paragraph>
          </div>

          <Divider />

          <div className="proto-section">
            <Title level={4}>一、服务条款的接受与修改</Title>
            <Paragraph>
              1.1 本协议内容包括协议正文及所有本平台已经发布的或将来可能发布的各类规则。所有规则为
              本协议不可分割的组成部分，与协议正文具有同等法律效力。
            </Paragraph>
            <Paragraph>
              1.2 本平台有权根据需要不定期地制订、修改本协议及各类规则，并在本平台公示，不再单独
              通知用户。变更后的协议和规则一经在网站公布后，立即自动生效。如您不同意相关变更，应当
              立即停止使用本平台服务。您继续使用本平台服务的，即表明您接受修订后的协议和规则。
            </Paragraph>
          </div>

          <Divider />

          <div className="proto-section">
            <Title level={4}>二、用户账号注册与管理</Title>
            <Paragraph>
              2.1 用户在使用本平台服务前需要注册一个账号。账号应当使用有效的电子邮箱地址或手机号码
              注册，请使用尚未与本平台账号绑定的邮箱或手机号码，以及未被本平台根据本协议封禁的邮箱
              或手机号码注册。
            </Paragraph>
            <Paragraph>
              2.2 用户须对在本平台的注册信息的真实性、合法性、有效性承担全部责任，用户不得冒充他人；
              不得利用他人的名义发布任何信息；不得恶意使用注册账号导致其他用户误认；否则本平台有权
              立即停止提供服务，收回其账号并由用户独自承担由此而产生的一切法律责任。
            </Paragraph>
            <Paragraph>
              2.3 用户账号在注册成功后，账号和密码由用户负责保管；用户应当对以其账号进行的所有活动
              和事件负法律责任。
            </Paragraph>
            <Paragraph>
              2.4 用户在使用本平台服务过程中，必须遵循以下原则：
            </Paragraph>
            <ul className="proto-list">
              <li>遵守中国有关的法律和法规；</li>
              <li>不得为任何非法目的而使用网络服务系统；</li>
              <li>遵守所有与网络服务有关的网络协议、规定和程序；</li>
              <li>不得利用本平台服务进行任何可能对互联网的正常运转造成不利影响的行为；</li>
              <li>不得利用本平台服务传输任何骚扰性的、中伤他人的、辱骂性的、恐吓性的、庸俗淫秽的或其他任何非法的信息资料；</li>
              <li>不得利用本平台服务进行任何不利于本平台的行为。</li>
            </ul>
          </div>

          <Divider />

          <div className="proto-section">
            <Title level={4}>三、服务内容</Title>
            <Paragraph>
              3.1 本平台提供在线英语口语练习、考试模拟、评分反馈等服务。具体服务内容以本平台实际
              提供的为准。
            </Paragraph>
            <Paragraph>
              3.2 本平台提供的服务包含免费和收费服务。免费服务用户可以直接使用，收费服务需要用户
              支付相应费用后方可使用。
            </Paragraph>
            <Paragraph>
              3.3 本平台仅提供相关的网络服务，除此之外与相关网络服务有关的设备（如电脑、调制解调器
              及其他与接入互联网有关的装置）及所需的费用（如为接入互联网而支付的电话费及上网费）
              均应由用户自行负担。
            </Paragraph>
          </div>

          <Divider />

          <div className="proto-section">
            <Title level={4}>四、知识产权声明</Title>
            <Paragraph>
              4.1 本平台的内容（包括但不限于文字、图片、音频、视频、图表、界面设计、版面框架、有关
              数据或电子文档等）的知识产权归本平台所有。
            </Paragraph>
            <Paragraph>
              4.2 用户在使用本平台服务时发表上传的文字、图片、视频、音频等内容的知识产权归用户或
              原始著作权人所有。
            </Paragraph>
            <Paragraph>
              4.3 除另有特别声明外，本平台提供服务时所依托软件的著作权、专利权及其他知识产权均归
              本平台所有。
            </Paragraph>
          </div>

          <Divider />

          <div className="proto-section">
            <Title level={4}>五、隐私保护</Title>
            <Paragraph>
              5.1 保护用户隐私是本平台的重点原则，本平台通过技术手段、提供隐私保护服务功能、强化
              内部管理等办法充分保护用户的个人信息安全。本平台保证不对外公开或向第三方提供用户的
              注册资料及用户在使用服务时存储在本平台的非公开内容，但下列情况除外：
            </Paragraph>
            <ul className="proto-list">
              <li>事先获得用户的明确授权；</li>
              <li>根据有关的法律法规要求；</li>
              <li>按照相关政府主管部门的要求；</li>
              <li>为维护社会公众的利益；</li>
              <li>为维护本平台的合法权益。</li>
            </ul>
            <Paragraph>
              5.2 本平台可能会与第三方合作向用户提供相关的服务，在此情况下，如该第三方同意承担与
              本平台同等的保护用户隐私的责任，则本平台有权将用户的注册资料等提供给该第三方。
            </Paragraph>
          </div>

          <Divider />

          <div className="proto-section">
            <Title level={4}>六、免责声明</Title>
            <Paragraph>
              6.1 本平台不保证服务一定能满足用户的要求，也不保证服务不会中断，对服务的及时性、
              安全性、准确性也都不作保证。
            </Paragraph>
            <Paragraph>
              6.2 对于因不可抗力或本平台不能控制的原因造成的服务中断或其他缺陷，本平台不承担任何
              责任，但将尽力减少因此而给用户造成的损失和影响。
            </Paragraph>
            <Paragraph>
              6.3 用户理解，在使用本平台服务过程中，可能会遇到不可抗力等风险因素，使服务发生中断。
              不可抗力是指不能预见、不能克服并不能避免且对一方或双方造成重大影响的客观事件，包括但
              不限于自然灾害如洪水、地震、瘟疫流行和风暴等以及社会事件如战争、动乱、政府行为等。
              出现上述情况时，本平台将努力在第一时间与相关单位配合，及时进行修复，但是由此给用户
              造成的损失本平台在法律允许的范围内免责。
            </Paragraph>
          </div>

          <Divider />

          <div className="proto-section">
            <Title level={4}>七、违约责任</Title>
            <Paragraph>
              7.1 如因本平台违反有关法律、法规或本协议项下的任何条款而给用户造成损失，本平台同意
              承担由此造成的损害赔偿责任。
            </Paragraph>
            <Paragraph>
              7.2 用户同意保障和维护本平台及其他用户的利益，如因用户违反有关法律、法规或本协议项下
              的任何条款而给本平台或任何其他第三人造成损失，用户同意承担由此造成的损害赔偿责任。
            </Paragraph>
          </div>

          <Divider />

          <div className="proto-section">
            <Title level={4}>八、协议的生效、终止和其他</Title>
            <Paragraph>
              8.1 用户使用本平台服务即视为用户已阅读本协议并接受本协议的约束。
            </Paragraph>
            <Paragraph>
              8.2 本平台有权在必要时修改本协议条款，协议条款一旦发生变动，将会在相关页面上提示
              修改内容。如果不同意所改动的内容，用户可以主动取消获得的服务。如果用户继续使用服务，
              则视为接受协议条款的变动。
            </Paragraph>
            <Paragraph>
              8.3 本协议的订立、执行和解释及争议的解决均应适用中国法律。如双方就本协议内容或其执行
              发生任何争议，双方应尽量友好协商解决；协商不成时，任何一方均可向本平台所在地的人民
              法院提起诉讼。
            </Paragraph>
          </div>

          <Divider />

          <div className="proto-footer">
            <Paragraph type="secondary">
              如果您对本协议有任何疑问，请联系：Email:2260837959@qq.com 或者 QQ:2260837959。
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

export default UserAgreement;
