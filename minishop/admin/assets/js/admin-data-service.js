(() => {
  const request = async (endpoint, options = {}) => {
    const response = await fetch(endpoint, {
      credentials: 'same-origin',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...options.headers },
      ...options
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.success === false) throw new Error(payload.message || `Request failed: ${response.status}`);
    return payload.data ?? payload;
  };

  window.YuwaAdminAPI = {
    config: { useBackend: false, apiBaseUrl: '/api/admin' },
    async getSummary(params = {}) {
      if (this.config.useBackend) return request(`${this.config.apiBaseUrl}/summary?${new URLSearchParams(params)}`);
      return { revenue: 48250, views: 214500, orders: 1982, conversion: 4.68 };
    },
    async getInventory(params = {}) {
      if (this.config.useBackend) return request(`${this.config.apiBaseUrl}/inventory?${new URLSearchParams(params)}`);
      return { items: [{ id: 1, name: 'iPhone 15 Pro Max', stock: 24, reorderLevel: 10 }, { id: 2, name: 'Laptop ASUS ROG', stock: 6, reorderLevel: 8 }, { id: 3, name: 'Loa không dây JBL', stock: 31, reorderLevel: 10 }] };
    },
    async getPromotions() {
      if (this.config.useBackend) return request(`${this.config.apiBaseUrl}/promotions`);
      return { items: [{ id: 1, code: 'WELCOME10', type: 'percentage', value: 10, status: 'active' }, { id: 2, code: 'FREESHIP', type: 'shipping', value: 0, status: 'active' }] };
    },
    async getStaff() {
      if (this.config.useBackend) return request(`${this.config.apiBaseUrl}/staff`);
      return { items: [{ id: 1, name: 'Olivia Rhye', role: 'Super Admin', status: 'active' }, { id: 2, name: 'Daniel Kim', role: 'Order Manager', status: 'active' }] };
    },
    async getAuditLog() {
      if (this.config.useBackend) return request(`${this.config.apiBaseUrl}/audit-log`);
      return { items: [{ action: 'Updated product price', actor: 'Olivia Rhye', at: '10 min ago' }, { action: 'Confirmed order #YW-2048', actor: 'Daniel Kim', at: '32 min ago' }] };
    },
    async getNotifications() {
      if (this.config.useBackend) return request(`${this.config.apiBaseUrl}/notifications`);
      return { items: [{ title: 'Low stock alert', detail: 'Laptop ASUS ROG has 6 units left', at: '10 min ago' }, { title: 'New order received', detail: 'Order #YW-2048 needs confirmation', at: '32 min ago' }] };
    },
    async getMessages() {
      if (this.config.useBackend) return request(`${this.config.apiBaseUrl}/messages`);
      return { items: [{ from: 'Daniel Kim', subject: 'Order #YW-2048 confirmed', at: '12 min ago' }, { from: 'YuwaShop Support', subject: 'Weekly report is ready', at: '1 hour ago' }] };
    },
    async searchAdmin(query) {
      if (this.config.useBackend) return request(`${this.config.apiBaseUrl}/search?q=${encodeURIComponent(query)}`);
      return { items: query ? [{ type: 'Order', label: '#YW-2048 · Sam Lee' }, { type: 'Product', label: 'Laptop ASUS ROG' }] : [] };
    },
    async saveSettings(payload) {
      if (this.config.useBackend) return request(`${this.config.apiBaseUrl}/settings`, { method: 'PATCH', body: JSON.stringify(payload) });
      return payload;
    }
  };
})();
