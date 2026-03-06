export default function Logistics() {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Logistics Dashboard</h2>
      <table border="1" style={{ margin: "20px auto" }}>
        <thead>
          <tr><th>Route</th><th>Status</th><th>ETA</th></tr>
        </thead>
        <tbody>
          <tr><td>Pretoria → Cape Town</td><td>In Transit</td><td>12 hrs</td></tr>
          <tr><td>Johannesburg → Durban</td><td>Delayed</td><td>6 hrs</td></tr>
        </tbody>
      </table>
    </div>
  );
}
