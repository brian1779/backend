import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./Home";
import FileUpload from "./FileUpload";

function App() {
  return (
    <Router>
      <div style={styles.appContainer}>
        {/* Sidebar */}
        <nav style={styles.sidebar}>
          <h2>File Processor</h2>
          <ul>
            <li><Link to="/">🏠 Home</Link></li>
            <li><Link to="/upload">📂 Upload File</Link></li>
          </ul>
        </nav>

        {/* Main Content */}
        <div style={styles.mainContent}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<FileUpload />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

const styles = {
  appContainer: {
    display: "flex",
    height: "100vh",
  },
  sidebar: {
    width: "250px",
    background: "#2c3e50",
    color: "white",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
  },
  mainContent: {
    flexGrow: 1,
    padding: "20px",
    background: "#ecf0f1",
  },
};

export default App;