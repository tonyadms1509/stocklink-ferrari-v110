export default function Contractor() {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Contractor Dashboard</h2>
      <table border="1" style={{ margin: "20px auto" }}>
        <thead>
          <tr><th>Contract ID</th><th>Status</th><th>Deadline</th></tr>
        </thead>
        <tbody>
          <tr><td>001</td><td>Active</td><td>30 Mar 2026</td></tr>
          <tr><td>002</td><td>Pending</td><td>15 Apr 2026</td></tr>
        </tbody>
      </table>
    </div>
  );
}
