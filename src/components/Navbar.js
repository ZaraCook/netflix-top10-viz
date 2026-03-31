import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="top-nav">
      <Link to="/" className="nav-link">Overview</Link>
      <Link to="/title-explorer" className="nav-link">Title Explorer</Link>
      <Link to="/compare" className="nav-link">Compare</Link>
      <Link to="/insights" className="nav-link">Insights Lab</Link>
    </nav>
  );
}

export default Navbar;