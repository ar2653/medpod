import React, { useState } from 'react';
import {
  HomeOutlined,
  UserOutlined,
  CodeOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Typography } from 'antd';
import './Sidebar.css';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}

const items = [
  getItem('Home', '1', <HomeOutlined />),
  getItem('Options...', '2', <UserOutlined />)
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout className="layout-container">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        className="sider"
      >
        <div className="logo-container">
        <CodeOutlined/>
        </div>
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items} />
      </Sider>
      <Layout>
        <Header className="header">
        <Title level={2} style={{ padding: '10px'}}>
            Basic Audio Streaming
        </Title>
        </Header>
        <Content className="content">
          <div className="content-inner">
            Content goes here
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Sidebar;
