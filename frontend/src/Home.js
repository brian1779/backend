import React from "react";

function Home() {
  return (
    <div style={styles.container}>
      <h1>Welcome to the File Processor App</h1>
      <p>Upload a CSV or XLSX file, and we'll process it for you!</p>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    padding: "50px",
    background: "white",
    borderRadius: "10px",
    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
  },
};

export default Home;