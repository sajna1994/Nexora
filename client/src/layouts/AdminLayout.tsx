import { Layout, Menu, Typography, Button, Drawer, Grid, Space } from "antd";
import {
  DashboardOutlined,
  BarChartOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  MailOutlined,
  LogoutOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const { Sider, Content } = Layout;
const { useBreakpoint } = Grid;

const MENU_ITEMS = [
  { key: "/admin", icon: <DashboardOutlined />, label: "Dashboard" },
  { key: "/admin/analytics", icon: <BarChartOutlined />, label: "Analytics" },
  { key: "/admin/products", icon: <ShoppingOutlined />, label: "Products" },
  { key: "/admin/categories", icon: <AppstoreOutlined />, label: "Categories" },
  { key: "/admin/orders", icon: <ShoppingCartOutlined />, label: "Orders" },
  { key: "/admin/customers", icon: <TeamOutlined />, label: "Customers" },
  { key: "/admin/newsletter", icon: <MailOutlined />, label: "Newsletter" },
];

export default function AdminLayout() {
  const nav = useNavigate();
  const loc = useLocation();
  const { logout } = useAuth();
  const screens = useBreakpoint();
  const isMobile = !screens.md; // < 768px
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    logout();
    nav("/login");
  };

  const handleNav = (key: string) => {
    nav(key);
    setDrawerOpen(false);
  };

  const NavContent = (
    <>
      {/* Logo */}
      <div
        style={{
          padding: isMobile ? 16 : 24,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <img
          src="/logo.png"
          alt="NEXORA"
          style={{
            height: isMobile ? 36 : 50,
            width: "auto",
            objectFit: "contain",
            mixBlendMode: "screen",
          }}
        />
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[loc.pathname]}
        items={MENU_ITEMS}
        onClick={({ key }) => handleNav(key)}
      />

      <div
        style={{
          position: "absolute",
          bottom: 16,
          left: 0,
          right: 0,
          padding: "0 16px",
        }}
      >
        <Button
          block
          danger
          icon={<LogoutOutlined />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* ── Desktop: Sider ────────────────────────────── */}
      {!isMobile && (
        <Sider breakpoint="lg" collapsedWidth="0" style={{ position: "relative" }}>
          {NavContent}
        </Sider>
      )}

      {/* ── Mobile: Drawer ────────────────────────────── */}
      {isMobile && (
        <Drawer
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={260}
          styles={{
            body: {
              padding: 0,
              background: "#001529",
              position: "relative",
            },
            header: {
              background: "#001529",
              borderBottom: "1px solid #1f1f1f",
            },
          }}
          closeIcon={<span style={{ color: "#fff" }}>✕</span>}
        >
          {NavContent}
        </Drawer>
      )}

      {/* ── Content ───────────────────────────────────── */}
      <Content
        style={{
          padding: isMobile ? 12 : 32,
          background: "#f6f5f2",
        }}
      >
        {/* Mobile top bar with menu button */}
        {isMobile && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 16,
              padding: "8px 4px",
            }}
          >
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setDrawerOpen(true)}
            />
            <Typography.Title
              level={4}
              style={{ margin: 0, fontSize: 18, fontWeight: 700 }}
            >
              NEXORA Admin
            </Typography.Title>
          </div>
        )}

        {/* Desktop title */}
        {!isMobile && (
          <Typography.Title level={3} style={{ marginTop: 0 }}>
            NEXORA Admin
          </Typography.Title>
        )}

        <Outlet />
      </Content>
    </Layout>
  );
}