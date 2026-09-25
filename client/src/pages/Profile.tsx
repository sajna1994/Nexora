import {
  Card,
  Form,
  Input,
  Typography,
  Button,
  message,
  Tag,
  Space,
  Alert,
} from "antd";
import { CopyOutlined, GiftOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();
  const [welcomeCode, setWelcomeCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const code = localStorage.getItem("nexora_welcome_code");
    if (code) setWelcomeCode(code);
  }, []);

  const copyCode = async () => {
    if (!welcomeCode) return;
    try {
      await navigator.clipboard.writeText(welcomeCode);
      setCopied(true);
      message.success("Code copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      message.error("Couldn't copy — please copy manually");
    }
  };

  return (
    <div className="page" style={{ maxWidth: 800 }}>
      <Typography.Title>My Profile</Typography.Title>

      {/* ── Welcome code card ──────────────────────────── */}
      {welcomeCode && (
        <Card
          bordered={false}
          style={{
            marginBottom: 24,
            background:
              "linear-gradient(135deg, #1a1a1a 0%, #2a2520 100%)",
            border: "1px solid rgba(201, 164, 92, 0.35)",
            boxShadow: "0 0 60px rgba(201, 164, 92, 0.08)",
          }}
        >
          <Space
            align="start"
            style={{ width: "100%", justifyContent: "space-between" }}
          >
            <div>
              <Space align="center" style={{ marginBottom: 6 }}>
                <GiftOutlined
                  style={{ color: "#c9a45c", fontSize: 22 }}
                />
                <Typography.Title
                  level={4}
                  style={{ margin: 0, color: "#fff" }}
                >
                  Your Welcome Gift
                </Typography.Title>
              </Space>
              <Typography.Paragraph
                style={{ color: "#b8b8b8", marginBottom: 16 }}
              >
                Enjoy <b style={{ color: "#c9a45c" }}>10% off</b> your first
                order. Paste this code at checkout.
              </Typography.Paragraph>

              <Space wrap>
                <Tag
                  style={{
                    fontSize: 16,
                    padding: "6px 14px",
                    background: "#0e0e0e",
                    border: "1px dashed #c9a45c",
                    color: "#c9a45c",
                    fontFamily: "monospace",
                    letterSpacing: 1,
                    margin: 0,
                  }}
                >
                  {welcomeCode}
                </Tag>
                <Button
                  type="primary"
                  icon={<CopyOutlined />}
                  onClick={copyCode}
                >
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </Space>
            </div>
          </Space>
        </Card>
      )}

      {/* ── Profile form ───────────────────────────────── */}
      <Card bordered={false}>
        <Form
          layout="vertical"
          initialValues={{ name: user?.name, email: user?.email }}
          onFinish={() => message.success("Profile saved")}
        >
          <Form.Item label="Name" name="name">
            <Input />
          </Form.Item>
          <Form.Item label="Email" name="email">
            <Input disabled />
          </Form.Item>
          <Form.Item label="Phone" name="phone">
            <Input />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Save changes
          </Button>
        </Form>
      </Card>
    </div>
  );
}