import React from "react";

function Admin() {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <h1>Admin Panel</h1>
      <p>Configure system settings, user roles, and permissions here.</p>

      <ul style={{ listStyle: "none", padding: 0 }}>
        <li><strong>User Management</strong> – Add or remove users</li>
        <li><strong>Roles</strong> – Assign contractor/admin privileges</li>
        <li><strong>System Settings</strong> – Configure app preferences</li>
      </ul>
    </div>
  );
}

export default Admin;
