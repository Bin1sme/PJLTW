document.addEventListener('DOMContentLoaded', () => {
  // Revenue line chart
  const revenueCtx = document.getElementById('revenueChart');
  if (revenueCtx) {
    new Chart(revenueCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
        datasets: [
          {
            label: 'Revenue',
            data: [12, 18, 14, 26, 21, 29, 34, 42],
            borderColor: '#4ea8ff',
            backgroundColor: 'rgba(78, 168, 255, 0.14)',
            borderWidth: 3,
            fill: true,
            tension: 0.38,
            pointRadius: 0,
          },
          {
            label: 'Target',
            data: [10, 15, 18, 20, 24, 22, 30, 35],
            borderColor: '#27c76f',
            backgroundColor: 'rgba(39, 199, 111, 0.12)',
            borderWidth: 2,
            fill: false,
            tension: 0.35,
            pointRadius: 0,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#9ab0c6' }
          },
          y: {
            grid: { color: 'rgba(148, 163, 184, 0.08)' },
            ticks: { color: '#9ab0c6' }
          }
        }
      }
    });
  }

  // Donut chart
  const donutCtx = document.getElementById('donutChart');
  if (donutCtx) {
    new Chart(donutCtx, {
      type: 'doughnut',
      data: {
        labels: ['Electronics', 'Appliances', 'Accessories'],
        datasets: [{
          data: [52, 31, 17],
          backgroundColor: ['#4ea8ff', '#27c76f', '#ffb648'],
          borderWidth: 0,
          hoverOffset: 10
        }]
      },
      options: {
        cutout: '68%',
        plugins: {
          legend: {
            display: false,
          }
        }
      }
    });
  }

  // Sidebar nav interaction
  const navItems = document.querySelectorAll('.nav-item');
  const sidePanel = document.querySelector('.admin-side-panel');
  const sidePanelTitle = document.getElementById('sidePanelTitle');
  const sidePanelEyebrow = document.getElementById('sidePanelEyebrow');
  const sidePanelBody = document.getElementById('sidePanelBody');
  const sidePanelCloseButtons = document.querySelectorAll('[data-admin-panel-close]');

  const panelContent = {
    analytics: {
      eyebrow: 'Performance center',
      title: 'Analytics',
      body: '<div class="side-kpi-grid"><div><strong>+24.2%</strong><span>Revenue growth</span></div><div><strong>4.68%</strong><span>Conversion rate</span></div></div><div class="side-section"><h3>Report period</h3><div class="side-segmented"><button class="active" type="button">7 days</button><button type="button">30 days</button><button type="button">90 days</button></div></div><div class="side-section"><h3>Top channel</h3><div class="side-progress"><span>Organic search</span><strong>68%</strong><i><b style="width:68%"></b></i></div><div class="side-progress"><span>Direct traffic</span><strong>52%</strong><i><b style="width:52%"></b></i></div></div>'
    },
    orders: {
      eyebrow: 'Order management',
      title: 'Orders',
      body: '<div class="side-filter-row"><span>Recent orders</span><button class="side-action" type="button">Export</button></div><div class="side-list"><div><span class="side-avatar orange">#</span><section><strong>#YW-2048</strong><small>Sam Lee · $1,240</small></section><em class="side-status success">Success</em></div><div><span class="side-avatar blue">#</span><section><strong>#YW-2047</strong><small>Jamie Smith · $780</small></section><em class="side-status pending">Pending</em></div><div><span class="side-avatar purple">#</span><section><strong>#YW-2046</strong><small>Rachel Green · $540</small></section><em class="side-status canceled">Canceled</em></div></div><button class="side-primary" type="button">View all orders</button>'
    },
    customers: {
      eyebrow: 'Customer directory',
      title: 'Customers',
      body: '<div class="side-search">⌕<input type="search" placeholder="Search customers" /></div><div class="side-list"><div><span class="side-avatar green">SL</span><section><strong>Sam Lee</strong><small>sam.lee@example.com</small></section><b>24 orders</b></div><div><span class="side-avatar blue">JS</span><section><strong>Jamie Smith</strong><small>jamie.smith@example.com</small></section><b>12 orders</b></div><div><span class="side-avatar purple">RG</span><section><strong>Rachel Green</strong><small>rachel.green@example.com</small></section><b>8 orders</b></div></div>'
    },
    products: {
      eyebrow: 'Catalog management',
      title: 'Products',
      body: '<div class="side-filter-row"><span>8 products in catalog</span><button class="side-action" type="button">+ Add new</button></div><div class="side-list"><div><span class="side-product">📱</span><section><strong>iPhone 15 Pro Max</strong><small>Phone · 28.990.000₫</small></section><b class="stock-ok">In stock</b></div><div><span class="side-product">💻</span><section><strong>Laptop ASUS ROG</strong><small>Laptop · 31.990.000₫</small></section><b class="stock-low">Low stock</b></div><div><span class="side-product">🎧</span><section><strong>Loa không dây JBL</strong><small>Audio · 5.490.000₫</small></section><b class="stock-ok">In stock</b></div></div>'
    },
    inventory: {
      eyebrow: 'Stock control',
      title: 'Inventory',
      body: '<div class="side-kpi-grid"><div><strong>61</strong><span>Units in stock</span></div><div><strong class="side-warning">4</strong><span>Low-stock SKUs</span></div></div><div class="side-filter-row"><span>Reorder queue</span><button class="side-action" type="button">Export CSV</button></div><div class="side-list"><div><span class="side-product">💻</span><section><strong>Laptop ASUS ROG</strong><small>SKU: YW-LAP-002 · 6 left</small></section><b class="stock-low">Reorder</b></div><div><span class="side-product">⌚</span><section><strong>Apple Watch Series 9</strong><small>SKU: YW-WAT-004 · 9 left</small></section><b class="stock-low">Reorder</b></div></div><button class="side-primary" type="button">Create purchase order</button>'
    },
    promotions: {
      eyebrow: 'Marketing tools',
      title: 'Promotions',
      body: '<div class="side-filter-row"><span>Active campaigns</span><button class="side-action" type="button">+ Create</button></div><div class="side-list"><div><span class="side-avatar green">%</span><section><strong>WELCOME10</strong><small>10% off · 482 redemptions</small></section><b class="stock-ok">Active</b></div><div><span class="side-avatar blue">🚚</span><section><strong>FREESHIP</strong><small>Free shipping · 196 redemptions</small></section><b class="stock-ok">Active</b></div><div><span class="side-avatar orange">%</span><section><strong>FLASH40</strong><small>40% off audio · Ends in 2 days</small></section><b class="stock-low">Ending</b></div></div>'
    },
    staff: {
      eyebrow: 'Access management',
      title: 'Staff & roles',
      body: '<div class="side-filter-row"><span>2 team members</span><button class="side-action" type="button">+ Invite</button></div><div class="side-list"><div><span class="side-avatar purple">OR</span><section><strong>Olivia Rhye</strong><small>Super Admin · Last seen now</small></section><b class="stock-ok">Active</b></div><div><span class="side-avatar blue">DK</span><section><strong>Daniel Kim</strong><small>Order Manager · Last seen 12m</small></section><b class="stock-ok">Active</b></div></div><div class="side-section"><h3>Permissions</h3><div class="permission-row"><span>Manage catalog</span><b>Admin</b></div><div class="permission-row"><span>Refund orders</span><b>Manager</b></div><div class="permission-row"><span>View reports</span><b>All roles</b></div></div>'
    },
    audit: {
      eyebrow: 'Security & traceability',
      title: 'Audit log',
      body: '<div class="side-filter-row"><span>Recent admin activity</span><button class="side-action" type="button">Export log</button></div><div class="side-list"><div><span class="side-avatar blue">↗</span><section><strong>Updated product price</strong><small>Olivia Rhye · 10 min ago</small></section></div><div><span class="side-avatar green">✓</span><section><strong>Confirmed order #YW-2048</strong><small>Daniel Kim · 32 min ago</small></section></div><div><span class="side-avatar orange">⚙</span><section><strong>Changed store settings</strong><small>Olivia Rhye · 1 hour ago</small></section></div></div><button class="side-primary" type="button">View full audit log</button>'
    },
    settings: {
      eyebrow: 'Workspace preferences',
      title: 'Settings',
      body: '<div class="side-form"><label>Store name<input value="YuwaShop" /></label><label>Support email<input value="support@yuwashop.vn" /></label><label>Timezone<select><option>Asia/Ho_Chi_Minh</option><option>Asia/Bangkok</option></select></label><label class="side-toggle"><span>Email notifications<small>Receive daily sales summaries</small></span><input type="checkbox" checked /><i></i></label><button class="side-primary" type="button">Save changes</button></div>'
    }
  };

  const openPanel = (key) => {
    const content = panelContent[key];
    if (!content || !sidePanel) return;
    sidePanelEyebrow.textContent = content.eyebrow;
    sidePanelTitle.textContent = content.title;
    sidePanelBody.innerHTML = content.body;
    sidePanel.classList.add('open');
    document.body.classList.add('admin-panel-open');
    sidePanel.setAttribute('aria-hidden', 'false');

    const loaders = {
      inventory: () => YuwaAdminAPI.getInventory(),
      promotions: () => YuwaAdminAPI.getPromotions(),
      staff: () => YuwaAdminAPI.getStaff(),
      audit: () => YuwaAdminAPI.getAuditLog()
    };
    if (loaders[key]) loaders[key]().catch(() => null);

    const saveButton = sidePanelBody.querySelector('.side-form .side-primary');
    if (saveButton) {
      saveButton.addEventListener('click', async () => {
        const inputs = sidePanelBody.querySelectorAll('input, select');
        const payload = Object.fromEntries([...inputs].map((input) => [input.previousElementSibling?.textContent || input.name || 'setting', input.type === 'checkbox' ? input.checked : input.value]));
        await YuwaAdminAPI.saveSettings(payload);
        saveButton.textContent = 'Saved';
      });
    }
  };

  const closePanel = () => {
    sidePanel?.classList.remove('open');
    document.body.classList.remove('admin-panel-open');
    sidePanel?.setAttribute('aria-hidden', 'true');
  };

  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      navItems.forEach((nav) => nav.classList.remove('active'));
      item.classList.add('active');
      const panelKey = item.dataset.adminPanel;
      if (panelKey && panelKey !== 'home') openPanel(panelKey);
      else closePanel();
    });
  });

  sidePanelCloseButtons.forEach((button) => button.addEventListener('click', closePanel));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closePanel();
  });
});
