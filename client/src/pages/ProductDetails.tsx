
import {
  Button,
  Col,
  InputNumber,
  Row,
  Space,
  Tag,
  Typography,
} from 'antd';

import {
  ShoppingOutlined,
  HeartOutlined,
} from '@ant-design/icons';

import { useParams } from 'react-router-dom';

export default function ProductDetails() {
  const { id } = useParams();

  return (
    <div className="page">
      <Row gutter={[48, 48]}>
        {/* Product Image */}
        <Col xs={24} md={12}>
          <img
            src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=85"
            alt="AERO STREET RUNNER"
            style={{
              width: '100%',
              borderRadius: 24,
            }}
          />
        </Col>

        {/* Product Information */}
        <Col xs={24} md={12}>
          <Tag>SHOES</Tag>

          <Typography.Title>
            AERO STREET RUNNER
          </Typography.Title>

          <Typography.Title level={2}>
            ₹2,499
          </Typography.Title>

          <Typography.Paragraph className="muted">
            A clean everyday silhouette designed for comfort,
            movement and effortless style.
          </Typography.Paragraph>

          {/* Size */}
          <Typography.Title level={5}>
            Size
          </Typography.Title>

          <Space wrap>
            {['6', '7', '8', '9', '10'].map((size) => (
              <Button key={size}>
                {size}
              </Button>
            ))}
          </Space>

          {/* Quantity */}
          <Typography.Title level={5}>
            Quantity
          </Typography.Title>

          <InputNumber
            min={1}
            defaultValue={1}
          />

          {/* Actions */}
          <div style={{ marginTop: 28 }}>
            <Space>
              <Button
                type="primary"
                size="large"
                icon={<ShoppingOutlined />}
              >
                Add to cart
              </Button>

              <Button
                size="large"
                icon={<HeartOutlined />}
              />
            </Space>
          </div>

          {/* Specifications */}
          <div style={{ marginTop: 40 }}>
            <Typography.Title level={4}>
              Specifications
            </Typography.Title>

            <p>
              Lightweight construction · Everyday cushioning ·
              Unisex · Multiple sizes
            </p>
          </div>
        </Col>
      </Row>
    </div>
  );
}

