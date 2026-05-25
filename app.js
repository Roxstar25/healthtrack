// HealthTrack - Liquid Glass Edition
const API_URL = 'https://healthtrack-production-bfe3.up.railway.app';
let authToken = localStorage.getItem('token') || null;
const app = document.getElementById('app');

// Theme management
const currentTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', currentTheme);

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
}
window.toggleTheme = toggleTheme;
// API helper
async function api(endpoint, options = {}) {
  document.body.classList.add('api-loading');
  const url = `${API_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: `Bearer ${authToken}` })
    },
    ...options
  };
  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }
  try {
    const res = await fetch(url, config);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  } catch (err) {
    console.error('API Error:', err);
    throw err;
  } finally {
    document.body.classList.remove('api-loading');
  }
}

// Routes
const routes = {
  '/': () => renderDashboard(),
  '/login': () => renderLogin(),
  '/register': () => renderRegister(),
  '/metrics': () => renderMetrics(),
  '/reports': () => renderReports(),
};

function navigate(path) {
  window.location.hash = path;
}

// Header with theme toggle
function getHeader() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  return `
    <header class="glass flex items-center justify-between" style="padding:1rem 2rem;">
      <h1>HealthTrack</h1>
      <nav class="flex gap-4 items-center">
        ${authToken ? `
          <a href="#/metrics" style="color:var(--text);text-decoration:none;font-weight:500;">Log Metrics</a>
          <a href="#/reports" style="color:var(--text);text-decoration:none;font-weight:500;">Reports</a>
          <button onclick="toggleTheme()" class="theme-toggle" title="Toggle theme"></button>
          <button onclick="logout()" class="btn" style="background:var(--surface);color:var(--text);padding:0.5rem 1rem;">Logout</button>
        ` : `
          <button onclick="toggleTheme()" class="theme-toggle" title="Toggle theme"></button>
          <a href="#/login" style="color:var(--text);text-decoration:none;font-weight:500;">Login</a>
          <a href="#/register" class="btn btn-primary" style="text-decoration:none;">Get Started</a>
        `}
      </nav>
    </header>
  `;
}

// Dashboard
async function renderDashboard() {
  app.innerHTML = `
    ${getHeader()}
    <main class="container" style="padding:2rem 1rem;">
      <h2 style="margin-bottom:1.5rem;font-size:1.75rem;font-weight:700;">Dashboard</h2>
      <div id="stats" class="flex gap-4" style="margin-bottom:2rem;">
        <div class="card glass-shine" style="flex:1;text-align:center;">
          <div class="stat-value">--</div>
          <div style="color:var(--text-light);font-weight:500;">Loading...</div>
        </div>
      </div>
      <div class="card glass-shine">
        <h3 style="margin-bottom:1rem;font-weight:600;">Weight Trend</h3>
        <div class="chart-container">
          <canvas id="weightChart"></canvas>
        </div>
      </div>
    </main>
  `;
  
  if (authToken) {
    try {
      const metrics = await api('/api/metrics');
      updateDashboard(metrics);
    } catch (err) {
      document.getElementById('stats').innerHTML = `
        <div class="card glass-shine" style="flex:1;text-align:center;color:var(--danger);padding:2rem;">
          Failed to load data
        </div>
      `;
    }
  } else {
    document.getElementById('stats').innerHTML = `
      <div class="card glass-shine" style="flex:1;text-align:center;padding:3rem;">
        <p style="color:var(--text-light);margin-bottom:1.5rem;font-size:1.125rem;">Login to see your health data</p>
        <a href="#/login" class="btn btn-primary" style="text-decoration:none;">Login</a>
      </div>
    `;
  }
}

function updateDashboard(metrics) {
  const latest = metrics[0];
  const statsDiv = document.getElementById('stats');
  if (statsDiv && latest) {
    statsDiv.innerHTML = `
      <div class="card glass-shine" style="flex:1;text-align:center;">
        <div class="stat-value">${latest.weight || '--'}</div>
        <div style="color:var(--text-light);font-weight:500;">Current Weight (kg)</div>
      </div>
      <div class="card glass-shine" style="flex:1;text-align:center;">
        <div class="stat-value">${latest.sleep ? latest.sleep + 'h' : '--'}</div>
        <div style="color:var(--text-light);font-weight:500;">Latest Sleep</div>
      </div>
      <div class="card glass-shine" style="flex:1;text-align:center;">
        <div class="stat-value">${metrics.length}</div>
        <div style="color:var(--text-light);font-weight:500;">Total Entries</div>
      </div>
    `;
  }
  
  setTimeout(() => {
    const ctx = document.getElementById('weightChart');
    if (ctx && metrics.length > 0) {
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: metrics.slice(0, 7).map(m => new Date(m.date).toLocaleDateString()).reverse(),
          datasets: [{
            label: 'Weight (kg)',
            data: metrics.slice(0, 7).map(m => m.weight).reverse(),
            borderColor: '#C56C86',
            backgroundColor: 'rgba(197, 108, 134, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          }
        }
      });
    }
  }, 100);
}

// Login
function renderLogin() {
  app.innerHTML = `
    <div class="container" style="max-width:420px;padding:4rem 1rem;">
      <div class="card glass-shine">
        <h2 style="text-align:center;margin-bottom:0.5rem;font-size:1.75rem;font-weight:700;">Welcome Back</h2>
        <p style="text-align:center;color:var(--text-light);margin-bottom:1.5rem;">Track your health journey</p>
        <form id="loginForm" class="flex flex-col gap-4">
          <input type="email" id="email" placeholder="Email" required>
          <input type="password" id="password" placeholder="Password" required>
          <button type="submit" class="btn btn-primary" style="width:100%;">Login</button>
        </form>
        <p style="text-align:center;margin-top:1.5rem;color:var(--text-light);">
          No account? <a href="#/register" style="color:var(--accent);text-decoration:none;font-weight:600;">Register</a>
        </p>
      </div>
    </div>
  `;
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const data = await api('/api/auth/login', {
        method: 'POST',
        body: {
          email: document.getElementById('email').value,
          password: document.getElementById('password').value
        }
      });
      authToken = data.token;
      localStorage.setItem('token', authToken);
      navigate('/');
    } catch (err) {
      alert(err.message);
    }
  });
}

// Register
function renderRegister() {
  app.innerHTML = `
    <div class="container" style="max-width:420px;padding:4rem 1rem;">
      <div class="card glass-shine">
        <h2 style="text-align:center;margin-bottom:0.5rem;font-size:1.75rem;font-weight:700;">Join HealthTrack</h2>
        <p style="text-align:center;color:var(--text-light);margin-bottom:1.5rem;">Start your wellness journey</p>
        <form id="registerForm" class="flex flex-col gap-4">
          <input type="text" id="name" placeholder="Full Name" required>
          <input type="email" id="email" placeholder="Email" required>
          <input type="password" id="password" placeholder="Password" required>
          <button type="submit" class="btn btn-primary" style="width:100%;">Create Account</button>
        </form>
        <p style="text-align:center;margin-top:1.5rem;color:var(--text-light);">
          Already have an account? <a href="#/login" style="color:var(--accent);text-decoration:none;font-weight:600;">Login</a>
        </p>
      </div>
    </div>
  `;
  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const data = await api('/api/auth/register', {
        method: 'POST',
        body: {
          name: document.getElementById('name').value,
          email: document.getElementById('email').value,
          password: document.getElementById('password').value
        }
      });
      authToken = data.token;
      localStorage.setItem('token', authToken);
      navigate('/');
    } catch (err) {
      alert(err.message);
    }
  });
}

// Metrics Form with slideable toggles
function renderMetrics() {
  app.innerHTML = `
    ${getHeader()}
    <main class="container" style="max-width:600px;padding:2rem 1rem;">
      <div class="card glass-shine">
        <h2 style="margin-bottom:0.5rem;font-size:1.75rem;font-weight:700;">Log Today's Metrics</h2>
        <p style="color:var(--text-light);margin-bottom:1.5rem;">Track your daily wellness</p>
        
        <div style="margin-bottom:1.5rem;">
          <div class="flex items-center justify-between" style="margin-bottom:1rem;">
            <span style="font-weight:500;">Enable Notifications</span>
            <div class="slide-toggle" onclick="this.classList.toggle('active')"></div>
          </div>
          <div class="flex items-center justify-between" style="margin-bottom:1rem;">
            <span style="font-weight:500;">Share with Doctor</span>
            <div class="slide-toggle" onclick="this.classList.toggle('active')"></div>
          </div>
        </div>
        
        <form id="metricsForm" class="flex flex-col gap-4">
          <div>
            <label style="display:block;margin-bottom:0.5rem;color:var(--text-light);font-weight:500;">Weight (kg)</label>
            <input type="number" step="0.1" id="weight" placeholder="72.5">
          </div>
          <div>
            <label style="display:block;margin-bottom:0.5rem;color:var(--text-light);font-weight:500;">Sleep (hours)</label>
            <input type="number" step="0.5" id="sleep" placeholder="7.5">
          </div>
          <div>
            <label style="display:block;margin-bottom:0.5rem;color:var(--text-light);font-weight:500;">Workout Duration (minutes)</label>
            <input type="number" id="workout" placeholder="45">
          </div>
          <div>
            <label style="display:block;margin-bottom:0.5rem;color:var(--text-light);font-weight:500;">Notes</label>
            <textarea rows="3" id="notes" placeholder="How are you feeling today?"></textarea>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;">Save Metrics</button>
        </form>
      </div>
    </main>
  `;
  document.getElementById('metricsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await api('/api/metrics', {
        method: 'POST',
        body: {
          weight: document.getElementById('weight').value,
          sleep: document.getElementById('sleep').value,
          workout: document.getElementById('workout').value,
          notes: document.getElementById('notes').value
        }
      });
      alert('Metrics saved!');
      navigate('/');
    } catch (err) {
      alert(err.message);
    }
  });
}

// Export functions
window.exportPDF = async function() {
  if (!authToken) { alert('Please login first'); return; }
  try {
    const metrics = await api('/api/metrics');
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('HealthTrack Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);
    let y = 50;
    metrics.forEach((m, i) => {
      if (y > 250) { doc.addPage(); y = 20; }
      doc.text(`${i + 1}. Date: ${new Date(m.date).toLocaleDateString()}`, 20, y);
      doc.text(`   Weight: ${m.weight || '-'} kg | Sleep: ${m.sleep || '-'} h`, 20, y + 7);
      y += 20;
    });
    doc.save('healthtrack-report.pdf');
  } catch (err) { alert('Failed: ' + err.message); }
};

window.exportCSV = async function() {
  if (!authToken) { alert('Please login first'); return; }
  try {
    const metrics = await api('/api/metrics');
    const csv = Papa.unparse(metrics.map(m => ({
      Date: new Date(m.date).toLocaleDateString(),
      Weight: m.weight, Sleep: m.sleep, Workout: m.workout, Notes: m.notes
    })));
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'healthtrack-report.csv'; a.click();
    window.URL.revokeObjectURL(url);
  } catch (err) { alert('Failed: ' + err.message); }
};

// Reports
async function renderReports() {
  app.innerHTML = `
    ${getHeader()}
    <main class="container" style="padding:2rem 1rem;">
      <h2 style="margin-bottom:1.5rem;font-size:1.75rem;font-weight:700;">Reports</h2>
      <div class="flex gap-4" style="margin-bottom:2rem;">
        <button onclick="exportPDF()" class="btn btn-accent">Export PDF</button>
        <button onclick="exportCSV()" class="btn btn-accent">Export CSV</button>
      </div>
      <div class="card glass-shine">
        <h3 style="margin-bottom:1rem;font-weight:600;">Weekly Summary</h3>
        <div class="chart-container">
          <canvas id="summaryChart"></canvas>
        </div>
      </div>
    </main>
  `;
  if (authToken) {
    try {
      const metrics = await api('/api/metrics');
      renderSummaryChart(metrics);
    } catch (err) { console.error(err); }
  }
}

function renderSummaryChart(metrics) {
  setTimeout(() => {
    const ctx = document.getElementById('summaryChart');
    if (ctx && metrics.length > 0) {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: metrics.slice(0, 7).map(m => new Date(m.date).toLocaleDateString()).reverse(),
          datasets: [{
            label: 'Sleep (hours)',
            data: metrics.slice(0, 7).map(m => m.sleep).reverse(),
            backgroundColor: '#725A7A'
          }, {
            label: 'Workout (min)',
            data: metrics.slice(0, 7).map(m => m.workout).reverse(),
            backgroundColor: '#FF7582'
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }
  }, 100);
}

// Logout
function logout() {
  authToken = null;
  localStorage.removeItem('token');
  navigate('/login');
}
window.logout = logout;

// Router
function handleRoute() {
  const hash = window.location.hash.slice(1) || '/';
  const route = routes[hash];
  if (route) route();
  else app.innerHTML = '<div class="container" style="padding:4rem 1rem;text-align:center;"><h2>404</h2></div>';
}

window.addEventListener('hashchange', handleRoute);
handleRoute();
