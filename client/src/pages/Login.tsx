import { Button, Card, Form, Input, Typography, message } from "antd";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
   const nav = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from as string | undefined;
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

   const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", values);
      login(res.data.user, res.data.token);
      message.success("Welcome back!");

      // Redirect: admin → /admin, customer → home or previous page
      if (res.data.user.role === "admin") nav("/admin");
      else nav(from || "/");
    } catch (err: any) {
      message.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 520 }}>
      <Card bordered={false}>
        <Typography.Title>Welcome back</Typography.Title>
        <p className="muted">Sign in to continue shopping.</p>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="Email" name="email" rules={[{ required: true, type: "email" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Button type="primary" size="large" block htmlType="submit" loading={loading}>
            Sign in
          </Button>
        </Form>
        <p style={{ marginTop: 20 }}>
          New to NEXORA? <Link to="/register">Create account</Link>
        </p>
      </Card>
    </div>
  );
}