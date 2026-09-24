import { Card, Typography, Tag, Button, message } from "antd";
import { HeartOutlined, HeartFilled } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";

export type Product = {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  image: string;
  category: string;
  badge?: string;
};

export default function ProductCard({ p }: { p: Product }) {
  const nav = useNavigate();
  const { has, toggle } = useWishlist();
  const wished = has(p._id);

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation(); // don't trigger card click
    toggle({
      _id: p._id,
      name: p.name,
      price: p.price,
      discountPrice: p.discountPrice,
      images: [p.image],
      category: p.category,
    });
    message.success(wished ? "Removed from wishlist" : "Added to wishlist");
  };

  return (
    <Card
      className="product-card"
      hoverable
      cover={
        <div style={{ position: "relative" }}>
          <img className="product-image" src={p.image} alt={p.name} />
          <Button
            shape="circle"
            onClick={handleWishlist}
            icon={wished ? <HeartFilled /> : <HeartOutlined />}
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "rgba(255,255,255,0.9)",
              color: wished ? "#c9a45c" : "#171717",
              border: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          />
        </div>
      }
      onClick={() => nav("/product/" + p._id)}
    >
      <Tag>
        {typeof p.category === "string" ? p.category : (p.category as any)?.name}
      </Tag>
      <Typography.Title level={5} style={{ margin: "12px 0 8px" }}>
        {p.name}
      </Typography.Title>
      <div>
        <b>₹{p.discountPrice ?? p.price}</b>
        {p.discountPrice && (
          <span
            className="muted"
            style={{ textDecoration: "line-through", marginLeft: 10 }}
          >
            ₹{p.price}
          </span>
        )}
      </div>
    </Card>
  );
}