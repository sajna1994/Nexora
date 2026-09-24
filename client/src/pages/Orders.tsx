import { Card, Table, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/orders")
      .then((res) => {
        const filtered = user
          ? res.data.filter((o: any) => o.user?._id === user.id)
          : res.data;
        setOrders(filtered);
      })
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="page">
      <Typography.Title>My Orders</Typography.Title>
      <Card bordered={false}>
        <Table
          loading={loading}
          pagination={false}
          rowKey="_id"
          dataSource={orders}
          columns={[
            {
              title: "Order",
              dataIndex: "_id",
              render: (id: string) => `#${id.slice(-6).toUpperCase()}`,
            },
            {
              title: "Date",
              dataIndex: "createdAt",
              render: (d: string) => new Date(d).toLocaleDateString(),
            },
            { title: "Total", dataIndex: "total", render: (t: number) => `₹${t}` },
            {
              title: "Status",
              dataIndex: "status",
              render: (x: string) => <Tag color="gold">{x}</Tag>,
            },
          ]}
        />
      </Card>
    </div>
  );
}