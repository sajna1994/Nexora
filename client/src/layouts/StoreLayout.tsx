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
          height: 76,
          display: "flex",
          alignItems: "center",
          gap: 24,
          background: "#fff",
          borderBottom: "1px solid #eee",
          padding: "0 24px",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        {/* Mobile menu button */}
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={() => setOpen(true)}
          className="mobile-menu"
        />

        {/* Logo */}
        <img
          src="/logoo.png"
          alt="NEXORA"
          onClick={() => nav("/")}
          style={{
            height: 54,
            width: "auto",
            cursor: "pointer",
            objectFit: "contain",
          }}
        />

        {/* Search */}
        <div style={{ flex: 1, maxWidth: 560, margin: "0 auto" }}>
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
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Badge count={wishCount} showZero={false} color="#c9a45c">
  <Button
    type="text"
    icon={<HeartOutlined />}
    onClick={() => nav("/wishlist")}
  />
</Badge>

          <Badge count={count} showZero>
            <Button
              type="text"
              icon={<ShoppingOutlined />}
              onClick={() => nav("/cart")}
            />
          </Badge>

          {isAuthenticated ? (
            <Dropdown menu={userMenu} placement="bottomRight" trigger={["click"]}>
              <Space style={{ cursor: "pointer", paddingLeft: 8 }}>
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
                  await api.post("/newsletter", { email });
                  message.success(
                    "Subscribed! Check your inbox for a welcome gift."
                  );
                  input.value = "";
                } catch (err: any) {
                  message.error(
                    err.response?.data?.message || "Could not subscribe"
                  );
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
                <li>
                  <a onClick={() => nav("/shop?category=gym")}>
                    Gym & Supplements
                  </a>
                </li>
                <li>
                  <a onClick={() => nav("/shop?category=fashion")}>Fashion</a>
                </li>
                <li>
                  <a onClick={() => nav("/shop?category=cosmetics")}>
                    Cosmetics
                  </a>
                </li>
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
        open={open}
        onClose={() => setOpen(false)}
        title={
          <img
            src="/logoo.png"
            alt="NEXORA"
            style={{ height: 32, width: "auto", objectFit: "contain" }}
          />
        }
      >
        <Menu
          items={[
            { key: "shop", label: "Shop" },
            { key: "shoes", label: "Shoes" },
            { key: "gym", label: "Gym & Supplements" },
            { key: "fashion", label: "Fashion" },
            { key: "cosmetics", label: "Cosmetics" },
          ]}
          onClick={({ key }) => {
            setOpen(false);
            nav("/shop?category=" + key);
          }}
        />
      </Drawer>
    </Layout>
  );
}