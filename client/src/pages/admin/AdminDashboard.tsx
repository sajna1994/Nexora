import { Card, Col, Row, Statistic, Table, Typography } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../lib/api";

export default function AdminDashboard() {
  const nav = useNavigate();
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    products: 0,
    customers: 0,
  });
  const [recent, setRecent] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState(0);

  useEffect(() => {
    Promise.all([
      api.get("/orders"),
      api.get("/products"),
      api.get("/newsletter"),
    ]).then(([oRes, pRes, nRes]) => {
      const orders = oRes.data;
      const revenue = orders.reduce(
        (s: number, o: any) => s + (o.total || 0),
        0
      );

      setStats({
        revenue,
        orders: orders.length,
        products: pRes.data.length,
        customers: new Set(
          orders.map((o: any) => o.user?._id).filter(Boolean)
        ).size,
      });

      setSubscribers(nRes.data.length);
      setRecent(orders.slice(0, 5));
    });
  }, []);

  return (
    <>
      {/* Primary metrics */}
      <Row gutter={[16, 16]}>
        {[
          ["Revenue", stats.revenue, "₹"],
          ["Orders", stats.orders, ""],
          ["Products", stats.products, ""],
          ["Customers", stats.customers, ""],
        ].map(([t, v, p]) => (
          <Col xs={24} sm={12} md={6} key={t as string}>
            <Card className="admin-card">
              <Statistic
                title={t as string}
                value={Number(v)}
                prefix={p as string}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Secondary metric */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12} lg={8}>
          <Card
            className="admin-card"
            hoverable
            onClick={() => nav("/admin/newsletter")}
            style={{ cursor: "pointer" }}
          >
            <Statistic
              title="Newsletter Subscribers"
              value={subscribers}
              prefix={<MailOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent orders */}
      <Card className="admin-card" style={{ marginTop: 20 }}>
        <Typography.Title level={4}>Recent orders</Typography.Title>
        <Table
          pagination={false}
          rowKey="_id"
          dataSource={recent}
          scroll={{ x: "max-content" }}
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
              title: "Total",
              dataIndex: "total",
              render: (t: number) => `₹${t}`,
            },
            { title: "Status", dataIndex: "status" },
          ]}
        />
      </Card>
    </>
  );
}