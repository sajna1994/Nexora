import { Layout, Menu, Typography, Button } from "antd";
import {
  DashboardOutlined,
  BarChartOutlined, 
  ShoppingOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  MailOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const { Sider, Content } = Layout;

export default function AdminLayout() {
  const nav = useNavigate();
  const loc = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    nav("/login");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        style={{ position: "relative" }}
      >
        {/* Logo */}
        <div
  style={{
    padding: 24,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }}
>
  <img
    src="/logo.png"
    alt="NEXORA"
    style={{
      height: 50,
      width: 'auto',
      objectFit: 'contain',
      mixBlendMode: 'screen',   // blends black bg into dark Sider
    }}
  />
</div>

        {/* Nav menu */}
        <Menu
          theme="dark"
          selectedKeys={[loc.pathname]}
          items={[
            { key: "/admin", icon: <DashboardOutlined />, label: "Dashboard" },
            { key: "/admin/analytics", icon: <BarChartOutlined />, label: "Analytics" },   // ← ADD

            {
              key: "/admin/products",
              icon: <ShoppingOutlined />,
              label: "Products",
            },
            {
              key: "/admin/categories",
              icon: <AppstoreOutlined />,
              label: "Categories",
            },
            {
              key: "/admin/orders",
              icon: <ShoppingCartOutlined />,
              label: "Orders",
            },
            {
              key: "/admin/customers",
              icon: <TeamOutlined />,
              label: "Customers",
            },
                { key: "/admin/newsletter", icon: <MailOutlined />, label: "Newsletter" },   // ← ADD

          ]}
          onClick={({ key }) => nav(key)}
        />

        {/* Logout — pinned to the bottom of the sider */}
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
      </Sider>

      <Content style={{ padding: 32, background: "#f6f5f2" }}>
        <Typography.Title level={3}>NEXORA Admin</Typography.Title>
        <Outlet />
      </Content>
    </Layout>
  );
}