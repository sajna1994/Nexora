import { Card, Table, Typography } from "antd";
import { useEffect, useState } from "react";
import api from "../../lib/api";

export default function AdminCustomers() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/customers")
      .then((res) => setData(res.data))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card className="admin-card">
      <Typography.Title level={4}>Customers</Typography.Title>
      <Table
        rowKey="_id"
        loading={loading}
        dataSource={data}
        scroll={{ x: "max-content" }}
        columns={[
          { title: "Name", dataIndex: "name" },
          { title: "Email", dataIndex: "email" },
          { title: "Role", dataIndex: "role" },
          { title: "Orders", dataIndex: "orders" },
          {
            title: "Joined",
            dataIndex: "createdAt",
            render: (d: string) => new Date(d).toLocaleDateString(),
          },
        ]}
      />
    </Card>
  );
}