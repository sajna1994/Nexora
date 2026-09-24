import { Button, Card, Table, Typography, Modal, Form, Input, message, Popconfirm } from "antd";
import { useEffect, useState } from "react";
import api from "../../lib/api";

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();

  const load = () => api.get("/categories").then((res) => setCategories(res.data));

  useEffect(() => {
    load();
  }, []);

  const onFinish = async (values: any) => {
    if (editing) {
      await api.put(`/categories/${editing._id}`, values);
      message.success("Category updated");
    } else {
      await api.post("/categories", values);
      message.success("Category created");
    }
    setOpen(false);
    setEditing(null);
    form.resetFields();
    load();
  };

  const onDelete = async (id: string) => {
    await api.delete(`/categories/${id}`);
    message.success("Deleted");
    load();
  };

  return (
    <Card className="admin-card">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <Typography.Title level={4}>Categories</Typography.Title>
        <Button
          type="primary"
          onClick={() => {
            setEditing(null);
            form.resetFields();
            setOpen(true);
          }}
        >
          Add category
        </Button>
      </div>

      <Table
        rowKey="_id"
        dataSource={categories}
        columns={[
          { title: "Category", dataIndex: "name" },
          { title: "Slug", dataIndex: "slug" },
          {
            title: "Active",
            dataIndex: "isActive",
            render: (v: boolean) => (v ? "Yes" : "No"),
          },
          {
            title: "Actions",
            render: (_, record: any) => (
              <>
                <Button
                  type="link"
                  onClick={() => {
                    setEditing(record);
                    form.setFieldsValue(record);
                    setOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Popconfirm title="Delete?" onConfirm={() => onDelete(record._id)}>
                  <Button type="link" danger>
                    Delete
                  </Button>
                </Popconfirm>
              </>
            ),
          },
        ]}
      />

      <Modal
        title={editing ? "Edit Category" : "Add Category"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item label="Name" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Slug" name="slug">
            <Input />
          </Form.Item>
          <Form.Item label="Image URL" name="images">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}