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
import {
  HeartOutlined,
  HeartFilled,
  ShoppingOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../lib/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>({});
  const nav = useNavigate();

  const { addToCart } = useCart();
  const { isAdmin, isAuthenticated } = useAuth();
  const { has, toggle } = useWishlist();

  const handleWishlist = () => {
    if (!isAuthenticated) {
      message.info("Sign in to save to wishlist");
      nav("/login");
      return;
    }
    if (!product) return;
    toggle(product);
    message.success(
      has(product._id) ? "Removed from wishlist" : "Added to wishlist"
    );
  };

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
    <>
      <div className="page product-details-page">
        <Row gutter={[24, 24]}>
          {/* ── Product image ─────────────────────────── */}
          <Col xs={24} md={12}>
            <img
              src={product.images?.[0] || "https://via.placeholder.com/600"}
              alt={product.name}
              style={{ width: "100%", borderRadius: 16 }}
            />
          </Col>

          {/* ── Product info ──────────────────────────── */}
          <Col xs={24} md={12}>
            <Tag>{product.category?.name || "Product"}</Tag>
            <Typography.Title level={3} style={{ marginTop: 8 }}>
              {product.name}
            </Typography.Title>

            <Typography.Title level={2} style={{ margin: "8px 0" }}>
              ₹{product.discountPrice ?? product.price}
              {product.discountPrice && (
                <span
                  className="muted"
                  style={{
                    textDecoration: "line-through",
                    fontSize: 16,
                    marginLeft: 10,
                  }}
                >
                  ₹{product.price}
                </span>
              )}
            </Typography.Title>

            <Typography.Paragraph className="muted">
              {product.description || "No description available."}
            </Typography.Paragraph>

            {/* ── Variants (legacy + new) ───────────────── */}
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
                        setSelectedVariant({
                          ...selectedVariant,
                          [v.name]: opt,
                        })
                      }
                    >
                      {opt}
                    </Button>
                  ))}
                </Space>
              </div>
            ))}

            <Typography.Title level={5} style={{ marginTop: 20 }}>
              Quantity
            </Typography.Title>
            <InputNumber
              min={1}
              value={quantity}
              onChange={(v) => setQuantity(v || 1)}
            />

            {/* ── Desktop-only actions ──────────────────── */}
            <div className="desktop-only" style={{ marginTop: 24 }}>
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
                <Button
                  size="large"
                  icon={
                    has(product._id) ? <HeartFilled /> : <HeartOutlined />
                  }
                  onClick={handleWishlist}
                />
              </Space>
            </div>

            {/* ── Specifications ────────────────────────── */}
            <div style={{ marginTop: 40 }}>
              <Typography.Title level={4}>Specifications</Typography.Title>

              {/* Dynamic attributes from the category */}
              {product.attributes &&
                Object.keys(product.attributes).length > 0 && (
                  <>
                    <Typography.Title level={5} style={{ marginTop: 16 }}>
                      Product Details
                    </Typography.Title>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "8px 24px",
                      }}
                    >
                      {Object.entries(product.attributes).map(
                        ([key, value]) => {
                          const label =
                            product.category?.fields?.find(
                              (f: any) => f.key === key
                            )?.label || key;

                          const display = Array.isArray(value)
                            ? value.join(", ")
                            : typeof value === "boolean"
                            ? value
                              ? "Yes"
                              : "No"
                            : String(value);

                          return (
                            <div key={key}>
                              <Typography.Text
                                type="secondary"
                                style={{ fontSize: 12 }}
                              >
                                {label}
                              </Typography.Text>
                              <div style={{ fontWeight: 500 }}>{display}</div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </>
                )}

              <p style={{ marginTop: 16 }}>{specs}</p>
              <p className="muted">Stock: {product.stock}</p>
            </div>
          </Col>
        </Row>
      </div>

      {/* ── Mobile sticky CTA ─────────────────────────── */}
      <div className="mobile-sticky-cta">
        <Button
          shape="circle"
          size="large"
          icon={has(product._id) ? <HeartFilled /> : <HeartOutlined />}
          onClick={handleWishlist}
          style={{
            color: has(product._id) ? "#c9a45c" : undefined,
            borderColor: has(product._id) ? "#c9a45c" : undefined,
          }}
        />
        {!isAdmin && (
          <Button
            type="primary"
            size="large"
            icon={<ShoppingOutlined />}
            onClick={handleAdd}
            style={{ flex: 1 }}
          >
            Add to cart · ₹{product.discountPrice ?? product.price}
          </Button>
        )}
      </div>
    </>
  );
}