import { Button, Col, Row, Spin } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductCard, { type Product } from "../components/ProductCard";
import api from "../lib/api";

export default function Home() {
  const nav = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/products")
      .then((res) => {
        const mapped = res.data.map((p: any) => ({
          _id: p._id,
          name: p.name,
          price: p.price,
          discountPrice: p.discountPrice,
          category: p.category?.name || "Uncategorized",
          image: p.images?.[0] || "https://via.placeholder.com/400",
        }));
        setProducts(mapped.slice(0, 4));
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));

    api.get("/categories").then((res) => setCategories(res.data.slice(0, 4)));
  }, []);

  return (
    <div className="page">
     <section className="hero">
  <div>
    <img
      src="/logo.png"
      alt="NEXORA"
      style={{
        height: 100,
        width: 'auto',
        objectFit: 'contain',
        marginBottom: 24,
      }}
    />
    <div className="gold" style={{ letterSpacing: 4 }}>
      NEXORA / NEW COLLECTION
    </div>
    <h1>
      Everything you
      <br />
      <span className="gold">want.</span>
    </h1>
    ...
          <p>
            A refined shopping experience for everyday essentials, fitness,
            fashion and everything coming next.
          </p>
          <Button
            type="primary"
            size="large"
            icon={<ArrowRightOutlined />}
            onClick={() => nav("/shop")}
          >
            Explore Collection
          </Button>
        </div>
      </section>

      <section style={{ marginTop: 64 }}>
        <div className="section-title">
          <h2>Shop by category</h2>
          <Button type="link" onClick={() => nav("/shop")}>
            View all
          </Button>
        </div>
        <Row gutter={[16, 16]}>
          {categories.map((c) => (
            <Col xs={24} sm={12} md={6} key={c._id}>
              <div
                className="category-tile"
                onClick={() => nav("/shop?category=" + c._id)}
                style={{
                  backgroundImage: c.image
                    ? `linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.75)), url(${c.image})`
                    : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <h3 style={{ margin: 0, color: "#fff" }}>{c.name}</h3>
              </div>
            </Col>
          ))}
        </Row>
      </section>

      {/* Featured picks — unchanged */}
      <section style={{ marginTop: 64 }}>
        <div className="section-title">
          <div>
            <h2>Featured picks</h2>
            <p className="muted">
              Selected products to start your NEXORA journey.
            </p>
          </div>
        </div>
        {loading ? (
          <Spin size="large" />
        ) : (
          <Row gutter={[20, 20]}>
            {products.map((p) => (
              <Col xs={24} sm={12} lg={6} key={p._id}>
                <ProductCard p={p} />
              </Col>
            ))}
          </Row>
        )}
      </section>
    </div>
  );
}