import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Radio,
  Row,
  Tag,
  Typography,
  message,
} from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CloseCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";
import api from "../lib/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);
  const [validating, setValidating] = useState(false);

  const subtotal = total;
  const discount = appliedCoupon?.discount || 0;
  const grandTotal = Math.max(0, subtotal - discount);

  const applyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    setValidating(true);
    try {
      const res = await api.post("/coupons/validate", {
        code,
        subtotal,
      });
      setAppliedCoupon({ code, discount: res.data.discount });
      message.success(res.data.message || "Coupon applied");
      setCouponInput("");
    } catch (err: any) {
      message.error(err.response?.data?.message || "Invalid coupon");
    } finally {
      setValidating(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    message.info("Coupon removed");
  };

  const onFinish = async (values: any) => {
    if (items.length === 0) {
      message.warning("Your cart is empty");
      return;
    }
    setLoading(true);
    try {
      await api.post("/orders", {
        items: items.map((i) => ({
          product: i.product._id,
          name: i.product.name,
          quantity: i.quantity,
          price: i.product.discountPrice ?? i.product.price,
          variant: i.variant,
        })),
        shippingAddress: values,
        paymentMethod: values.paymentMethod,
        subtotal,
        couponCode: appliedCoupon?.code,
      });
      message.success("Order placed successfully!");
      clearCart();
      nav("/orders");
    } catch (err: any) {
      message.error(err.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <Typography.Title>Checkout</Typography.Title>
      <Row gutter={[32, 32]}>
        <Col xs={24} lg={15}>
          <Card bordered={false}>
            <Form layout="vertical" onFinish={onFinish}>
              <Typography.Title level={4}>Delivery address</Typography.Title>
              <Form.Item label="Full name" name="name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Phone" name="phone" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Address" name="address" rules={[{ required: true }]}>
                <Input.TextArea rows={3} />
              </Form.Item>
              <Form.Item label="City" name="city" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Pincode" name="pincode" rules={[{ required: true }]}>
                <Input />
              </Form.Item>

              <Typography.Title level={4}>Payment</Typography.Title>
              <Form.Item name="paymentMethod" initialValue="Cash on Delivery">
                <Radio.Group options={["Cash on Delivery", "Online Payment"]} />
              </Form.Item>

              <Button
                type="primary"
                size="large"
                block
                style={{ marginTop: 28 }}
                htmlType="submit"
                loading={loading}
              >
                Place Order
              </Button>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={9}>
          <Card bordered={false}>
            <Typography.Title level={4}>Order summary</Typography.Title>

            {items.map((i) => (
              <p key={i.product._id}>
                {i.product.name} × {i.quantity}{" "}
                <b style={{ float: "right" }}>
                  ₹{(i.product.discountPrice ?? i.product.price) * i.quantity}
                </b>
              </p>
            ))}

            <Divider style={{ margin: "16px 0" }} />

            {/* Coupon section */}
            {!appliedCoupon ? (
              <div style={{ marginBottom: 16 }}>
                <Typography.Text type="secondary">
                  Have a coupon?
                </Typography.Text>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <Input
                    placeholder="Enter code (e.g. WELCOME10-XXXXXX)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    onPressEnter={applyCoupon}
                    disabled={validating}
                  />
                  <Button
                    onClick={applyCoupon}
                    loading={validating}
                    type="default"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  marginBottom: 16,
                  padding: "10px 12px",
                  background: "#fff8e6",
                  border: "1px solid #f3dfa2",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <CheckCircleOutlined style={{ color: "#52c41a" }} />
                  <Tag color="gold" style={{ margin: 0 }}>
                    {appliedCoupon.code}
                  </Tag>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    10% off applied
                  </Typography.Text>
                </span>
                <Button
                  type="text"
                  size="small"
                  icon={<CloseCircleOutlined />}
                  onClick={removeCoupon}
                />
              </div>
            )}

            <p>
              Subtotal <span style={{ float: "right" }}>₹{subtotal}</span>
            </p>
            {discount > 0 && (
              <p style={{ color: "#52c41a" }}>
                Discount <span style={{ float: "right" }}>-₹{discount}</span>
              </p>
            )}
            <p>
              Delivery <span style={{ float: "right" }}>Free</span>
            </p>
            <Divider style={{ margin: "12px 0" }} />
            <Typography.Title level={4} style={{ marginTop: 0 }}>
              Total <span style={{ float: "right" }}>₹{grandTotal}</span>
            </Typography.Title>
          </Card>
        </Col>
      </Row>
    </div>
  );
}