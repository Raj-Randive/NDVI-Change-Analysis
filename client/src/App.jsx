import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import About from "./components/About/About";
import Contact from "./components/Contact/Contact";
import Home from "./components/Home/Home";
import Navbar from "./components/Navbar/Navbar";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </Router>
  );
};

export default App;
