import { Button, Card, Table, Typography, Modal, Form, Input, InputNumber, message, Popconfirm, Select, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import { useEffect, useState } from "react";
import api from "../../lib/api";

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();
const [fileList, setFileList] = useState<UploadFile[]>([]);

  const load = () =>
    api.get("/products").then((res) => setProducts(res.data));

 useEffect(() => {
  load();
  api.get("/categories").then((res) => setCategories(res.data));
}, []);

// Reload categories when the modal opens
useEffect(() => {
  if (open) {
    api.get("/categories").then((res) => setCategories(res.data));
  }
}, [open]);

  const onFinish = async (values: any) => {
  try {
        const imageUrl = fileList[0]?.url || fileList[0]?.response?.url;

     const payload = {
      ...values,
      images: imageUrl ? [imageUrl] : [],
    };

    if (editing) {
      await api.put(`/products/${editing._id}`, payload);
      message.success("Product updated");
    } else {
      await api.post("/products", payload);
      message.success("Product created");
    }

    setOpen(false);
    setEditing(null);
    setFileList([]);
    form.resetFields();
    load();
  } catch (err: any) {
    message.error(err.response?.data?.message || "Failed to save product");
  }
};

  const onDelete = async (id: string) => {
    await api.delete(`/products/${id}`);
    message.success("Deleted");
    load();
  };

  return (
    <Card className="admin-card">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <Typography.Title level={4}>Products</Typography.Title>
       <Button
  type="primary"
  onClick={() => {
    setEditing(null);
    form.resetFields();
    setFileList([]);
    setOpen(true);
  }}
>
  Add product
</Button>
      </div>

      <Table
        rowKey="_id"
        dataSource={products}
        columns={[
          { title: "Product", dataIndex: "name" },
          {
            title: "Category",
            dataIndex: ["category", "name"],
            render: (x: string) => x || "—",
          },
          { title: "Price", dataIndex: "price", render: (p: number) => `₹${p}` },
          { title: "Stock", dataIndex: "stock" },
          {
            title: "Actions",
            render: (_, record: any) => (
              <>
               <Button
  type="link"
  onClick={() => {
    setEditing(record);

    // Pre-fill form (category may be populated)
    form.setFieldsValue({
      ...record,
      category: record.category?._id,
    });

    // Pre-fill image preview
    const existing = record.images?.[0];
    setFileList(
      existing
        ? [
            {
              uid: "-1",
              name: "current-image",
              status: "done",
              url: existing,
            } as UploadFile,
          ]
        : []
    );

    setOpen(true);
  }}
>
  Edit
</Button>
                <Popconfirm title="Delete this product?" onConfirm={() => onDelete(record._id)}>
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
        title={editing ? "Edit Product" : "Add Product"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        okText="Save"
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item label="Name" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Slug" name="slug">
            <Input />
          </Form.Item>
         <Form.Item label="Category" name="category">
  <Select
    placeholder="Select a category"
    allowClear
    options={categories.map((c) => ({
      value: c._id,
      label: c.name,
    }))}
  />
</Form.Item>
          <Form.Item label="Brand" name="brand">
            <Input />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="Price" name="price" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Discount Price" name="discountPrice">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Stock" name="stock">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
         <Form.Item label="Product Image">
  <Upload
    name="file"
    listType="picture-card"
    fileList={fileList}
    action="/api/upload"
    headers={{
      Authorization: `Bearer ${localStorage.getItem("nexora_token") || ""}`,
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