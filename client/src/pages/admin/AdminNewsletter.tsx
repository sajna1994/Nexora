import {
  Button,
  Card,
  Table,
  Typography,
  Popconfirm,
  message,
  Input,
  Space,
  Tag,
} from "antd";
import {
  DownloadOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import api from "../../lib/api";

type Subscriber = {
  _id: string;
  email: string;
  source?: string;
  isActive: boolean;
  createdAt: string;
};

export default function AdminNewsletter() {
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    api
      .get("/newsletter")
      .then((res) => setSubs(res.data))
      .catch(() => message.error("Failed to load subscribers"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id: string) => {
    try {
      await api.delete(`/newsletter/${id}`);
      message.success("Removed");
      setSubs((prev) => prev.filter((s) => s._id !== id));
    } catch {
      message.error("Delete failed");
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return subs;
    return subs.filter((s) => s.email.toLowerCase().includes(q));
  }, [subs, search]);

  return (
    <Card className="admin-card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <Typography.Title level={4} style={{ margin: 0 }}>
          Newsletter Subscribers
        </Typography.Title>

        <Space wrap>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Search email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 240 }}
          />
          <Button icon={<ReloadOutlined />} onClick={load}>
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            href="/api/newsletter/export"
            target="_blank"
            onClick={(e) => {
              // Anchor href doesn't send Authorization header,
              // so fetch + blob instead:
              e.preventDefault();
              downloadCsv();
            }}
          >
            Export CSV
          </Button>
        </Space>
      </div>

      <Table
        rowKey="_id"
        loading={loading}
        dataSource={filtered}
        pagination={{ pageSize: 20, showSizeChanger: true }}
        columns={[
          {
            title: "#",
            width: 60,
            render: (_: any, __: any, i: number) => i + 1,
          },
          {
            title: "Email",
            dataIndex: "email",
            render: (v: string) => <b>{v}</b>,
          },
          {
            title: "Source",
            dataIndex: "source",
            width: 120,
            render: (v?: string) => <Tag color="gold">{v || "footer"}</Tag>,
          },
          {
            title: "Status",
            dataIndex: "isActive",
            width: 110,
            render: (v: boolean) =>
              v ? <Tag color="green">Active</Tag> : <Tag>Unsubscribed</Tag>,
          },
          {
            title: "Subscribed At",
            dataIndex: "createdAt",
            width: 200,
            render: (d: string) =>
              new Date(d).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              }),
          },
          {
            title: "Actions",
            width: 100,
            render: (_: any, r: Subscriber) => (
              <Popconfirm
                title="Remove this subscriber?"
                onConfirm={() => onDelete(r._id)}
              >
                <Button danger type="text" icon={<DeleteOutlined />} />
              </Popconfirm>
            ),
          },
        ]}
      />

      <Typography.Paragraph
        type="secondary"
        style={{ marginTop: 12, marginBottom: 0 }}
      >
        Total: <b>{subs.length}</b> subscribers
        {search && (
          <>
            {" "}
            · Showing <b>{filtered.length}</b> matching “{search}”
          </>
        )}
      </Typography.Paragraph>
    </Card>
  );
}

/* ── CSV download that includes the auth token ──────── */
async function downloadCsv() {
  try {
    const res = await api.get("/newsletter/export", {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexora-subscribers-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    message.success("Exported");
  } catch {
    message.error("Export failed");
  }
}