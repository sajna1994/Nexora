import { Badge } from "antd";
import {
  HomeOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  HeartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";

export default function MobileBottomNav() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const { count } = useCart();
  const { count: wishCount } = useWishlist();
  const { isAuthenticated } = useAuth();

  const items = [
    { key: "/", label: "Home", icon: <HomeOutlined /> },
    { key: "/shop", label: "Shop", icon: <AppstoreOutlined /> },
    {
      key: "/cart",
      label: "Cart",
      icon: (
        <Badge count={count} size="small" offset={[2, -2]} color="#b8892d">
          <ShoppingOutlined />
        </Badge>
      ),
    },
    {
      key: "/wishlist",
      label: "Wishlist",
      icon: (
        <Badge count={wishCount} size="small" offset={[2, -2]} color="#b8892d">
          <HeartOutlined />
        </Badge>
      ),
    },
    {
      key: isAuthenticated ? "/profile" : "/login",
      label: isAuthenticated ? "You" : "Sign in",
      icon: <UserOutlined />,
    },
  ];

  const isActive = (key: string) =>
    key === "/" ? pathname === "/" : pathname.startsWith(key);

  return (
    <nav className="mobile-bottom-nav">
      {items.map((item) => (
        <div
          key={item.key}
          className={
            "mobile-bottom-nav-item" + (isActive(item.key) ? " active" : "")
          }
          onClick={() => nav(item.key)}
        >
          {item.icon}
          <span>{item.label}</span>
        </div>
      ))}
    </nav>
  );
}