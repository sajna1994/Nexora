import { Card, Form, Input, Typography, Button, message } from "antd";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="page" style={{ maxWidth: 800 }}>
      <Typography.Title>My Profile</Typography.Title>
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