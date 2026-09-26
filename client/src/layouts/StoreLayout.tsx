import React, { useState } from "react";
import { useEffect } from "react";
import {
  Layout,
  Input,
  Badge,
  Button,
  Drawer,
  Menu,
  Dropdown,
  Avatar,
  Space,
  message,
} from "antd";
import {
  SearchOutlined,
  ShoppingOutlined,
  UserOutlined,
  MenuOutlined,
  HeartOutlined,
  DashboardOutlined,
  LogoutOutlined,
  InstagramOutlined,
  TwitterOutlined,
  FacebookOutlined,
  YoutubeOutlined,
  GiftOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { useWishlist } from "../context/WishlistContext";

const { Header, Content, Footer } = Layout;

export default function StoreLayout() {
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const { count: wishCount } = useWishlist();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
const [footerCategories, setFooterCategories] = useState<any[]>([]);
const [welcomeCodeStored, setWelcomeCodeStored] = useState<string | null>(null);

useEffect(() => {
  setWelcomeCodeStored(localStorage.getItem("nexora_welcome_code"));
}, [isAuthenticated]);
useEffect(() => {
  api.get("/categories").then((res) => setFooterCategories(res.data));
}, []);
  const userMenu = {
    items: isAuthenticated
      ? [
          {
            key: "profile",
            label: "My Profile",
            icon: <UserOutlined />,
            onClick: () => nav("/profile"),
          },
          {
            key: "orders",
            label: "My Orders",
            icon: <ShoppingOutlined />,
            onClick: () => nav("/orders"),
          },
          ...(isAdmin
            ? [
                { type: "divider" as const },
                {
                  key: "admin",
                  label: "Admin Panel",
                  icon: <DashboardOutlined />,
                  onClick: () => nav("/admin"),
                },
              ]
            : []),
          { type: "divider" as const },
          {
            key: "logout",
            label: "Logout",
            icon: <LogoutOutlined />,
            danger: true,
            onClick: () => {
              logout();
              nav("/");
            },
          },
        ]
      : [
          {
            key: "login",
            label: "Sign in",
            onClick: () => nav("/login"),
          },
          {
            key: "register",
            label: "Create account",
            onClick: () => nav("/register"),
          },
        ],
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#faf9f7" }}>
      <Header
  style={{
    height: 64,
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "#fff",
    borderBottom: "1px solid #eee",
    padding: "0 16px",
    position: "sticky",
    top: 0,
    zIndex: 20,
  }}
>
  {/* Mobile: menu button */}
  <Button
    type="text"
    icon={<MenuOutlined />}
    onClick={() => setOpen(true)}
    className="mobile-only"
  />

  {/* Logo */}
  <img
    src="/logoo.png"
    alt="NEXORA"
    onClick={() => nav("/")}
    style={{
      height: 40,
      width: "auto",
      cursor: "pointer",
      objectFit: "contain",
    }}
  />

  {/* Desktop: search box in header */}
  <div
    className="desktop-only"
    style={{ flex: 1, maxWidth: 560, margin: "0 auto" }}
  >
    <Input
      size="large"
      prefix={<SearchOutlined />}
      placeholder="Search products, brands and categories..."
      onPressEnter={(e) =>
        nav("/shop?search=" + encodeURIComponent(e.currentTarget.value))
      }
    />
  </div>

  {/* Actions */}
  <div
    style={{
      display: "flex",
      gap: 6,
      alignItems: "center",
      marginLeft: "auto",
    }}
  >
    {/* Mobile: search icon → jumps to shop */}
    <Button
      type="text"
      icon={<SearchOutlined />}
      onClick={() => nav("/shop")}
      className="mobile-only"
    />

    {/* Desktop: wishlist + cart + avatar */}
    <div className="desktop-only" style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <Badge count={wishCount} showZero={false} color="#c9a45c">
        <Button type="text" icon={<HeartOutlined />} onClick={() => nav("/wishlist")} />
      </Badge>
      <Badge count={count} showZero>
        <Button type="text" icon={<ShoppingOutlined />} onClick={() => nav("/cart")} />
      </Badge>

      {isAuthenticated ? (
        <Dropdown menu={userMenu} placement="bottomRight" trigger={["click"]}>
          <Space style={{ cursor: "pointer", paddingLeft: 4 }}>
            <Avatar size="small" style={{ background: "#b8892d" }}>
              {user?.name?.[0]?.toUpperCase()}
            </Avatar>
          </Space>
        </Dropdown>
      ) : (
        <Dropdown menu={userMenu} placement="bottomRight" trigger={["click"]}>
          <Button type="text" icon={<UserOutlined />} />
        </Dropdown>
      )}
    </div>
  </div>
</Header>

      <Content>
        <Outlet />
      </Content>

      <Footer className="footer">
        <div className="footer-inner">
          {/* Newsletter */}
          <div className="footer-newsletter">
            <div className="footer-newsletter-text">
              <h3>Join the NEXORA circle</h3>
              <p>Get 10% off your first order + early access to new drops.</p>
            </div>
            <form
              className="footer-newsletter-form"
             onSubmit={async (e) => {
  e.preventDefault();
  const input = e.currentTarget.elements[0] as HTMLInputElement;
  const email = input.value.trim();
  if (!email) return;

  try {
    const res = await api.post("/newsletter", { email });
    const code = res.data?.code;

    if (code) {
      // Save it so the user can find it later
      localStorage.setItem("nexora_welcome_code", code);
      // Also remember which email it belongs to
      localStorage.setItem("nexora_welcome_email", email);
setWelcomeCodeStored(code); 
      message.success(
        {
          content: (
            <span>
              Subscribed! Your code: <b>{code}</b> — use it at checkout for
              10% off.
            </span>
          ),
          duration: 8,
        }
      );
    } else {
      message.success("Subscribed!");
    }
    input.value = "";
  } catch (err: any) {
    message.error(err.response?.data?.message || "Could not subscribe");
  }
}}
            >
              <input type="email" placeholder="Enter your email" required />
              <button type="submit">Subscribe</button>
            </form>
          </div>

          {/* Main grid */}
          <div className="footer-grid">
            {/* Brand column */}
            <div className="footer-brand">
              <img src="/logoo.png" alt="NEXORA" />
              <p className="footer-brand-text">
                Curated essentials for a better everyday. Premium footwear,
                performance nutrition and modern lifestyle — all in one place.
              </p>
             <div className="footer-socials">
  <a
    href="https://instagram.com/nexora"
    target="_blank"
    rel="noreferrer noopener"
    aria-label="Instagram"
  >
    <InstagramOutlined />
  </a>
  <a
    href="https://twitter.com/nexora"
    target="_blank"
    rel="noreferrer noopener"
    aria-label="Twitter"
  >
    <TwitterOutlined />
  </a>
  <a
    href="https://facebook.com/nexora"
    target="_blank"
    rel="noreferrer noopener"
    aria-label="Facebook"
  >
    <FacebookOutlined />
  </a>
  <a
    href="https://youtube.com/@nexora"
    target="_blank"
    rel="noreferrer noopener"
    aria-label="YouTube"
  >
    <YoutubeOutlined />
  </a>
</div>
            </div>

            {/* Shop */}
           <div className="footer-col">
  <h4>Shop</h4>
  <ul>
    {footerCategories.slice(0, 4).map((c) => (
      <li key={c._id}>
        <a onClick={() => nav(`/shop?category=${c._id}`)}>{c.name}</a>
      </li>
    ))}
    <li>
      <a onClick={() => nav("/shop")}>All Products</a>
    </li>
  </ul>
</div>

           {/* Help */}
<div className="footer-col">
  <h4>Help</h4>
  <ul>
    <li>
      <a onClick={() => nav("/orders")}>Track Order</a>
    </li>
    <li>
      <a onClick={() => nav("/info/shipping")}>Shipping Info</a>
    </li>
    <li>
      <a onClick={() => nav("/info/returns")}>Returns & Refunds</a>
    </li>
    <li>
      <a onClick={() => nav("/info/size-guide")}>Size Guide</a>
    </li>
    <li>
      <a onClick={() => nav("/info/contact")}>Contact Us</a>
    </li>
  </ul>
</div>

           {/* Company */}
<div className="footer-col">
  <h4>Company</h4>
  <ul>
    <li>
      <a onClick={() => nav("/info/about")}>About NEXORA</a>
    </li>
    <li>
      <a onClick={() => nav("/info/careers")}>Careers</a>
    </li>
    <li>
      <a onClick={() => nav("/info/press")}>Press</a>
    </li>
    <li>
      <a onClick={() => nav("/info/privacy")}>Privacy Policy</a>
    </li>
    <li>
      <a onClick={() => nav("/info/terms")}>Terms of Service</a>
    </li>
  </ul>
</div>
          </div>

          {/* Bottom bar */}
          <div className="footer-bottom">
            <div className="footer-copy">
              © {new Date().getFullYear()} NEXORA. All rights reserved.
            </div>

           <div className="footer-policies">
  <a onClick={() => nav("/info/privacy")}>Privacy</a>
  <a onClick={() => nav("/info/terms")}>Terms</a>
  <a onClick={() => nav("/info/cookies")}>Cookies</a>
  <a onClick={() => nav("/info/sitemap")}>Sitemap</a>
</div>

            <div className="footer-payments">
              <span>VISA</span>
              <span>MASTERCARD</span>
              <span>UPI</span>
              <span>PAYPAL</span>
            </div>
          </div>
        </div>
      </Footer>

      {/* Mobile drawer */}
      <Drawer
  placement="left"
  open={open}
  onClose={() => setOpen(false)}
  width={280}
  title={
    <img src="/logoo.png" alt="NEXORA" style={{ height: 32 }} />
  }
  styles={{
    body: { padding: 0 },
  }}
>
  {/* User section */}
  <div
    style={{
      padding: 16,
      background: "linear-gradient(135deg, #1a1a1a, #2a2520)",
      color: "#fff",
    }}
  >
    {isAuthenticated ? (
      <>
        <Avatar size={44} style={{ background: "#b8892d", marginBottom: 8 }}>
          {user?.name?.[0]?.toUpperCase()}
        </Avatar>
        <div style={{ fontWeight: 700 }}>{user?.name}</div>
        <div style={{ fontSize: 12, color: "#c9a45c" }}>{user?.email}</div>
      </>
    ) : (
      <Button type="primary" block onClick={() => { setOpen(false); nav("/login"); }}>
        Sign in / Register
      </Button>
    )}
  </div>

  {/* Categories */}
  <div style={{ padding: "16px 20px 8px", fontSize: 11, letterSpacing: 2, color: "#999", fontWeight: 700 }}>
    SHOP
  </div>
  <Menu
    mode="inline"
    style={{ border: "none" }}
    items={[
      { key: "shop", label: "All Products", icon: <AppstoreOutlined /> },
      ...footerCategories.map((c) => ({
        key: `cat-${c._id}`,
        label: c.name,
      })),
    ]}
    onClick={({ key }) => {
      setOpen(false);
      if (key === "shop") nav("/shop");
      else nav("/shop?category=" + key.replace("cat-", ""));
    }}
  />

  {/* Account */}
  {isAuthenticated && (
    <>
      <div style={{ padding: "16px 20px 8px", fontSize: 11, letterSpacing: 2, color: "#999", fontWeight: 700 }}>
        ACCOUNT
      </div>
      <Menu
        mode="inline"
        style={{ border: "none" }}
        items={[
          { key: "profile", label: "My Profile", icon: <UserOutlined /> },
          { key: "orders", label: "My Orders", icon: <ShoppingOutlined /> },
          { key: "wishlist", label: "Wishlist", icon: <HeartOutlined /> },
        ]}
        onClick={({ key }) => { setOpen(false); nav("/" + key); }}
      />
    </>
  )}

  {/* Logout */}
  {isAuthenticated && (
    <div style={{ padding: 16 }}>
      <Button
        block
        danger
        icon={<LogoutOutlined />}
        onClick={() => { logout(); setOpen(false); nav("/"); }}
      >
        Logout
      </Button>
    </div>
  )}
</Drawer>
    </Layout>
  );
}