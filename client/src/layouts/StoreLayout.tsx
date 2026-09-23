import React from 'react';

import { Layout, Input, Badge, Button, Drawer, Menu } from 'antd';
import {
  SearchOutlined,
  ShoppingOutlined,
  UserOutlined,
  MenuOutlined,
  HeartOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const { Header, Content, Footer } = Layout;

export default function StoreLayout() {
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <Layout
      style={{
        minHeight: '100vh',
        background: '#faf9f7',
      }}
    >
      <Header
        style={{
          height: 76,
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          background: '#fff',
          borderBottom: '1px solid #eee',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 20,
        }}
      >
        {/* Mobile Menu */}
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={() => setOpen(true)}
          className="mobile-menu"
        />

        {/* Logo */}
        <div
          onClick={() => nav('/')}
          style={{
            fontFamily: 'Manrope',
            fontSize: 25,
            fontWeight: 800,
            letterSpacing: 6,
            cursor: 'pointer',
          }}
        >
          NEXORA
        </div>

        {/* Search */}
        <div
          style={{
            flex: 1,
            maxWidth: 560,
            margin: '0 auto',
          }}
        >
          <Input
            size="large"
            prefix={<SearchOutlined />}
            placeholder="Search products, brands and categories..."
            onPressEnter={(e) =>
              nav(
                '/shop?search=' +
                  encodeURIComponent(e.currentTarget.value)
              )
            }
          />
        </div>

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            gap: 8,
          }}
        >
          <Button
            type="text"
            icon={<HeartOutlined />}
            onClick={() => nav('/wishlist')}
          />

          <Button
            type="text"
            icon={<UserOutlined />}
            onClick={() => nav('/login')}
          />

          <Badge count={0} showZero>
            <Button
              type="text"
              icon={<ShoppingOutlined />}
              onClick={() => nav('/cart')}
            />
          </Badge>
        </div>
      </Header>

      <Content>
        <Outlet />
      </Content>

      <Footer className="footer">
        <div
          style={{
            maxWidth: 1280,
            margin: 'auto',
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: 5,
              color: '#fff',
            }}
          >
            NEXORA
          </div>

          <p>Shop more. Live better.</p>
        </div>
      </Footer>

      {/* Mobile Drawer */}
      <Drawer
        title="NEXORA"
        open={open}
        onClose={() => setOpen(false)}
      >
        <Menu
          items={[
            {
              key: 'shop',
              label: 'Shop',
            },
            {
              key: 'shoes',
              label: 'Shoes',
            },
            {
              key: 'gym',
              label: 'Gym & Supplements',
            },
            {
              key: 'fashion',
              label: 'Fashion',
            },
            {
              key: 'cosmetics',
              label: 'Cosmetics',
            },
          ]}
          onClick={({ key }) => {
            setOpen(false);
            nav('/shop?category=' + key);
          }}
        />
      </Drawer>
    </Layout>
  );
}