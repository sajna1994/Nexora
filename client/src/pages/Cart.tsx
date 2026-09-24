import { Button, Card, Col, Divider, Empty, InputNumber, Row, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const nav = useNavigate();
  const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();

  if (items.length === 0)
    return (
      <div className="page">
        <Typography.Title>Your Cart</Typography.Title>
        <Empty description="Your cart is empty" />
      </div>
    );

  return (
    <div className="page">
      <Typography.Title>Your Cart</Typography.Title>
      <Row gutter={[32, 32]}>
        <Col xs={24} lg={16}>
          {items.map((item) => (
            <Card bordered={false} key={item.product._id} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                <img
                  src={item.product.images?.[0] || "https://via.placeholder.com/300"}
                  width={100}
                  style={{ borderRadius: 12, objectFit: "cover", height: 100 }}
                />
                <div style={{ flex: 1 }}>
                  <b>{item.product.name}</b>
                  {item.variant && (
                    <p className="muted">
                      {Object.entries(item.variant)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(" · ")}
                    </p>
                  )}
                </div>
                <InputNumber
                  min={1}
                  value={item.quantity}
                  onChange={(v) => updateQuantity(item.product._id, v || 1)}
                />
                <b>₹{(item.product.discountPrice ?? item.product.price) * item.quantity}</b>
                <Button danger type="text" onClick={() => removeFromCart(item.product._id)}>
                  Remove
                </Button>
              </div>
            </Card>
          ))}
        </Col>
        <Col xs={24} lg={8}>
          <Card bordered={false}>
            <Typography.Title level={4}>Order summary</Typography.Title>
            <p>
              Subtotal <span style={{ float: "right" }}>₹{total}</span>
            </p>
            <p>
              Delivery <span style={{ float: "right" }}>Free</span>
            </p>
            <Divider />
            <b>
              Total <span style={{ float: "right" }}>₹{total}</span>
            </b>
            <Button
              block
              type="primary"
              size="large"
              style={{ marginTop: 24 }}
              onClick={() => nav("/checkout")}
            >
              Checkout
            </Button>
            <Button block type="text" danger style={{ marginTop: 12 }} onClick={clearCart}>
              Clear cart
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
}