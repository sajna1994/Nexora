import { Row, Col, Select, Typography, Input, Empty, Spin } from "antd";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard, { type Product } from "../components/ProductCard";
import api from "../lib/api";

export default function Shop() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [sort, setSort] = useState("featured");

  useEffect(() => {
    api.get("/categories").then((res) =>
      setCategories([
        { value: "all", label: "All categories" },
        ...res.data.map((c: any) => ({ value: c._id, label: c.name })),
      ])
    );
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: any = {};
    if (search) params.search = search;
    if (category !== "all") params.category = category;

    api
      .get("/products", { params })
      .then((res) => {
        let data = res.data.map((p: any) => ({
          _id: p._id,
          name: p.name,
          price: p.price,
          discountPrice: p.discountPrice,
          category: p.category?.name || "Uncategorized",
          image: p.images?.[0] || "https://via.placeholder.com/400",
        }));

        if (sort === "low")
          data.sort(
            (a: Product, b: Product) =>
              (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price)
          );
        if (sort === "high")
          data.sort(
            (a: Product, b: Product) =>
              (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price)
          );

        setProducts(data);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [search, category, sort]);

  return (
    <div className="page">
      <Typography.Title>Shop</Typography.Title>
      <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
        <Input
          placeholder="Search products"
          style={{ maxWidth: 400 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          value={category}
          onChange={setCategory}
          options={categories}
          style={{ width: 220 }}
        />
        <Select
          value={sort}
          onChange={setSort}
          options={[
            { value: "featured", label: "Featured" },
            { value: "low", label: "Price: Low to High" },
            { value: "high", label: "Price: High to Low" },
          ]}
          style={{ width: 220 }}
        />
      </div>

      {loading ? (
        <Spin size="large" />
      ) : products.length === 0 ? (
        <Empty description="No products found" />
      ) : (
        <Row gutter={[20, 20]}>
          {products.map((p) => (
            <Col xs={24} sm={12} md={8} lg={6} key={p._id}>
              <ProductCard p={p} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}