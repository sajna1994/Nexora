import {
  Button,
  Card,
  Table,
  Typography,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Popconfirm,
  Select,
  Upload,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import { useEffect, useState } from "react";
import api from "../../lib/api";
import DynamicProductFields, { FieldDef } from "./DynamicProductFields";
import imageCompression from "browser-image-compression";

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const selectedCategoryId = Form.useWatch("category", form);
  const selectedCategory = categories.find((c) => c._id === selectedCategoryId);
  const fields: FieldDef[] = selectedCategory?.fields || [];

  const load = () =>
    api.get("/products").then((res) => setProducts(res.data));

  useEffect(() => {
    load();
    api.get("/categories").then((res) => setCategories(res.data));
  }, []);

  // Refresh categories when modal opens (picks up new ones)
  useEffect(() => {
    if (open) {
      api.get("/categories").then((res) => setCategories(res.data));
    }
  }, [open]);

  async function compressImage(file: File): Promise<File> {
    // Skip tiny files — no need to waste CPU
    if (file.size < 1_000_000) return file;
    return imageCompression(file, {
      maxSizeMB: 0.8,
      maxWidthOrHeight: 1600,
      useWebWorker: true,
    });
  }

  const onFinish = async (values: any) => {
    try {
      const imageUrl = fileList[0]?.url || (fileList[0]?.response as any)?.url;
      const payload = {
        ...values,
        images: imageUrl ? [imageUrl] : [],
        attributes: values.attributes || {},
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
      {/* ── Page header ─────────────────────────────── */}
      <div className="admin-page-header">
        <Typography.Title level={4} style={{ margin: 0 }}>
          Products
        </Typography.Title>
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

      {/* ── Products table ──────────────────────────── */}
      <Table
        rowKey="_id"
        dataSource={products}
        scroll={{ x: "max-content" }}
        columns={[
          {
            title: "Image",
            dataIndex: "images",
            width: 80,
            render: (imgs: string[]) =>
              imgs?.[0] ? (
                <img
                  src={imgs[0]}
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
                    form.setFieldsValue({
                      ...record,
                      category: record.category?._id,
                      attributes: record.attributes || {},
                    });

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
                <Popconfirm
                  title="Delete this product?"
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

      {/* ── Add / Edit modal ────────────────────────── */}
      <Modal
        title={editing ? "Edit Product" : "Add Product"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        okText="Save"
        width={640}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item label="Name" name="name" rules={[{ required: true }]}>
            <Input
              onChange={(e) => {
                const slug = e.target.value
                  .toLowerCase()
                  .trim()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/(^-|-$)/g, "");
                form.setFieldValue("slug", slug);
              }}
            />
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

          {/* Dynamic, category-driven fields */}
          {fields.length > 0 && selectedCategory && (
            <>
              <Typography.Title level={5} style={{ marginTop: 16 }}>
                {selectedCategory.name} Details
              </Typography.Title>
              <DynamicProductFields fields={fields} />
            </>
          )}

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
              customRequest={async ({ file, onSuccess, onError }) => {
                try {
                  const original = file as File;

                  // 1. Client-side validation
                  if (!original.type.startsWith("image/")) {
                    message.error("Only image files are allowed");
                    onError?.(new Error("Not an image"));
                    return;
                  }

                  // 2. Compress before upload
                  const compressed = await compressImage(original);

                  // 3. Upload the compressed file
                  const formData = new FormData();
                  formData.append("file", compressed, original.name);

                  const res = await api.post("/upload", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                  });

                  // 4. Antd needs the response on the file object
                  onSuccess?.(res.data, compressed as any);
                } catch (err: any) {
                  const msg =
                    err.response?.data?.message ||
                    err.message ||
                    "Upload failed. Please try again.";
                  message.error(msg);
                  onError?.(err);
                }
              }}
              accept="image/*"
              maxCount={1}
              onChange={({ file, fileList: newList }) => {
                setFileList(newList);
                // Remove failed files from the list automatically
                if (file.status === "error") {
                  setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
                }
              }}
              onRemove={() => setFileList([])}
            >
              {fileList.length >= 1 ? null : (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
            <Typography.Text
              type="secondary"
              style={{ fontSize: 12, display: "block", marginTop: 4 }}
            >
              JPG, PNG, WebP · Auto-compressed to &lt; 800 KB
            </Typography.Text>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}