const API_URL = 'http://localhost:3001';
let authToken = localStorage.getItem('token') || null;

// Helper: API fetch with auth
async function api(endpoint, options = {}) {
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
  const res = await fetch(url, config);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
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

// Dashboard
async function renderDashboard() {
  app.innerHTML = `
    <header class="flex items-center justify-between" style="padding:1rem 2rem;background:var(--surface);border-bottom:1px solid var(--border);">
      <h1 style="font-size:1.5rem;font-weight:700;color:var(--primary);">HealthTrack</h1>
      <nav class="flex gap-4">
        <a href="#/metrics" style="color:var(--text);text-decoration:none;">Log Metrics</a>
        <a href="#/reports" style="color:var(--text);text-decoration:none;">Reports</a>
        ${authToken ? `<a href="#/" onclick="logout()" style="color:var(--text);text-decoration:none;">Logout</a>` : `<a href="#/login" style="color:var(--text);text-decoration:none;">Login</a>`}
      </nav>
    </header>
    <main class="container" style="padding:2rem 1rem;">
      <h2 style="margin-bottom:1.5rem;">Dashboard</h2>
      <div id="stats" class="flex gap-4" style="margin-bottom:2rem;">
        <div class="card" style="flex:1;text-align:center;">
          <div style="font-size:2rem;font-weight:700;color:var(--primary);">--</div>
          <div style="color:var(--text-light);">Loading...</div>
        </div>
      </div>
      <div class="card">
        <h3 style="margin-bottom:1rem;">Weight Trend</h3>
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
      console.error('Failed to load metrics:', err);
    }
  }
}

function updateDashboard(metrics) {
  const latest = metrics[0];
  const statsDiv = document.getElementById('stats');
  if (statsDiv && latest) {
    statsDiv.innerHTML = `
      <div class="card" style="flex:1;text-align:center;">
        <div style="font-size:2rem;font-weight:700;color:var(--primary);">${latest.weight || '--'}</div>
        <div style="color:var(--text-light);">Current Weight (kg)</div>
      </div>
      <div class="card" style="flex:1;text-align:center;">
        <div style="font-size:2rem;font-weight:700;color:var(--primary);">${latest.sleep ? latest.sleep + 'h' : '--'}</div>
        <div style="color:var(--text-light);">Latest Sleep</div>
      </div>
      <div class="card" style="flex:1;text-align:center;">
        <div style="font-size:2rem;font-weight:700;color:var(--primary);">${metrics.length}</div>
        <div style="color:var(--text-light);">Total Entries</div>
      </div>
    `;
  }
  
  // Render chart
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
            borderColor: '#10b981',
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }
  }, 100);
}

// Login
function renderLogin() {
  app.innerHTML = `
    <div class="container" style="max-width:400px;padding:4rem 1rem;">
      <div class="card">
        <h2 style="text-align:center;margin-bottom:1.5rem;">Welcome Back</h2>
        <form id="loginForm" class="flex flex-col gap-4">
          <input type="email" id="email" placeholder="Email" required>
          <input type="password" id="password" placeholder="Password" required>
          <button type="submit" class="btn btn-primary">Login</button>
        </form>
        <p style="text-align:center;margin-top:1rem;color:var(--text-light);">
          No account? <a href="#/register" style="color:var(--primary);">Register</a>
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
    <div class="container" style="max-width:400px;padding:4rem 1rem;">
      <div class="card">
        <h2 style="text-align:center;margin-bottom:1.5rem;">Join HealthTrack</h2>
        <form id="registerForm" class="flex flex-col gap-4">
          <input type="text" id="name" placeholder="Full Name" required>
          <input type="email" id="email" placeholder="Email" required>
          <input type="password" id="password" placeholder="Password" required>
          <button type="submit" class="btn btn-primary">Create Account</button>
        </form>
        <p style="text-align:center;margin-top:1rem;color:var(--text-light);">
          Already have an account? <a href="#/login" style="color:var(--primary);">Login</a>
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

// Metrics Form
function renderMetrics() {
  app.innerHTML = `
    <header class="flex items-center justify-between" style="padding:1rem 2rem;background:var(--surface);border-bottom:1px solid var(--border);">
      <a href="#/" style="font-size:1.5rem;font-weight:700;color:var(--primary);text-decoration:none;">HealthTrack</a>
      <nav class="flex gap-4">
        <a href="#/reports" style="color:var(--text);text-decoration:none;">Reports</a>
      </nav>
    </header>
    <main class="container" style="max-width:600px;padding:2rem 1rem;">
      <div class="card">
        <h2 style="margin-bottom:1.5rem;">Log Today's Metrics</h2>
        <form id="metricsForm" class="flex flex-col gap-4">
          <div>
            <label style="display:block;margin-bottom:0.5rem;color:var(--text-light);">Weight (kg)</label>
            <input type="number" step="0.1" id="weight" placeholder="72.5">
          </div>
          <div>
            <label style="display:block;margin-bottom:0.5rem;color:var(--text-light);">Sleep (hours)</label>
            <input type="number" step="0.5" id="sleep" placeholder="7.5">
          </div>
          <div>
            <label style="display:block;margin-bottom:0.5rem;color:var(--text-light);">Workout Duration (minutes)</label>
            <input type="number" id="workout" placeholder="45">
          </div>
          <div>
            <label style="display:block;margin-bottom:0.5rem;color:var(--text-light);">Notes</label>
            <textarea rows="3" id="notes" placeholder="How are you feeling today?"></textarea>
          </div>
          <button type="submit" class="btn btn-primary">Save Metrics</button>
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

// Reports
function renderReports() {
  app.innerHTML = `
    <header class="flex items-center justify-between" style="padding:1rem 2rem;background:var(--surface);border-bottom:1px solid var(--border);">
      <a href="#/" style="font-size:1.5rem;font-weight:700;color:var(--primary);text-decoration:none;">HealthTrack</a>
      <nav class="flex gap-4">
        <a href="#/metrics" style="color:var(--text);text-decoration:none;">Log Metrics</a>
      </nav>
    </header>
    <main class="container" style="padding:2rem 1rem;">
      <h2 style="margin-bottom:1.5rem;">Reports</h2>
      <div class="flex gap-4" style="margin-bottom:2rem;">
        <button class="btn btn-primary" onclick="alert('Export PDF coming soon!')">Export PDF</button>
        <button class="btn btn-primary" onclick="alert('Export CSV coming soon!')">Export CSV</button>
      </div>
      <div class="card">
        <h3 style="margin-bottom:1rem;">Weekly Summary</h3>
        <div class="chart-container">
          <canvas id="summaryChart"></canvas>
        </div>
      </div>
    </main>
  `;
}

// Logout
window.logout = function() {
  authToken = null;
  localStorage.removeItem('token');
  navigate('/login');
};

// Router
function handleRoute() {
  const hash = window.location.hash.slice(1) || '/';
  const route = routes[hash];
  if (route) {
    route();
  } else {
    app.innerHTML = '<div class="container" style="padding:4rem 1rem;text-align:center;"><h2>404 - Page Not Found</h2></div>';
  }
}

window.addEventListener('hashchange', handleRoute);
handleRoute();
