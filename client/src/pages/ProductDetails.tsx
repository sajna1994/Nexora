import {
  Button,
  Col,
  InputNumber,
  Row,
  Space,
  Tag,
  Typography,
  Spin,
  message,
} from "antd";
import { ShoppingOutlined, HeartOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../lib/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>({});

  const { addToCart } = useCart();
  const { isAdmin, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!id) return;
    api
      .get(`/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch(() => message.error("Product not found"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="page">
        <Spin size="large" />
      </div>
    );

  if (!product)
    return (
      <div className="page">
        <Typography.Title>Product not found</Typography.Title>
      </div>
    );

  const handleAdd = () => {
    addToCart(product, quantity, selectedVariant);
    message.success("Added to cart");
  };

  const specs = product.specifications
    ? Object.entries(product.specifications)
        .map(([k, v]) => `${k}: ${v}`)
        .join(" · ")
    : "—";

  return (
    <div className="page">
      <Row gutter={[48, 48]}>
        <Col xs={24} md={12}>
          <img
            src={product.images?.[0] || "https://via.placeholder.com/600"}
            alt={product.name}
            style={{ width: "100%", borderRadius: 24 }}
          />
        </Col>

        <Col xs={24} md={12}>
          <Tag>{product.category?.name || "Product"}</Tag>
          <Typography.Title>{product.name}</Typography.Title>

          <Typography.Title level={2}>
            ₹{product.discountPrice ?? product.price}
            {product.discountPrice && (
              <span
                className="muted"
                style={{
                  textDecoration: "line-through",
                  fontSize: 18,
                  marginLeft: 12,
                }}
              >
                ₹{product.price}
              </span>
            )}
          </Typography.Title>

          <Typography.Paragraph className="muted">
            {product.description || "No description available."}
          </Typography.Paragraph>

          {product.variants?.map((v: any) => (
            <div key={v.name}>
              <Typography.Title level={5}>{v.name}</Typography.Title>
              <Space wrap>
                {v.options.map((opt: string) => (
                  <Button
                    key={opt}
                    type={
                      selectedVariant[v.name] === opt ? "primary" : "default"
                    }
                    onClick={() =>
                      setSelectedVariant({ ...selectedVariant, [v.name]: opt })
                    }
                  >
                    {opt}
                  </Button>
                ))}
              </Space>
            </div>
          ))}

          <Typography.Title level={5}>Quantity</Typography.Title>
          <InputNumber
            min={1}
            value={quantity}
            onChange={(v) => setQuantity(v || 1)}
          />

          <div style={{ marginTop: 28 }}>
            <Space>
              {!isAdmin && (
                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingOutlined />}
                  onClick={handleAdd}
                >
                  Add to cart
                </Button>
              )}

              {isAuthenticated && (
                <Button size="large" icon={<HeartOutlined />} />
              )}
            </Space>
          </div>

          <div style={{ marginTop: 40 }}>
            <Typography.Title level={4}>Specifications</Typography.Title>
            <p>{specs}</p>
            <p className="muted">Stock: {product.stock}</p>
          </div>
        </Col>
      </Row>
    </div>
  );
}