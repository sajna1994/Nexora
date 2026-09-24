import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";

export default function Forbidden() {
  const nav = useNavigate();
  return (
    <div className="page">
      <Result
        status="403"
        title="403"
        subTitle="You don't have permission to access this page."
        extra={
          <Button type="primary" onClick={() => nav("/")}>
            Back Home
          </Button>
        }
      />
    </div>
  );
}