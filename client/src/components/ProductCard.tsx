import { Card, Typography, Tag } from "antd";
import { useNavigate } from "react-router-dom";
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
  return (
    <Card
      className="product-card"
      hoverable
      cover={<img className="product-image" src={p.image} alt={p.name} />}
      onClick={() => nav("/product/" + p._id)}
    >
      <Tag>{p.category}</Tag>
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
