(() => {
  const STORAGE_KEYS = {
    cart: 'minishop.cart',
    favorites: 'minishop.favorites',
    session: 'minishop.session'
  };

  const read = (key, fallback) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  };

  const write = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('minishop:data-change', { detail: { key, value } }));
  };

  const request = async (endpoint, options = {}) => {
    const response = await fetch(endpoint, {
      credentials: window.MiniShopAPI?.config?.credentials || 'same-origin',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...options.headers },
      ...options
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.success === false) {
      throw new Error(payload.message || `Request failed: ${response.status}`);
    }
    return payload.data ?? payload;
  };

  window.MiniShopAPI = {
    config: {
      useBackend: false,
      apiBaseUrl: '/api',
      credentials: 'same-origin'
    },

    async getProducts(params = {}) {
      if (this.config.useBackend) {
        const query = new URLSearchParams(params).toString();
        return request(`${this.config.apiBaseUrl}/products${query ? `?${query}` : ''}`);
      }
      return { items: [], total: 0, page: 1, limit: params.limit || 20 };
    },

    async getFavorites() {
      if (this.config.useBackend) return request(`${this.config.apiBaseUrl}/favorites`);
      return read(STORAGE_KEYS.favorites, []).map((item) => ({ ...item, id: String(item.id) }));
    },

    async addFavorite(product) {
      if (this.config.useBackend) return request(`${this.config.apiBaseUrl}/favorites`, {
        method: 'POST',
        body: JSON.stringify({ productId: product.id })
      });
      const favorites = read(STORAGE_KEYS.favorites, []).map((item) => ({ ...item, id: String(item.id) }));
      const normalizedProduct = { ...product, id: String(product.id) };
      if (!favorites.some((item) => item.id === normalizedProduct.id)) favorites.push(normalizedProduct);
      write(STORAGE_KEYS.favorites, favorites);
      return favorites;
    },

    async removeFavorite(productId) {
      if (this.config.useBackend) return request(`${this.config.apiBaseUrl}/favorites/${productId}`, { method: 'DELETE' });
      const favorites = read(STORAGE_KEYS.favorites, []).filter((item) => String(item.id) !== String(productId));
      write(STORAGE_KEYS.favorites, favorites);
      return favorites;
    },

    async getCart() {
      if (this.config.useBackend) return request(`${this.config.apiBaseUrl}/cart`);
      return read(STORAGE_KEYS.cart, []).map((item) => ({ ...item, id: String(item.id) }));
    },

    async addToCart(product, quantity = 1) {
      if (this.config.useBackend) return request(`${this.config.apiBaseUrl}/cart/items`, {
        method: 'POST',
        body: JSON.stringify({ productId: product.id, quantity })
      });
      const cart = read(STORAGE_KEYS.cart, []).map((item) => ({ ...item, id: String(item.id) }));
      const normalizedProduct = { ...product, id: String(product.id) };
      const item = cart.find((entry) => entry.id === normalizedProduct.id);
      if (item) item.quantity += quantity;
      else cart.push({ ...normalizedProduct, quantity });
      write(STORAGE_KEYS.cart, cart);
      return cart;
    },

    async removeFromCart(productId) {
      if (this.config.useBackend) return request(`${this.config.apiBaseUrl}/cart/items/${productId}`, { method: 'DELETE' });
      const cart = read(STORAGE_KEYS.cart, []).filter((item) => String(item.id) !== String(productId));
      write(STORAGE_KEYS.cart, cart);
      return cart;
    },

    async login(credentials) {
      if (this.config.useBackend) return request(`${this.config.apiBaseUrl}/auth/login`, {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
      const session = { user: { email: credentials.email } };
      write(STORAGE_KEYS.session, session);
      return session;
    },

    async register(payload) {
      if (this.config.useBackend) return request(`${this.config.apiBaseUrl}/auth/register`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      const session = { user: { name: payload.name, email: payload.email } };
      write(STORAGE_KEYS.session, session);
      return session;
    },

    async logout() {
      if (this.config.useBackend) return request(`${this.config.apiBaseUrl}/auth/logout`, { method: 'POST' });
      localStorage.removeItem(STORAGE_KEYS.session);
      return null;
    },

    async getCurrentUser() {
      if (this.config.useBackend) return request(`${this.config.apiBaseUrl}/auth/me`);
      return read(STORAGE_KEYS.session, null)?.user || null;
    },

    async getLocations() {
      if (this.config.useBackend) {
        const data = await request(`${this.config.apiBaseUrl}/locations`);
        return Array.isArray(data) ? data : data.cities || [];
      }
      return [
        {
          city: 'TP. Hồ Chí Minh',
          stores: [
            { id: 'hcm-q1', name: 'YuwaShop Nguyễn Huệ', address: '88 Nguyễn Huệ, Quận 1', hours: '08:00 - 22:00' },
            { id: 'hcm-q7', name: 'YuwaShop Crescent Mall', address: '101 Tôn Dật Tiên, Quận 7', hours: '09:00 - 22:00' }
          ]
        },
        {
          city: 'Hà Nội',
          stores: [
            { id: 'hn-caugiay', name: 'YuwaShop Cầu Giấy', address: '168 Cầu Giấy, Hà Nội', hours: '08:00 - 22:00' },
            { id: 'hn-hoankiem', name: 'YuwaShop Hoàn Kiếm', address: '24 Hàng Bài, Hoàn Kiếm', hours: '09:00 - 22:00' }
          ]
        },
        {
          city: 'Đà Nẵng',
          stores: [
            { id: 'dn-haichau', name: 'YuwaShop Hải Châu', address: '56 Bạch Đằng, Hải Châu', hours: '08:00 - 21:30' }
          ]
        }
      ];
    },

    getProductFromCard(card, index) {
      const name = card.querySelector('h3')?.textContent.trim() || 'Sản phẩm';
      const id = card.dataset.productId || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      return {
        id: String(id),
        name,
        price: card.querySelector('.new-price')?.textContent.trim() || '',
        image: card.querySelector('img')?.src || '',
        category: card.dataset.category || null
      };
    }
  };
})();
