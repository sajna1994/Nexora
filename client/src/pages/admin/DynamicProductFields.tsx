import { Form, Input, InputNumber, Select, Switch, Space, Button } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";

export type FieldDef = {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "select" | "multi-select" | "boolean";
  options?: string[];
  required?: boolean;
  placeholder?: string;
  unit?: string;
};

export default function DynamicProductFields({
  fields,
}: {
  fields: FieldDef[];
}) {
  if (!fields || fields.length === 0) return null;

  return (
    <>
      {fields
        .slice()
        .sort((a, b) => (a.key > b.key ? 1 : -1))
        .map((f) => {
          const name = ["attributes", f.key];
          const rules = f.required
            ? [{ required: true, message: `${f.label} is required` }]
            : [];

          switch (f.type) {
            case "textarea":
              return (
                <Form.Item
                  key={f.key}
                  label={f.label}
                  name={name}
                  rules={rules}
                >
                  <Input.TextArea rows={3} placeholder={f.placeholder} />
                </Form.Item>
              );

            case "number":
              return (
                <Form.Item
                  key={f.key}
                  label={f.unit ? `${f.label} (${f.unit})` : f.label}
                  name={name}
                  rules={rules}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder={f.placeholder}
                  />
                </Form.Item>
              );

            case "select":
              return (
                <Form.Item
                  key={f.key}
                  label={f.label}
                  name={name}
                  rules={rules}
                >
                  <Select
                    allowClear
                    placeholder={f.placeholder || `Select ${f.label}`}
                    options={(f.options || []).map((o) => ({
                      value: o,
                      label: o,
                    }))}
                  />
                </Form.Item>
              );

            case "multi-select":
              return (
                <Form.Item
                  key={f.key}
                  label={f.label}
                  name={name}
                  rules={rules}
                >
                  <Select
                    mode="multiple"
                    allowClear
                    placeholder={f.placeholder || `Select ${f.label}`}
                    options={(f.options || []).map((o) => ({
                      value: o,
                      label: o,
                    }))}
                  />
                </Form.Item>
              );

            case "boolean":
              return (
                <Form.Item
                  key={f.key}
                  label={f.label}
                  name={name}
                  valuePropName="checked"
                  rules={rules}
                >
                  <Switch />
                </Form.Item>
              );

            case "text":
            default:
              return (
                <Form.Item
                  key={f.key}
                  label={f.label}
                  name={name}
                  rules={rules}
                >
                  <Input placeholder={f.placeholder} />
                </Form.Item>
              );
          }
        })}
    </>
  );
}