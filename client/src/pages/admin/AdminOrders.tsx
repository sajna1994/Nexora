import { Card, Table, Typography, Tag, Select, message } from "antd";
import { useEffect, useState } from "react";
import api from "../../lib/api";

const STATUSES = ["Processing", "Shipped", "Delivered", "Cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);

  const load = () => api.get("/orders").then((res) => setOrders(res.data));

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await api.patch(`/orders/${id}/status`, { status });
    message.success("Status updated");
    load();
  };

  return (
    <Card className="admin-card">
      <Typography.Title level={4}>Orders</Typography.Title>
      <Table
        rowKey="_id"
        dataSource={orders}
        columns={[
          {
            title: "Order",
            dataIndex: "_id",
            render: (id: string) => `#${id.slice(-6).toUpperCase()}`,
          },
          {
            title: "Customer",
            dataIndex: ["user", "name"],
            render: (x: string) => x || "Guest",
          },
          {
            title: "Amount",
            dataIndex: "total",
            render: (t: number) => `₹${t}`,
          },
          {
            title: "Status",
            dataIndex: "status",
            render: (s: string, r: any) => (
              <Select
                value={s}
                style={{ width: 140 }}
                onChange={(val) => updateStatus(r._id, val)}
                options={STATUSES.map((x) => ({ value: x, label: x }))}
              />
            ),
          },
          {
            title: "Date",
            dataIndex: "createdAt",
            render: (d: string) => new Date(d).toLocaleDateString(),
          },
        ]}
      />
    </Card>
  );
}