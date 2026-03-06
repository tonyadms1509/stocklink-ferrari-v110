export default function Admin() {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Admin Dashboard</h2>
      <table border="1" style={{ margin: "20px auto" }}>
        <thead>
          <tr><th>User</th><th>Role</th><th>Status</th></tr>
        </thead>
        <tbody>
          <tr><td>Alice</td><td>Contractor</td><td>Active</td></tr>
          <tr><td>Bob</td><td>Supplier</td><td>Pending</td></tr>
        </tbody>
      </table>
    </div>
  );
}
