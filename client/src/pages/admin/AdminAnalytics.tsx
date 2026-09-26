import {
  Card,
  Col,
  Row,
  Statistic,
  Typography,
  Segmented,
  DatePicker,
  Space,
  Table,
  Tag,
  Spin,
  Empty,
  Progress,
} from "antd";
import {
  DollarOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  RiseOutlined,
  PercentageOutlined,
  TeamOutlined,
  MailOutlined,
} from "@ant-design/icons";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useEffect, useMemo, useState } from "react";
import api from "../../lib/api";

const { RangePicker } = DatePicker;

const GOLD = "#c9a45c";
const COLORS = [
  "#c9a45c",
  "#8b6f2e",
  "#e0c988",
  "#3f3a2c",
  "#a8894e",
  "#6b5a34",
  "#d4b876",
  "#96825a",
];

type Overview = {
  revenue: number;
  gross: number;
  discounts: number;
  orders: number;
  items: number;
  aov: number;
  customers: number;
  products: number;
  subscribers: number;
};

type Point = {
  date: string;
  label: string;
  revenue: number;
  orders: number;
};

type TopProduct = {
  _id: string;
  name: string;
  units: number;
  revenue: number;
  image?: string;
};

type CategoryRow = {
  _id: string;
  name: string;
  revenue: number;
  units: number;
};

type StatusRow = {
  status: string;
  count: number;
  revenue: number;
};

type Period = "7d" | "30d" | "month" | "year" | "custom";

function getRangeForPeriod(period: Period): { from?: string; to?: string } {
  const now = new Date();
  const to = now.toISOString();

  switch (period) {
    case "7d": {
      const d = new Date();
      d.setDate(now.getDate() - 6);
      d.setHours(0, 0, 0, 0);
      return { from: d.toISOString(), to };
    }
    case "30d": {
      const d = new Date();
      d.setDate(now.getDate() - 29);
      d.setHours(0, 0, 0, 0);
      return { from: d.toISOString(), to };
    }
    case "month": {
      const d = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: d.toISOString(), to };
    }
    case "year": {
      const d = new Date(now.getFullYear(), 0, 1);
      return { from: d.toISOString(), to };
    }
    default:
      return {};
  }
}

const INR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export default function AdminAnalytics() {
  const [period, setPeriod] = useState<Period>("30d");
  const [custom, setCustom] = useState<[any, any] | null>(null);

  const [overview, setOverview] = useState<Overview | null>(null);
  const [timeline, setTimeline] = useState<Point[]>([]);
  const [monthly, setMonthly] = useState<Point[]>([]);
  const [yearly, setYearly] = useState<Point[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [statuses, setStatuses] = useState<StatusRow[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* Compute the params for the current period */
  const rangeParams = useMemo(() => {
    if (period === "custom" && custom && custom[0] && custom[1]) {
      return {
        from: custom[0].startOf("day").toISOString(),
        to: custom[1].endOf("day").toISOString(),
      };
    }
    return getRangeForPeriod(period);
  }, [period, custom]);

  useEffect(() => {
    setLoading(true);

    const params = new URLSearchParams(
      Object.entries(rangeParams).filter(([, v]) => v) as [string, string][]
    ).toString();

    Promise.all([
      api.get(`/analytics/overview?${params}`),
      api.get(`/analytics/timeline?${params}`),
      api.get(`/analytics/monthly`),
      api.get(`/analytics/yearly`),
      api.get(`/analytics/top-products?${params}`),
      api.get(`/analytics/categories?${params}`),
      api.get(`/analytics/statuses?${params}`),
      api.get(`/analytics/recent-orders?limit=8`),
    ])
      .then(
        ([
          ov,
          tl,
          mo,
          ye,
          tp,
          cat,
          st,
          recent,
        ]) => {
          setOverview(ov.data);
          setTimeline(tl.data);
          setMonthly(mo.data);
          setYearly(ye.data);
          setTopProducts(tp.data);
          setCategories(cat.data);
          setStatuses(st.data);
          setRecentOrders(recent.data);
        }
      )
      .finally(() => setLoading(false));
  }, [rangeParams]);

  if (loading && !overview) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  const maxCategoryRevenue = Math.max(...categories.map((c) => c.revenue), 1);

  return (
    <>
      {/* ── Range selector ─────────────────────────── */}
     <Card
  className="admin-card"
  style={{ marginBottom: 16 }}
  styles={{ body: { padding: "12px 16px" } }}
>
  <Row justify="space-between" align="middle" gutter={[12, 12]}>
    <Col xs={24} md="auto">
      <div style={{ overflowX: "auto" }}>
        <Segmented
          value={period}
          onChange={(v) => setPeriod(v as Period)}
          options={[
            { label: "7d", value: "7d" },
            { label: "30d", value: "30d" },
            { label: "Month", value: "month" },
            { label: "Year", value: "year" },
            { label: "Custom", value: "custom" },
          ]}
        />
      </div>
    </Col>
    {period === "custom" && (
      <Col xs={24} md="auto">
        <RangePicker
          value={custom as any}
          onChange={(v) => setCustom(v as any)}
        />
      </Col>
    )}
  </Row>
</Card>

      {/* ── KPI cards ──────────────────────────────── */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="admin-card">
            <Statistic
              title="Revenue"
              value={overview?.revenue || 0}
              precision={0}
              prefix="₹"
              valueStyle={{ color: "#b8892d", fontWeight: 700 }}
            />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Gross: {INR(overview?.gross || 0)} · Discounts:{" "}
              {INR(overview?.discounts || 0)}
            </Typography.Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="admin-card">
            <Statistic
              title="Orders"
              value={overview?.orders || 0}
              prefix={<ShoppingCartOutlined />}
            />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {overview?.items || 0} items sold
            </Typography.Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="admin-card">
            <Statistic
              title="Avg. Order Value"
              value={overview?.aov || 0}
              prefix="₹"
              valueStyle={{ color: "#8b6f2e" }}
            />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Per order in range
            </Typography.Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="admin-card">
            <Statistic
              title="Customers"
              value={overview?.customers || 0}
              prefix={<TeamOutlined />}
            />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {overview?.subscribers || 0} newsletter subscribers
            </Typography.Text>
          </Card>
        </Col>
      </Row>

      {/* ── Revenue trend line ─────────────────────── */}
      <Card
        className="admin-card"
        style={{ marginTop: 16 }}
        title="Revenue trend"
      >
        {timeline.length === 0 ? (
          <Empty description="No orders in this range" />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeline} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(v) => `₹${v / 1000}k`}
              />
              <Tooltip
                formatter={(v: any, name: any) =>
                  name === "revenue" ? INR(Number(v)) : v
                }
                labelStyle={{ fontWeight: 600 }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke={GOLD}
                strokeWidth={3}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* ── Monthly + Yearly side by side ──────────── */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={14}>
          <Card className="admin-card" title="Last 12 months">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => `₹${v / 1000}k`}
                />
                <Tooltip formatter={(v: any) => INR(Number(v))} />
                <Bar dataKey="revenue" fill={GOLD} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card className="admin-card" title="Yearly">
            {yearly.length === 0 ? (
              <Empty description="No data yet" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={yearly} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <YAxis dataKey="label" type="category" tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: any) => INR(Number(v))} />
                  <Bar dataKey="revenue" fill="#8b6f2e" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
      </Row>

      {/* ── Category pie + Status breakdown ─────────── */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card className="admin-card" title="Revenue by category">
            {categories.length === 0 ? (
              <Empty description="No data" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categories}
                    dataKey="revenue"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }: any) =>
                      `${name} ${((percent || 0) * 100).toFixed(0)}%`
                    }
                  >
                    {categories.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => INR(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card className="admin-card" title="Order status">
            {statuses.length === 0 ? (
              <Empty description="No data" />
            ) : (
              <Table
                pagination={false}
                rowKey="status"
                dataSource={statuses}
                columns={[
                  {
                    title: "Status",
                    dataIndex: "status",
                    render: (s: string) => <Tag color="gold">{s}</Tag>,
                  },
                  { title: "Orders", dataIndex: "count" },
                  {
                    title: "Revenue",
                    dataIndex: "revenue",
                    render: (r: number) => INR(r),
                  },
                ]}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* ── Top products ──────────────────────────── */}
      <Card
        className="admin-card"
        style={{ marginTop: 16 }}
        title="Top 10 products by revenue"
      >
        {topProducts.length === 0 ? (
          <Empty description="No data" />
        ) : (
          <Table
            pagination={false}
            rowKey="_id"
            dataSource={topProducts}
            columns={[
              {
                title: "",
                dataIndex: "image",
                width: 60,
                render: (img?: string) =>
                  img ? (
                    <img
                      src={img}
                      alt=""
                      style={{
                        width: 40,
                        height: 40,
                        objectFit: "cover",
                        borderRadius: 8,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        background: "#f1efea",
                        borderRadius: 8,
                      }}
                    />
                  ),
              },
              { title: "Product", dataIndex: "name" },
              { title: "Units", dataIndex: "units", width: 100 },
              {
                title: "Revenue",
                dataIndex: "revenue",
                width: 160,
                render: (r: number, row: TopProduct) => (
                  <div>
                    <b>{INR(r)}</b>
                    <Progress
                      percent={Math.round(
                        (r / (topProducts[0]?.revenue || 1)) * 100
                      )}
                      showInfo={false}
                      strokeColor={GOLD}
                      size="small"
                    />
                  </div>
                ),
              },
            ]}
          />
        )}
      </Card>

      {/* ── Recent orders ─────────────────────────── */}
      <Card
        className="admin-card"
        style={{ marginTop: 16 }}
        title="Recent orders"
      >
        <Table
          pagination={false}
          rowKey="_id"
          dataSource={recentOrders}
          columns={[
            {
              title: "Order",
              dataIndex: "_id",
              render: (id: string) => `#${id.slice(-6).toUpperCase()}`,
            },
            {
              title: "Customer",
              dataIndex: ["user", "name"],
              render: (v?: string) => v || "Guest",
            },
            {
              title: "Items",
              dataIndex: "items",
              render: (items: any[]) =>
                items?.reduce((s, i) => s + i.quantity, 0) || 0,
            },
            {
              title: "Discount",
              dataIndex: "discount",
              render: (d: number) => (d ? `-₹${d}` : "—"),
            },
            {
              title: "Total",
              dataIndex: "total",
              render: (t: number) => <b>{INR(t)}</b>,
            },
            {
              title: "Status",
              dataIndex: "status",
              render: (s: string) => <Tag color="gold">{s}</Tag>,
            },
            {
              title: "Date",
              dataIndex: "createdAt",
              render: (d: string) =>
                new Date(d).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }),
            },
          ]}
        />
      </Card>
    </>
  );
}