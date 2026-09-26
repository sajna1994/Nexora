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
  Col,
  Select,
  Row,
} from "antd";
import {
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import { useEffect, useState } from "react";
import api from "../../lib/api";
import { uploadImage } from "../../lib/uploadImage"; // ← helper

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
      const imageUrl =
        fileList[0]?.url ||
        (fileList[0]?.response as any)?.url;

      const fields = (values.fields || []).map((f: any, idx: number) => ({
        key: f.key,
        label: f.label,
        type: f.type || "text",
        required: !!f.required,
        options: f.optionsText
          ? String(f.optionsText)
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
        order: idx,
      }));

      const payload = {
        name: values.name,
        slug: values.slug,
        isActive: values.isActive,
        image: imageUrl || undefined,
        fields,
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
     <div className="admin-page-header">
  <Typography.Title level={4} style={{ margin: 0 }}>
    Categories
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
    Add category
  </Button>
</div>

      <Table
        rowKey="_id"
        dataSource={categories}
        scroll={{ x: "max-content" }}
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
            title: "Fields",
            dataIndex: "fields",
            width: 80,
            render: (f: any[]) => f?.length || 0,
          },
          {
            title: "Actions",
            render: (_, record: any) => (
              <>
                <Button
                  type="link"
                  onClick={() => {
                    setEditing(record);

                    // Pre-fill form values — including dynamic fields with
                    // `optionsText` derived from `options`
                    form.setFieldsValue({
                      ...record,
                      fields: (record.fields || []).map((f: any) => ({
                        key: f.key,
                        label: f.label,
                        type: f.type,
                        required: f.required,
                        optionsText: (f.options || []).join(","),
                      })),
                    });

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
        width={720}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item label="Name" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Slug" name="slug">
            <Input placeholder="e.g. gym-supplements" />
          </Form.Item>

          <Form.Item
            label="Active"
            name="isActive"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>

          {/* ── Image upload ──────────────────────────────── */}
          <Form.Item label="Category Image">
            <Upload
              name="file"
              listType="picture-card"
              fileList={fileList}
              customRequest={async ({ file, onSuccess, onError }) => {
                try {
                  const url = await uploadImage(file as File);
                  onSuccess?.({ url });
                } catch (err: any) {
                  message.error(err.message || "Upload failed");
                  onError?.(err);
                }
              }}
              accept="image/*"
              maxCount={1}
              onChange={({ file, fileList: newList }) => {
                setFileList(newList);
                if (file.status === "error") {
                  setFileList((prev) =>
                    prev.filter((f) => f.uid !== file.uid)
                  );
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

          {/* ── Category-specific product fields ──────────── */}
          <Form.List name="fields">
            {(fieldRows, { add, remove }) => (
              <>
                <Typography.Title level={5} style={{ marginTop: 24 }}>
                  Product Fields
                </Typography.Title>
                <Typography.Text
                  type="secondary"
                  style={{ display: "block", marginBottom: 12 }}
                >
                  Define the fields shown when adding a product in this
                  category.
                </Typography.Text>

                {fieldRows.map((row) => (
                  <Card
                    key={row.key}
                    size="small"
                    style={{ marginBottom: 12, background: "#faf9f7" }}
                    bordered
                  >
                    <Row gutter={8}>
                      <Col span={11}>
                        <Form.Item
                          {...row}
                          name={[row.name, "label"]}
                          label="Label"
                          rules={[
                            { required: true, message: "Label required" },
                          ]}
                          style={{ marginBottom: 8 }}
                        >
                          <Input placeholder="e.g. Available Sizes" />
                        </Form.Item>
                      </Col>
                      <Col span={11}>
                        <Form.Item
                          {...row}
                          name={[row.name, "key"]}
                          label="Key"
                          rules={[
                            { required: true, message: "Key required" },
                          ]}
                          style={{ marginBottom: 8 }}
                        >
                          <Input placeholder="e.g. size" />
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        <Button
                          danger
                          type="text"
                          icon={<DeleteOutlined />}
                          onClick={() => remove(row.name)}
                          style={{ marginTop: 30 }}
                        />
                      </Col>
                    </Row>

                    <Row gutter={8}>
                      <Col span={11}>
                        <Form.Item
                          {...row}
                          name={[row.name, "type"]}
                          label="Type"
                          initialValue="text"
                          style={{ marginBottom: 8 }}
                        >
                          <Select
                            options={[
                              { value: "text", label: "Text" },
                              { value: "textarea", label: "Text Area" },
                              { value: "number", label: "Number" },
                              { value: "select", label: "Single Select" },
                              {
                                value: "multi-select",
                                label: "Multi Select",
                              },
                              { value: "boolean", label: "Yes / No" },
                            ]}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={11}>
                        <Form.Item
                          {...row}
                          name={[row.name, "required"]}
                          label="Required"
                          valuePropName="checked"
                          style={{ marginBottom: 8 }}
                        >
                          <Switch />
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* Options — only for select types */}
                    <Form.Item
                      noStyle
                      shouldUpdate={(prev, cur) =>
                        prev.fields?.[row.name]?.type !==
                        cur.fields?.[row.name]?.type
                      }
                    >
                      {({ getFieldValue }) => {
                        const type = getFieldValue([
                          "fields",
                          row.name,
                          "type",
                        ]);
                        if (type !== "select" && type !== "multi-select")
                          return null;
                        return (
                          <Form.Item
                            {...row}
                            name={[row.name, "optionsText"]}
                            label="Options (comma separated)"
                            rules={[
                              { required: true, message: "Add options" },
                            ]}
                          >
                            <Input placeholder="6,7,8,9,10" />
                          </Form.Item>
                        );
                      }}
                    </Form.Item>
                  </Card>
                ))}

                <Button
                  type="dashed"
                  onClick={() => add({ type: "text" })}
                  block
                  icon={<PlusOutlined />}
                >
                  Add field
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </Card>
  );
}