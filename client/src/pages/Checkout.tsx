import { Button, Card, Col, Form, Input, Radio, Row, Typography, message } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    if (items.length === 0) {
      message.warning("Your cart is empty");
      return;
    }
    setLoading(true);
    try {
      await api.post("/orders", {
        user: user?.id,
        items: items.map((i) => ({
          product: i.product._id,
          name: i.product.name,
          quantity: i.quantity,
          price: i.product.discountPrice ?? i.product.price,
          variant: i.variant,
        })),
        shippingAddress: values,
        paymentMethod: values.paymentMethod,
        total,
      });
      message.success("Order placed successfully!");
      clearCart();
      nav("/orders");
    } catch {
      message.error("Failed to place order");
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
            <p>
              Delivery <b style={{ float: "right" }}>Free</b>
            </p>
            <Typography.Title level={4}>₹{total}</Typography.Title>
          </Card>
        </Col>
      </Row>
    </div>
  );
}