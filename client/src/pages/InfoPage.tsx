import { Typography, Card, Divider } from "antd";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";

type Section = {
  title?: string;
  body: string | string[];
};

type InfoContent = {
  title: string;
  subtitle?: string;
  sections: Section[];
};

const CONTENT: Record<string, InfoContent> = {
  shipping: {
    title: "Shipping Information",
    subtitle: "How and when your order reaches you.",
    sections: [
      {
        body: [
          "Orders are processed within 24 hours (Mon–Sat). Once shipped, you'll receive a tracking link on your registered email and on the Orders page.",
          "Standard delivery takes 3–5 business days across India. Metro cities usually receive orders in 2–3 days.",
          "Free shipping on all orders above ₹999. Orders below this threshold carry a flat ₹79 shipping fee.",
          "We currently ship only within India. International shipping is coming soon.",
        ],
      },
    ],
  },
  returns: {
    title: "Returns & Refunds",
    subtitle: "Easy returns, no questions asked.",
    sections: [
      {
        body: [
          "You can return any unused product within 7 days of delivery for a full refund.",
          "Products must be in original packaging with tags intact. Damaged or used items are not eligible.",
          "Refunds are processed within 5–7 business days after we receive the returned item.",
          "To initiate a return, go to your Orders page and click 'Request Return'. Our team will arrange pickup.",
        ],
      },
    ],
  },
  "size-guide": {
    title: "Size Guide",
    subtitle: "Find your perfect fit.",
    sections: [
      {
        title: "Footwear",
        body: [
          "Measure your foot from heel to toe in centimeters. Compare with the sizes below:",
          "EU 40 / UK 6 / US 7 → 25 cm",
          "EU 41 / UK 7 / US 8 → 26 cm",
          "EU 42 / UK 8 / US 9 → 27 cm",
          "EU 43 / UK 9 / US 10 → 28 cm",
        ],
      },
      {
        title: "Apparel",
        body: [
          "Sizes are measured across the chest, one inch below the armpits. All measurements in inches.",
          "S — 36 | M — 38 | L — 40 | XL — 42 | XXL — 44",
        ],
      },
    ],
  },
  contact: {
    title: "Contact Us",
    subtitle: "We'd love to hear from you.",
    sections: [
      {
        body: [
          "Customer Support: support@nexora.com",
          "Business Enquiries: hello@nexora.com",
          "Phone: +91 97474 14972 (Mon–Sat, 10 AM – 7 PM IST)",
          "Registered Office: NEXORA Retail Pvt. Ltd., Malappuram, Kerala, India",
        ],
      },
    ],
  },
  about: {
    title: "About NEXORA",
    subtitle: "Shop more. Live better.",
    sections: [
      {
        body: [
          "NEXORA was born out of a simple idea — that shopping for the things you love should feel effortless, premium, and honest.",
          "We curate a tight selection of footwear, performance nutrition, and lifestyle essentials that we actually use ourselves. No filler, no noise.",
          "Every product on NEXORA is vetted for quality, fair pricing, and real-world performance. If we wouldn't buy it, we won't sell it.",
          "Built in India, designed for the world.",
        ],
      },
    ],
  },
  careers: {
    title: "Careers",
    subtitle: "Build the future of commerce with us.",
    sections: [
      {
        body: [
          "We're a small, focused team who care deeply about craft, design, and customer experience.",
          "Currently hiring: Frontend Engineer, Product Designer, Growth Marketer.",
          "Send your resume and portfolio to careers@nexora.com — we reply to every application.",
        ],
      },
    ],
  },
  press: {
    title: "Press & Media",
    subtitle: "Everything you need to tell our story.",
    sections: [
      {
        body: [
          "For press enquiries, brand assets, and interviews, email press@nexora.com.",
          "Our logo pack, brand guidelines, and founder bios are available on request.",
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    subtitle: "Last updated: January 2026",
    sections: [
      {
        title: "Information we collect",
        body: [
          "When you create an account or place an order, we collect your name, email, phone, and shipping address.",
          "We use cookies to remember your cart, wishlist, and session.",
        ],
      },
      {
        title: "How we use it",
        body: [
          "To process orders, provide customer support, and improve your shopping experience.",
          "We never sell your data to third parties.",
        ],
      },
      {
        title: "Your rights",
        body: [
          "You may request deletion of your account and data at any time by emailing privacy@nexora.com.",
        ],
      },
    ],
  },
  terms: {
    title: "Terms of Service",
    subtitle: "Last updated: January 2026",
    sections: [
      {
        title: "1. Acceptance",
        body: [
          "By accessing NEXORA, you agree to these terms. If you don't agree, please don't use the platform.",
        ],
      },
      {
        title: "2. Accounts",
        body: [
          "You are responsible for keeping your login credentials secure. Notify us immediately of any unauthorized use.",
        ],
      },
      {
        title: "3. Orders & Payment",
        body: [
          "All prices are in INR and include applicable taxes. We reserve the right to cancel orders in case of stock errors or fraud.",
        ],
      },
      {
        title: "4. Returns",
        body: [
          "Returns are governed by our Returns & Refunds policy.",
        ],
      },
    ],
  },
  cookies: {
    title: "Cookie Policy",
    subtitle: "How we use cookies on NEXORA.",
    sections: [
      {
        body: [
          "We use essential cookies to keep you logged in and to remember your cart and wishlist.",
          "We use analytics cookies to understand which pages are popular so we can improve them.",
          "You can disable non-essential cookies from your browser settings. Some features may not work without them.",
        ],
      },
    ],
  },
  sitemap: {
    title: "Sitemap",
    subtitle: "Everything on NEXORA, in one place.",
    sections: [
      {
        title: "Shop",
        body: ["Shoes", "Gym & Supplements", "Fashion", "Cosmetics", "All Products"],
      },
      {
        title: "Account",
        body: ["Profile", "Orders", "Wishlist", "Cart"],
      },
      {
        title: "Information",
        body: [
          "About NEXORA",
          "Shipping Information",
          "Returns & Refunds",
          "Size Guide",
          "Contact Us",
          "Privacy Policy",
          "Terms of Service",
        ],
      },
    ],
  },
};

export default function InfoPage() {
  const { slug } = useParams<{ slug: string }>();
  const nav = useNavigate();
  const content = slug ? CONTENT[slug] : null;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  if (!content) {
    return (
      <div className="page" style={{ maxWidth: 900 }}>
        <Typography.Title level={2}>Page not found</Typography.Title>
        <p>
          The page you were looking for doesn't exist.{" "}
          <Link to="/">Go home</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className="page" style={{ maxWidth: 900 }}>
      <Typography.Title level={1} style={{ marginBottom: 8 }}>
        {content.title}
      </Typography.Title>
      {content.subtitle && (
        <Typography.Paragraph className="muted" style={{ fontSize: 16 }}>
          {content.subtitle}
        </Typography.Paragraph>
      )}
      <Divider />

      <Card bordered={false} className="admin-card">
        {content.sections.map((section, i) => (
          <div key={i} style={{ marginBottom: 32 }}>
            {section.title && (
              <Typography.Title level={4} style={{ marginTop: 0 }}>
                {section.title}
              </Typography.Title>
            )}
            {Array.isArray(section.body) ? (
              section.body.map((p, j) => (
                <Typography.Paragraph
                  key={j}
                  style={{ fontSize: 15, lineHeight: 1.75, color: "#333" }}
                >
                  {p}
                </Typography.Paragraph>
              ))
            ) : (
              <Typography.Paragraph>{section.body}</Typography.Paragraph>
            )}
          </div>
        ))}
      </Card>

      <div style={{ marginTop: 24 }}>
        <Typography.Text type="secondary">
          Need help?{" "}
          <a onClick={() => nav("/info/contact")} style={{ color: "#b8892d" }}>
            Contact our team
          </a>
          .
        </Typography.Text>
      </div>
    </div>
  );
}