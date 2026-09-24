import {
  Button,
  Card,
  Table,
  Typography,
  Modal,
  Form,
  Input,
  Upload,
  message,
  Popconfirm,
  Switch,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import { useEffect, useState } from "react";
import api from "../../lib/api";

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();

  const load = () =>
    api.get("/categories").then((res) => setCategories(res.data));

  useEffect(() => {
    load();
  }, []);

  const onFinish = async (values: any) => {
    try {
      const imageUrl = fileList[0]?.url || fileList[0]?.response?.url;

      const payload = {
        ...values,
        image: imageUrl || undefined,
      };

      if (editing) {
        await api.put(`/categories/${editing._id}`, payload);
        message.success("Category updated");
      } else {
        await api.post("/categories", payload);
        message.success("Category created");
      }

      setOpen(false);
      setEditing(null);
      setFileList([]);
      form.resetFields();
      load();
    } catch (err: any) {
      message.error(err.response?.data?.message || "Failed to save category");
    }
  };

  const onDelete = async (id: string) => {
    await api.delete(`/categories/${id}`);
    message.success("Deleted");
    load();
  };

  return (
    <Card className="admin-card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Typography.Title level={4}>Categories</Typography.Title>
        <Button
          type="primary"
          onClick={() => {
            setEditing(null);
            form.resetFields();
            setFileList([]);
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
          {
            title: "Image",
            dataIndex: "image",
            width: 80,
            render: (img: string) =>
              img ? (
                <img
                  src={img}
                  alt=""
                  style={{
                    width: 48,
                    height: 48,
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 8,
                    background: "#f1efea",
                  }}
                />
              ),
          },
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

                    // Pre-fill image preview
                    setFileList(
                      record.image
                        ? [
                            {
                              uid: "-1",
                              name: "current-image",
                              status: "done",
                              url: record.image,
                            } as UploadFile,
                          ]
                        : []
                    );

                    setOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Popconfirm
                  title="Delete?"
                  onConfirm={() => onDelete(record._id)}
                >
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
        okText="Save"
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Slug" name="slug">
            <Input placeholder="e.g. gym-supplements" />
          </Form.Item>

          <Form.Item label="Active" name="isActive" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>

          {/* Image upload */}
          <Form.Item label="Category Image">
            <Upload
              name="file"
              listType="picture-card"
              fileList={fileList}
              action="/api/upload"
              headers={{
                Authorization: `Bearer ${
                  localStorage.getItem("nexora_token") || ""
                }`,
              }}
              accept="image/*"
              maxCount={1}
              onChange={({ fileList: newList }) => setFileList(newList)}
              onRemove={() => setFileList([])}
            >
              {fileList.length >= 1 ? null : (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}