function Dashboard({
  loginSection,
  uploadSection,
  summarySection,
  chatSection,
  pdfSidebar,
  chatSidebar,
}) {
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
      }}
    >
      {/* PDF Sidebar */}
      <div
        style={{
          width: "260px",
          borderRight: "1px solid #ddd",
          padding: "15px",
          overflowY: "auto",
        }}
      >
        {pdfSidebar}
      </div>

      {/* Chat Sidebar */}
      <div
        style={{
          width: "260px",
          borderRight: "1px solid #ddd",
          padding: "15px",
          overflowY: "auto",
        }}
      >
        {chatSidebar}
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          padding: "20px",
          overflowY: "auto",
        }}
      >
        {loginSection}
        {uploadSection}
        {summarySection}
        {chatSection}
      </div>
    </div>
  );
}

export default Dashboard;