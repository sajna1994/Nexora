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
    e.stopPropagation();
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

  const catName =
    typeof p.category === "string" ? p.category : (p.category as any)?.name;

  return (
    <Card
      className="product-card"
      hoverable
      bodyStyle={{ padding: 10 }}
      cover={
        <div className="product-card-image-wrap">
          <img className="product-image" src={p.image} alt={p.name} loading="lazy" />
          <Button
            shape="circle"
            size="small"
            className="product-card-heart"
            onClick={handleWishlist}
            icon={wished ? <HeartFilled /> : <HeartOutlined />}
          />
        </div>
      }
      onClick={() => nav("/product/" + p._id)}
    >
      <div className="product-card-body">
        {catName && <Tag className="product-card-tag">{catName}</Tag>}
        <Typography.Paragraph
          className="product-card-name"
          ellipsis={{ rows: 2 }}
        >
          {p.name}
        </Typography.Paragraph>
        <div className="product-card-price">
          <b>₹{p.discountPrice ?? p.price}</b>
          {p.discountPrice && (
            <span className="product-card-strike">₹{p.price}</span>
          )}
        </div>
      </div>
    </Card>
  );
}