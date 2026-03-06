export default function Supplier() {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Supplier Dashboard</h2>
      <table border="1" style={{ margin: "20px auto" }}>
        <thead>
          <tr><th>Item</th><th>Stock</th><th>Reorder Level</th></tr>
        </thead>
        <tbody>
          <tr><td>Cement</td><td>120 bags</td><td>50</td></tr>
          <tr><td>Steel Rods</td><td>300 units</td><td>100</td></tr>
        </tbody>
      </table>
    </div>
  );
}
