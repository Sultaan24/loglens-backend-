import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart, LineChart, Line,
  Area,
  Legend,
} from "recharts";


import {
  ComposableMap,
  Geographies,
  Geography,
  Marker
} from "react-simple-maps";

const geoUrl =
"https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

function App() {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("all");
  const [loading, setLoading] = useState(false);

  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [progress] = useState(0);
  const [statusText, setStatusText] = useState("");


useEffect(() => {
  const savedLogin = localStorage.getItem("loglens_login");
  if (savedLogin === "true") {
    setLoggedIn(true);
localStorage.setItem("loglens_login", "true");
  }
}, []);


const handleUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const form = new FormData();
  form.append("file", file);

  setLoading(true);
  setStatusText("Uploading...");

  try {
    const res = await axios.post(
      "https://loglens-api-57cj.onrender.com/upload",
      form
    );

    setData(res.data);
  } catch (error) {
    console.error(error);
    setStatusText("Upload Failed");
  }

  setLoading(false);
};





  const loadDemo = async () => {
    setLoading(true);
    const res = await axios.get("https://loglens-api-57cj.onrender.com/demo");
    setData(res.data);
    setLoading(false);
  };

  const logs = data?.logs || [];

const filteredLogs = logs.filter((log) => {
  const q = search.toLowerCase();

  const matchSearch =
    log.ip.toLowerCase().includes(q) ||
    log.attack.toLowerCase().includes(q) ||
    log.path.toLowerCase().includes(q);

  const matchSeverity =
    severity === "all" ? true : log.severity === severity;

  return matchSearch && matchSeverity;
});
  

  const countryMap = {};
  const typeMap = {};
  const timeMap = {};
  const attackerMap = {};

  filteredLogs.forEach((l) => {
    countryMap[l.country] = (countryMap[l.country] || 0) + 1;
    typeMap[l.attack] = (typeMap[l.attack] || 0) + 1;

    const hour = l.timestamp.split(":")[1] + ":00";
    timeMap[hour] = (timeMap[hour] || 0) + 1;

    if (l.attack !== "normal") {
      attackerMap[l.ip] = (attackerMap[l.ip] || 0) + 1;
    }
  });

  const countryData = Object.entries(countryMap).map(([country, count]) => ({
    country,
    count,
  }));

const lineData = data?.timeline || [];

  const typeData = Object.entries(typeMap).map(([name, value]) => ({
    name,
    value,
  }));


  const attackerData = Object.entries(attackerMap).map(([ip, count]) => ({
    ip,
    count,
  }));

  const pieColors = [
    "#06B6D4",
    "#8B5CF6",
    "#F43F5E",
    "#10B981",
    "#F59E0B",
    "#3B82F6",
  ];

const exportCSV = () => {
  const headers = [
    "IP",
    "Country",
    "Attack",
    "Severity",
    "Method",
    "Status",
    "Path",
  ];

  const rows = filteredLogs.map((l) => [
    l.ip,
    l.country,
    l.attack,
    l.severity,
    l.method,
    l.status,
    l.path,
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((x) => `"${x}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "loglens-report.csv";
  link.click();
};

const exportPDF = () => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("LogLens Security Report", 14, 20);

  doc.setFontSize(11);
  doc.text(`Total Logs: ${data?.total_logs || 0}`, 14, 32);
  doc.text(`Total Attacks: ${data?.total_attacks || 0}`, 14, 40);
  doc.text(`Lines Processed: ${data?.total_lines || 0}`, 14, 48);
  doc.text(`Skipped Lines: ${data?.skipped_lines || 0}`, 14, 56);
  doc.text(`Processing Time: ${data?.processing_time || 0}s`, 14, 64);

  autoTable(doc, {
    startY: 75,
    head: [["IP", "Country", "Attack", "Severity"]],
    body: filteredLogs.slice(0, 15).map((l) => [
      l.ip,
      l.country,
      l.attack,
      l.severity,
    ]),
  });

  doc.save("loglens-report.pdf");
};







if (!loggedIn) {
const handleLogin = async () => {
  try {
    const res = await axios.post("https://loglens-api-57cj.onrender.com/login", {
      username,
      password,
    });

    if (res.data.success) {
      setLoggedIn(true);
      localStorage.setItem("loglens_login", "true");
      setError("");
    }
  } catch (err) {
    setError("Invalid username or password");
  }
};






  return (
    <div style={styles.loginPage}>
      <div style={styles.loginBox}>
        <h1
  style={{
    fontSize: 44,
    marginBottom: 10,
    fontWeight: 900,
    letterSpacing: "1px",
    textShadow: "0 0 12px #06B6D4, 0 0 28px #06B6D4, 0 0 45px #8B5CF6",
  }}
>
  🛡 LogLens
</h1>
        <p style={{ color: "#94a3b8", marginBottom: 20 }}>
          Secure Threat Monitoring Login
        </p>

        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.loginInput}
        />

        <input
  type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.loginInput}
        />

<p
  onClick={() => setShowPassword(!showPassword)}
  style={{
    cursor: "pointer",
    color: "#06B6D4",
    marginBottom: "12px",
    fontSize: "14px",
    textAlign: "right"
  }}
>
  {showPassword ? "🙈 Hide Password" : "👁 Show Password"}
</p>



        {error && (
          <p style={{ color: "#f43f5e", fontSize: 14 }}>{error}</p>
        )}

        <button style={styles.loginBtn} onClick={handleLogin}>
          Login
        </button>
      </div>
    </div>
  );
}      
    return (
    <div style={styles.page}>
      <Glow />

<div style={styles.header}>
  <div>
    <h1 style={styles.title}>🛡 LogLens Dashboard</h1>
    <p style={styles.sub}>Security Monitoring & Threat Analytics</p>
  </div>

  <button
onClick={() => {
  setLoggedIn(false);
  localStorage.removeItem("loglens_login");
}}
    style={styles.exportBtn}
  >
    Logout
  </button>
</div>      





      {/* Controls */}
      <div style={styles.controls}>
        <input
          placeholder="🔍 Search IP / attack / path"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.input}
        />

        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          style={styles.input}
        >
          <option style={{color:"#000",background:"#fff"}} value="all">All Severity</option>
          <option style={{color:"#000",background:"#fff"}} value="high">High</option>
          <option style={{color:"#000",background:"#fff"}} value="medium">Medium</option>
          <option style={{color:"#000",background:"#fff"}} value="low">Low</option>
          <option style={{color:"#000",background:"#fff"}} value="none">None</option>
        </select>

        <button onClick={loadDemo} style={styles.demoBtn}>
          ⚡ Load Demo
        </button>

        <button onClick={exportCSV} style={styles.exportBtn}>
  


        📄 Export CSV
        </button>

<button onClick={exportPDF} style={styles.exportBtn}>
  📕 Export PDF
</button>







        <label style={styles.uploadBtn}>
          📂 Upload Log
          <input type="file" hidden onChange={handleUpload} />
        </label>
      </div>

      {loading && (
  <div style={{ marginBottom: 20 }}>
    <p style={{ color: "#06B6D4", marginBottom: 8 }}>
      {statusText} ({progress}%)
    </p>

    <div
      style={{
        width: "100%",
        height: "12px",
        background: "rgba(255,255,255,0.08)",
        borderRadius: "10px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${progress}%`,
          height: "100%",
          background: "linear-gradient(90deg,#8B5CF6,#06B6D4)",
          transition: "0.4s",
        }}
      />
    </div>
  </div>
)}

      {/* Stats */}
      <div style={styles.stats}>
<div style={styles.stats}>
  <Stat title="Logs" value={data?.total_logs || logs.length} color="#06B6D4" />
  <Stat title="Countries" value={countryData.length} color="#10B981" />
  <Stat title="Attacks" value={data?.total_attacks || attackerData.length} color="#F59E0B" />
  <Stat title="Top IPs" value={attackerData.length} color="#F43F5E" />
  <Stat title="Lines" value={data?.total_lines || 0} color="#3B82F6" />
  <Stat title="Skipped" value={data?.skipped_lines || 0} color="#FF4D4D" />
  <Stat title="Time(s)" value={data?.processing_time || 0} color="#8B5CF6" />
</div>

      </div>








      






      {/* Charts */}
      <div style={styles.grid}>
<div className="card" style={{ gridColumn: "1 / -1" }}>
  <h3>🌍 Global Threat Map</h3>
  <div style={{ height: "820px", width: "100%", overflow: "hidden", borderRadius: "14px", marginTop: "10px" }}>
    <ComposableMap projectionConfig={{ scale: 135 }} style={{ width: "100%", height: "100%" }}>
      <Geographies geography={geoUrl}>
        {({ geographies }) =>
          geographies.map((geo) => (
            <Geography
              key={geo.rsmKey}
              geography={geo}
              fill="#1f3470"
              stroke="#3b4f80"
              style={{
                default: { outline: "none" },
                hover: { fill: "#2a4a9c", outline: "none" },
                pressed: { outline: "none" }
              }}
            />
          ))
        }
      </Geographies>

      <Marker coordinates={[-95, 37]}>
        <circle r={7} fill="#ff4d6d" stroke="#fff" strokeWidth={2} />
      </Marker>
      <Marker coordinates={[78, 22]}>
        <circle r={7} fill="#00d4ff" stroke="#fff" strokeWidth={2} />
      </Marker>
      <Marker coordinates={[10, 51]}>
        <circle r={7} fill="#22c55e" stroke="#fff" strokeWidth={2} />
      </Marker>
    </ComposableMap>
  </div>
</div>






        <Card title="🌍 Top Countries">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={countryData}>
              <CartesianGrid stroke="#1e293b" />
              <XAxis dataKey="country" stroke="#cbd5e1" />
              <YAxis stroke="#cbd5e1" />
              <Tooltip />
              <Bar dataKey="count" fill="#10B981" radius={[10,10,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="🥧 Attack Types">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={typeData}
                dataKey="value"
                innerRadius={55}
                outerRadius={100}
                paddingAngle={4}
              >
                {typeData.map((_, i) => (
                  <Cell key={i} fill={pieColors[i % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div style={styles.grid}>
        <Card title="📈 Threat Timeline">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.timeline || []}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#cbd5e1" />
              <YAxis stroke="#cbd5e1" />
              <Tooltip />
              <Line type="monotone"
                dataKey="count"
                stroke="#06B6D4"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="🚨 Top Attackers">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={attackerData}>
              <CartesianGrid stroke="#1e293b" />
              <XAxis dataKey="ip" stroke="#cbd5e1" />
              <YAxis stroke="#cbd5e1" />
              <Tooltip />
              <Bar dataKey="count" fill="#F43F5E" radius={[10,10,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Table */}
      <Card title="📋 Attack Logs">
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>IP</th>
                <th>Country</th>
                <th>Attack</th>
                <th>Severity</th>
                <th>Method</th>
                <th>Status</th>
                <th>Path</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((l, i) => (
                <tr key={i}>
                  <td>{l.ip}</td>
                  <td>{l.country}</td>
                  <td>{l.attack}</td>
                  <td>{l.severity}</td>
                  <td>{l.method}</td>
                  <td>{l.status}</td>
                  <td>{l.path}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Stat({ title, value, color }) {
  return (
    <div style={{ ...styles.statCard, borderTop: `3px solid ${color}` }}>
      <div style={styles.statTitle}>{title}</div>
      <div style={{ ...styles.statValue, color }}>{value}</div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>{title}</h3>
      {children}
    </div>
  );
}

function Glow() {
  return (
    <>
      <div style={styles.glow1}></div>
      <div style={styles.glow2}></div>
      <div style={styles.glow3}></div>
    </>
  );
}

const styles = {
  page: {
  minHeight: "100vh",
  padding: 24,
  color: "white",
  fontFamily: "Arial, sans-serif",
  background:
    "radial-gradient(circle at top left,#0f172a,#020617,#000000)",
  position: "relative",
  overflow: "hidden",
},

loginPage: {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background:
    "radial-gradient(circle at top left,#0f172a,#020617,#000000)",
backgroundSize: "200% 200%",
animation: "bgMove 8s ease infinite",
},

loginBox: {
  width: "420px",
  padding: "40px",
  borderRadius: "22px",
  textAlign: "center",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.08)",
},
loginInput: {
  width: "100%",
  padding: "14px",
  marginBottom: "12px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.05)",
  color: "white",
},
loginBtn: {
  width: "100%",
  padding: "14px",
  border: "none",
  borderRadius: "14px",
  fontWeight: "700",
  cursor: "pointer",
  background: "linear-gradient(135deg,#8B5CF6,#06B6D4)",
  color: "white",
},

header: {
  marginBottom: 20,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
},


  

  sub: { color: "#94a3b8", marginTop: 6 },

controls: {
  display: "grid",
  gridTemplateColumns: "2fr 1fr auto auto auto auto",
  gap: 12,
  marginBottom: 20,
  alignItems: "center",
},







  input: {
    padding: 14,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.05)",
    color: "white",
    outline: "none",
  },

  demoBtn: {
    padding: "14px 16px",
    border: "none",
    borderRadius: 14,
    cursor: "pointer",
    fontWeight: 700,
    background: "linear-gradient(135deg,#8B5CF6,#06B6D4)",
    color: "white",
  },

  exportBtn: {
    padding: "14px 16px",
    border: "none",
    borderRadius: 14,
    cursor: "pointer",
    fontWeight: 700,
    background: "linear-gradient(135deg,#06B6D4,#3B82F6)",
    color: "white",
  },

  uploadBtn: {
    padding: "14px 16px",
    borderRadius: 14,
    cursor: "pointer",
    fontWeight: 700,
    background: "linear-gradient(135deg,#10B981,#059669)",
    color: "white",
    textAlign: "center",
  },

  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 14,
    marginBottom: 20,
  },

  statCard: {
    background: "rgba(255,255,255,0.05)",
    padding: 18,
    borderRadius: 18,
    backdropFilter: "blur(12px)",
  },

  statTitle: { color: "#94a3b8", fontSize: 14 },

  statValue: { fontSize: 34, fontWeight: 800, marginTop: 8 },

grid: {
  display: "grid",
 gridTemplateColumns: "1fr 1fr",
  gap: 20,
  marginBottom: 20,
},

  card: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: 22,
    padding: 20,
    backdropFilter: "blur(12px)",
  },

  cardTitle: {
    marginBottom: 14,
    fontSize: 24,
    fontWeight: 700,
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    color: "white",
  },

  glow1: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: "50%",
    background: "#06B6D422",
    top: -80,
    left: -80,
    filter: "blur(90px)",
  },

  glow2: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: "50%",
    background: "#8B5CF622",
    right: 100,
    top: 180,
    filter: "blur(90px)",
  },

  glow3: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: "50%",
    background: "#10B98122",
    bottom: 50,
    left: 250,
    filter: "blur(90px)",
  },
};

export default App;






