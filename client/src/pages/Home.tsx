import { Button, Col, Row } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import ProductCard, { type Product } from "../components/ProductCard";
const products: Product[] = [
  {
    _id: "shoe-1",
    name: "Aero Street Runner",
    price: 2999,
    discountPrice: 2499,
    category: "Shoes",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
  },
  {
    _id: "protein-1",
    name: "Whey Protein 1 KG",
    price: 3999,
    discountPrice: 3499,
    category: "Gym & Supplements",
    image:
      "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=900&q=80",
  },
  {
    _id: "shoe-2",
    name: "Minimal Court White",
    price: 2799,
    category: "Shoes",
    image:
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=80",
  },
  {
    _id: "creatine-1",
    name: "Creatine Monohydrate",
    price: 1999,
    category: "Gym & Supplements",
    image:
      "https://images.unsplash.com/photo-1579722821273-0f6c5e3a5e1c?auto=format&fit=crop&w=900&q=80",
  },
];
export default function Home() {
  const nav = useNavigate();
  return (
    <div className="page">
      <section className="hero">
        <div>
          <div className="gold" style={{ letterSpacing: 4 }}>
            NEXORA / NEW COLLECTION
          </div>
          <h1>
            Everything you
            <br />
            <span className="gold">want.</span>
          </h1>
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
          {["Shoes", "Gym & Supplements", "Fashion", "Cosmetics"].map((x) => (
            <Col xs={24} sm={12} md={6} key={x}>
              <div className="category-tile">
                <h3 style={{ margin: 0, color: "#fff" }}>{x}</h3>
              </div>
            </Col>
          ))}
        </Row>
      </section>
      <section style={{ marginTop: 64 }}>
        <div className="section-title">
          <div>
            <h2>Featured picks</h2>
            <p className="muted">
              Selected products to start your NEXORA journey.
            </p>
          </div>
        </div>
        <Row gutter={[20, 20]}>
          {products.map((p) => (
            <Col xs={24} sm={12} lg={6} key={p._id}>
              <ProductCard p={p} />
            </Col>
          ))}
        </Row>
      </section>
    </div>
  );
}
