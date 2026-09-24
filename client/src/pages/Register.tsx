import { Button, Card, Form, Input, Typography, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/register", values);
      login(res.data.user, res.data.token);
      message.success("Account created!");
      nav("/");
    } catch (err: any) {
      message.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 520 }}>
      <Card bordered={false}>
        <Typography.Title>Create account</Typography.Title>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="Name" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Email" name="email" rules={[{ required: true, type: "email" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true, min: 6 }]}>
            <Input.Password />
          </Form.Item>
          <Button type="primary" size="large" block htmlType="submit" loading={loading}>
            Create account
          </Button>
        </Form>
        <p style={{ marginTop: 20 }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </Card>
    </div>
  );
}