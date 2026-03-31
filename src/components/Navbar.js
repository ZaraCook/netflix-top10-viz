import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav style={{ padding: "16px", background: "#111", display: "flex", gap: "20px" }}>
      <Link to="/" style={{ color: "white", textDecoration: "none" }}>Overview</Link>
      <Link to="/title-explorer" style={{ color: "white", textDecoration: "none" }}>Title Explorer</Link>
      <Link to="/compare" style={{ color: "white", textDecoration: "none" }}>Compare</Link>
      <Link to="/insights" style={{ color: "white", textDecoration: "none" }}>Insights</Link>
    </nav>
  );
}

export default Navbar;