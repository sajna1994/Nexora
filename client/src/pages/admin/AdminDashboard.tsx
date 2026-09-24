import { Card, Col, Row, Statistic, Table, Typography } from "antd";
import { useEffect, useState } from "react";
import api from "../../lib/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ revenue: 0, orders: 0, products: 0, customers: 0 });
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([api.get("/orders"), api.get("/products")]).then(([oRes, pRes]) => {
      const orders = oRes.data;
      const revenue = orders.reduce((s: number, o: any) => s + (o.total || 0), 0);
      setStats({
        revenue,
        orders: orders.length,
        products: pRes.data.length,
        customers: new Set(orders.map((o: any) => o.user?._id).filter(Boolean)).size,
      });
      setRecent(orders.slice(0, 5));
    });
  }, []);

  return (
    <>
      <Row gutter={[16, 16]}>
        {[
          ["Revenue", stats.revenue, "₹"],
          ["Orders", stats.orders, ""],
          ["Products", stats.products, ""],
          ["Customers", stats.customers, ""],
        ].map(([t, v, p]) => (
          <Col xs={24} md={6} key={t as string}>
            <Card className="admin-card">
              <Statistic title={t as string} value={Number(v)} prefix={p as string} />
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="admin-card" style={{ marginTop: 20 }}>
        <Typography.Title level={4}>Recent orders</Typography.Title>
        <Table
          pagination={false}
          rowKey="_id"
          dataSource={recent}
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
            { title: "Total", dataIndex: "total", render: (t: number) => `₹${t}` },
            { title: "Status", dataIndex: "status" },
          ]}
        />
      </Card>
    </>
  );
}