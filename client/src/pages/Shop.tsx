import { Row, Col, Select, Typography, Input, Empty } from "antd";
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
export default function Shop() {
  return (
    <div className="page">
      <Typography.Title>Shop</Typography.Title>
      <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
        <Input placeholder="Search products" style={{ maxWidth: 400 }} />
        <Select
          defaultValue="all"
          options={[
            { value: "all", label: "All categories" },
            { value: "Shoes", label: "Shoes" },
            { value: "Gym & Supplements", label: "Gym & Supplements" },
          ]}
          style={{ width: 220 }}
        />
        <Select
          defaultValue="featured"
          options={[
            { value: "featured", label: "Featured" },
            { value: "low", label: "Price: Low to High" },
            { value: "high", label: "Price: High to Low" },
          ]}
          style={{ width: 220 }}
        />
      </div>
      <Row gutter={[20, 20]}>
        {products.map((p) => (
          <Col xs={24} sm={12} md={8} lg={6} key={p._id}>
            <ProductCard p={p} />
          </Col>
        ))}
      </Row>
    </div>
  );
}
