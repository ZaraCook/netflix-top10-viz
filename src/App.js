import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import TitleExplorer from "./pages/TitleExplorer";
import Compare from "./pages/Compare";
import Insights from "./pages/Insights";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/title-explorer" element={<TitleExplorer />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/insights" element={<Insights />} />
      </Routes>
    </Router>
  );
}

export default App;