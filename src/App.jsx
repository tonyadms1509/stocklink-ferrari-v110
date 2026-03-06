import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";

function NavBar() {
  return (
    <nav style={{ backgroundColor: "#203a43", padding: "10px", textAlign: "center" }}>
      <Link to="/" style={{ margin: "0 15px", color: "white", textDecoration: "none" }}>Home</Link>
      <Link to="/login" style={{ margin: "0 15px", color: "white", textDecoration: "none" }}>Login</Link>
      <Link to="/about" style={{ margin: "0 15px", color: "white", textDecoration: "none" }}>About</Link>
    </nav>
  );
}

function Home() {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>🚀 StockLink Ferrari</h1>
      <p>Seamless, Secure, Credible — Trust First</p>
      <Link to="/login"><button>Login</button></Link>
      <Link to="/about"><button>Learn More</button></Link>
    </div>
  );
}

function Login() {
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    const role = e.target.role.value;
    if (role === "contractor") navigate("/contractor");
    if (role === "supplier") navigate("/supplier");
    if (role === "logistics") navigate("/logistics");
    if (role === "admin") navigate("/admin");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Login to StockLink Ferrari</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="username" placeholder="Username" />
        <input type="password" name="password" placeholder="Password" />
        <select name="role">
          <option value="contractor">Contractor</option>
          <option value="supplier">Supplier</option>
          <option value="logistics">Logistics</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

function About() {
  return <h2 style={{ textAlign: "center", marginTop: "50px" }}>About StockLink Ferrari</h2>;
}

function Contractor() { return <h2 style={{ textAlign: "center", marginTop: "50px" }}>Contractor Dashboard</h2>; }
function Supplier() { return <h2 style={{ textAlign: "center", marginTop: "50px" }}>Supplier Dashboard</h2>; }
function Logistics() { return <h2 style={{ textAlign: "center", marginTop: "50px" }}>Logistics Dashboard</h2>; }
function Admin() { return <h2 style={{ textAlign: "center", marginTop: "50px" }}>Admin Dashboard</h2>; }

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/contractor" element={<Contractor />} />
        <Route path="/supplier" element={<Supplier />} />
        <Route path="/logistics" element={<Logistics />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;
