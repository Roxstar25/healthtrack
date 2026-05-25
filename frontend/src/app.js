// HealthTrack SPA Router
const app = document.getElementById('app');

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

// Render Dashboard
function renderDashboard() {
  app.innerHTML = `
    <header class="flex items-center justify-between" style="padding:1rem 2rem;background:var(--surface);border-bottom:1px solid var(--border);">
      <h1 style="font-size:1.5rem;font-weight:700;color:var(--primary);">HealthTrack</h1>
      <nav class="flex gap-4">
        <a href="#/metrics" style="color:var(--text);text-decoration:none;">Log Metrics</a>
        <a href="#/reports" style="color:var(--text);text-decoration:none;">Reports</a>
        <a href="#/login" style="color:var(--text);text-decoration:none;">Login</a>
      </nav>
    </header>
    <main class="container" style="padding:2rem 1rem;">
      <h2 style="margin-bottom:1.5rem;">Dashboard</h2>
      <div class="flex gap-4" style="margin-bottom:2rem;">
        <div class="card" style="flex:1;text-align:center;">
          <div style="font-size:2rem;font-weight:700;color:var(--primary);">72.5</div>
          <div style="color:var(--text-light);">Current Weight (kg)</div>
        </div>
        <div class="card" style="flex:1;text-align:center;">
          <div style="font-size:2rem;font-weight:700;color:var(--primary);">7.5h</div>
          <div style="color:var(--text-light);">Avg Sleep</div>
        </div>
        <div class="card" style="flex:1;text-align:center;">
          <div style="font-size:2rem;font-weight:700;color:var(--primary);">4</div>
          <div style="color:var(--text-light);">Workouts This Week</div>
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
  
  // Render chart
  setTimeout(() => {
    const ctx = document.getElementById('weightChart');
    if (ctx) {
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Weight (kg)',
            data: [73.2, 73.0, 72.8, 72.9, 72.6, 72.5, 72.5],
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

// Render Login
function renderLogin() {
  app.innerHTML = `
    <div class="container" style="max-width:400px;padding:4rem 1rem;">
      <div class="card">
        <h2 style="text-align:center;margin-bottom:1.5rem;">Welcome Back</h2>
        <form id="loginForm" class="flex flex-col gap-4">
          <input type="email" placeholder="Email" required>
          <input type="password" placeholder="Password" required>
          <button type="submit" class="btn btn-primary">Login</button>
        </form>
        <p style="text-align:center;margin-top:1rem;color:var(--text-light);">
          No account? <a href="#/register" style="color:var(--primary);">Register</a>
        </p>
      </div>
    </div>
  `;
  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Login coming soon!');
  });
}

// Render Register
function renderRegister() {
  app.innerHTML = `
    <div class="container" style="max-width:400px;padding:4rem 1rem;">
      <div class="card">
        <h2 style="text-align:center;margin-bottom:1.5rem;">Join HealthTrack</h2>
        <form id="registerForm" class="flex flex-col gap-4">
          <input type="text" placeholder="Full Name" required>
          <input type="email" placeholder="Email" required>
          <input type="password" placeholder="Password" required>
          <button type="submit" class="btn btn-primary">Create Account</button>
        </form>
        <p style="text-align:center;margin-top:1rem;color:var(--text-light);">
          Already have an account? <a href="#/login" style="color:var(--primary);">Login</a>
        </p>
      </div>
    </div>
  `;
  document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Registration coming soon!');
  });
}

// Render Metrics Form
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
            <input type="number" step="0.1" placeholder="72.5" required>
          </div>
          <div>
            <label style="display:block;margin-bottom:0.5rem;color:var(--text-light);">Sleep (hours)</label>
            <input type="number" step="0.5" placeholder="7.5" required>
          </div>
          <div>
            <label style="display:block;margin-bottom:0.5rem;color:var(--text-light);">Workout Duration (minutes)</label>
            <input type="number" placeholder="45">
          </div>
          <div>
            <label style="display:block;margin-bottom:0.5rem;color:var(--text-light);">Notes</label>
            <textarea rows="3" placeholder="How are you feeling today?"></textarea>
          </div>
          <button type="submit" class="btn btn-primary">Save Metrics</button>
        </form>
      </div>
    </main>
  `;
  document.getElementById('metricsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Metrics saved! (API coming soon)');
  });
}

// Render Reports
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
  
  setTimeout(() => {
    const ctx = document.getElementById('summaryChart');
    if (ctx) {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Sleep (hours)',
            data: [7, 6.5, 8, 7.5, 6, 9, 7.5],
            backgroundColor: '#10b981'
          }, {
            label: 'Workout (min)',
            data: [30, 45, 0, 60, 30, 90, 0],
            backgroundColor: '#3b82f6'
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

// Handle routing
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
