import {
  Button,
  Card,
  Col,
  Empty,
  Row,
  Typography,
  message,
} from "antd";
import { DeleteOutlined, ShoppingOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";

export default function Wishlist() {
  const nav = useNavigate();
  const { items, remove, clear } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (item: any) => {
    // Your ProductCard stores `images` array; ProductDetails uses same
    addToCart(
      {
        _id: item._id,
        name: item.name,
        price: item.price,
        discountPrice: item.discountPrice,
        images: item.images,
        category: item.category,
      },
      1
    );
    message.success("Added to cart");
  };

  if (items.length === 0) {
    return (
      <div className="page">
        <Typography.Title>Wishlist</Typography.Title>
        <Empty description="Your wishlist is waiting for something special.">
          <Button type="primary" onClick={() => nav("/shop")}>
            Browse products
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div className="page">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "end",
          marginBottom: 24,
        }}
      >
        <Typography.Title style={{ margin: 0 }}>
          Wishlist ({items.length})
        </Typography.Title>
        <Button danger type="text" onClick={clear}>
          Clear all
        </Button>
      </div>

      <Row gutter={[20, 20]}>
        {items.map((item) => {
          const img = item.images?.[0] || "https://via.placeholder.com/400";
          const catName =
            typeof item.category === "string"
              ? item.category
              : item.category?.name || "";

          return (
            <Col xs={24} sm={12} md={8} lg={6} key={item._id}>
              <Card
                className="product-card"
                hoverable
                cover={
                  <img
                    className="product-image"
                    src={img}
                    alt={item.name}
                    onClick={() => nav("/product/" + item._id)}
                    style={{ cursor: "pointer" }}
                  />
                }
              >
                {catName && (
                  <Typography.Text className="muted" style={{ fontSize: 12 }}>
                    {catName}
                  </Typography.Text>
                )}
                <Typography.Title
                  level={5}
                  style={{ margin: "8px 0" }}
                  onClick={() => nav("/product/" + item._id)}
                >
                  {item.name}
                </Typography.Title>
                <div style={{ marginBottom: 12 }}>
                  <b>₹{item.discountPrice ?? item.price}</b>
                  {item.discountPrice && (
                    <span
                      className="muted"
                      style={{
                        textDecoration: "line-through",
                        marginLeft: 10,
                      }}
                    >
                      ₹{item.price}
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <Button
                    type="primary"
                    icon={<ShoppingOutlined />}
                    onClick={() => handleAddToCart(item)}
                    style={{ flex: 1 }}
                  >
                    Add to cart
                  </Button>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      remove(item._id);
                      message.success("Removed from wishlist");
                    }}
                  />
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
}