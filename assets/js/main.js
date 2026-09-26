document.addEventListener('DOMContentLoaded', () => {
  // Hero slider
  const slides = document.querySelectorAll('.slide');
  const nextBtn = document.querySelector('.slider-btn.next');
  const prevBtn = document.querySelector('.slider-btn.prev');

  if (slides.length > 0 && nextBtn && prevBtn) {
    let currentIndex = 0;

    function showSlide(index) {
      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
      });
    }

    nextBtn.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % slides.length;
      showSlide(currentIndex);
    });

    prevBtn.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      showSlide(currentIndex);
    });

    setInterval(() => {
      currentIndex = (currentIndex + 1) % slides.length;
      showSlide(currentIndex);
    }, 4500);
  }

  // Catalog advertising slider
  const catalogSlides = document.querySelectorAll('.catalog-hero-slide');
  const catalogNext = document.querySelector('.catalog-hero-btn.next');
  const catalogPrev = document.querySelector('.catalog-hero-btn.prev');
  const catalogCounter = document.querySelector('.catalog-hero-counter strong');

  if (catalogSlides.length > 0 && catalogNext && catalogPrev) {
    let catalogIndex = 0;

    const showCatalogSlide = (index) => {
      catalogIndex = (index + catalogSlides.length) % catalogSlides.length;
      catalogSlides.forEach((slide, slideIndex) => {
        slide.classList.toggle('active', slideIndex === catalogIndex);
      });
      if (catalogCounter) catalogCounter.textContent = String(catalogIndex + 1).padStart(2, '0');
    };

    catalogNext.addEventListener('click', () => showCatalogSlide(catalogIndex + 1));
    catalogPrev.addEventListener('click', () => showCatalogSlide(catalogIndex - 1));
    setInterval(() => showCatalogSlide(catalogIndex + 1), 5000);
  }

  // Product catalog interaction
  const categoryButtons = document.querySelectorAll('.category-filter');
  const productCards = document.querySelectorAll('.product-card');
  const sortSelect = document.querySelector('.toolbar select');
  const filterPanel = document.querySelector('.filter-panel');
  const mobileToggle = document.querySelector('.mobile-filter-toggle');
  const searchInput = document.querySelector('.search-wrap input');

  if (categoryButtons.length > 0 && productCards.length > 0) {
    let activeCategory = 'all';
    let currentSearch = '';

    function applyFilters() {
      productCards.forEach((card) => {
        const name = card.querySelector('h3')?.textContent.toLowerCase() || '';
        const matchesCategory = activeCategory === 'all' || card.dataset.category === activeCategory;
        const matchesSearch = !currentSearch || name.includes(currentSearch);
        card.classList.toggle('is-hidden', !(matchesCategory && matchesSearch));
      });

      const visibleCards = [...productCards].filter((card) => !card.classList.contains('is-hidden'));
      const totalLabel = document.querySelector('.toolbar p strong');
      if (totalLabel) {
        totalLabel.textContent = visibleCards.length;
      }
    }

    categoryButtons.forEach((button) => {
      button.addEventListener('click', () => {
        activeCategory = button.dataset.category;
        categoryButtons.forEach((item) => {
          const parent = item.closest('li');
          parent.classList.toggle('active', item === button);
        });
        applyFilters();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', (event) => {
        currentSearch = event.target.value.trim().toLowerCase();
        applyFilters();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', (event) => {
        const cards = [...document.querySelectorAll('.product-card:not(.is-hidden)')];
        const grid = document.querySelector('.catalog-grid');

        if (!grid) return;

        cards.sort((a, b) => {
          const priceA = parseInt(a.querySelector('.new-price').textContent.replace(/[^\d]/g, ''), 10);
          const priceB = parseInt(b.querySelector('.new-price').textContent.replace(/[^\d]/g, ''), 10);

          if (event.target.value === 'Giá tăng dần') return priceA - priceB;
          if (event.target.value === 'Giá giảm dần') return priceB - priceA;
          return 0;
        });

        cards.forEach((card) => grid.appendChild(card));
      });
    }
  }

  if (mobileToggle && filterPanel) {
    mobileToggle.addEventListener('click', () => {
      filterPanel.classList.toggle('open');
    });
  }

  // Catalog menu and promotion rail
  const catalogMenuLinks = document.querySelectorAll('.header-menu a[data-category]');
  const promoSlides = document.querySelectorAll('.promo-rail-slide');
  const promoDots = document.querySelectorAll('.promo-rail-dots span');

  catalogMenuLinks.forEach((link, index) => {
    link.addEventListener('click', () => {
      catalogMenuLinks.forEach((item) => item.classList.remove('active'));
      link.classList.add('active');

      if (categoryButtons[index]) categoryButtons[index].click();
    });
  });

  // Nearby stores and location drawer
  const locationLinks = document.querySelectorAll('[data-location-action]');

  if (locationLinks.length > 0) {
    document.body.insertAdjacentHTML('beforeend', `
      <div class="location-overlay" data-location-close></div>
      <aside class="location-drawer" aria-label="Cửa hàng và địa điểm" aria-hidden="true">
        <div class="location-drawer-head">
          <div><p class="eyebrow">YuwaShop Store</p><h2 class="location-title">Cửa hàng gần bạn</h2></div>
          <button type="button" class="location-close" data-location-close aria-label="Đóng địa điểm">×</button>
        </div>
        <p class="location-description">Chọn khu vực để tìm cửa hàng thuận tiện nhất cho bạn.</p>
        <label class="location-select-label">Chọn địa điểm<select class="location-select" aria-label="Chọn địa điểm"></select></label>
        <div class="location-list"></div>
      </aside>
    `);

    const locationDrawer = document.querySelector('.location-drawer');
    const locationSelect = document.querySelector('.location-select');
    const locationList = document.querySelector('.location-list');
    const locationTitle = document.querySelector('.location-title');
    const closeLocation = () => {
      document.body.classList.remove('location-open');
      locationDrawer.setAttribute('aria-hidden', 'true');
    };

    let locations = [];
    const renderStores = () => {
      const selected = locations.find((location) => location.city === locationSelect.value);
      locationTitle.textContent = selected?.city || 'Cửa hàng gần bạn';
      locationList.innerHTML = (selected?.stores || []).map((store) => `
        <article class="location-card">
          <div class="location-card-icon">⌖</div>
          <div><h3>${store.name}</h3><p>${store.address}</p><span>Mở cửa ${store.hours}</span></div>
          <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}" target="_blank" rel="noreferrer" aria-label="Mở bản đồ">↗</a>
        </article>
      `).join('');
    };

    MiniShopAPI.getLocations().then((data) => {
      locations = data;
      locationSelect.innerHTML = locations.map((location) => `<option value="${location.city}">${location.city}</option>`).join('');
      renderStores();
    });

    locationSelect.addEventListener('change', renderStores);
    locationLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        document.body.classList.add('location-open');
        locationDrawer.setAttribute('aria-hidden', 'false');
        if (link.dataset.locationAction === 'locations') locationTitle.textContent = 'Địa điểm';
        else renderStores();
      });
    });
    document.querySelectorAll('[data-location-close]').forEach((button) => button.addEventListener('click', closeLocation));
  }

  if (promoSlides.length > 1) {
    let promoIndex = 0;

    setInterval(() => {
      promoSlides[promoIndex].classList.remove('active');
      promoDots[promoIndex]?.classList.remove('active');
      promoIndex = (promoIndex + 1) % promoSlides.length;
      promoSlides[promoIndex].classList.add('active');
      promoDots[promoIndex]?.classList.add('active');
    }, 4200);
  }

  // Cart drawer interaction
  const cartTrigger = document.querySelector('.cart-link');
  const cartDrawer = document.querySelector('.cart-drawer');
  const cartCloseButtons = document.querySelectorAll('[data-cart-close]');

  if (cartTrigger && cartDrawer) {
    const setCartState = (isOpen) => {
      document.body.classList.toggle('cart-open', isOpen);
      cartDrawer.setAttribute('aria-hidden', String(!isOpen));
      cartTrigger.setAttribute('aria-expanded', String(isOpen));
    };

    cartTrigger.addEventListener('click', () => setCartState(true));
    cartCloseButtons.forEach((button) => {
      button.addEventListener('click', () => setCartState(false));
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setCartState(false);
    });

    cartDrawer.querySelectorAll('.cart-item-remove').forEach((button) => {
      button.addEventListener('click', () => {
        button.closest('.cart-item')?.remove();
        const remainingItems = cartDrawer.querySelectorAll('.cart-item').length;
        cartDrawer.querySelector('.cart-item-count').textContent = `(${remainingItems})`;
        const badge = cartTrigger.querySelector('.badge');
        if (badge) badge.textContent = remainingItems;
      });
    });

    // Chuyển hướng sang trang thanh toán khi bấm Tiến hành thanh toán
    cartDrawer.querySelectorAll('.cart-checkout').forEach((button) => {
      button.addEventListener('click', () => {
        window.location.href = 'checkout.html';
      });
    });
  }

  // Nối nút 'Mua ngay' trên trang chi tiết sang checkout.html
  document.querySelectorAll('.secondary-btn').forEach((btn) => {
    if (btn.textContent.trim().toLowerCase().includes('mua ngay')) {
      btn.addEventListener('click', () => {
        window.location.href = 'checkout.html';
      });
    }
  });

  // Favorites drawer and product heart buttons
  const favoriteTrigger = document.querySelector('.favorite-link');
  const productCardsForFavorites = document.querySelectorAll('.product-card');

  if (favoriteTrigger && productCardsForFavorites.length > 0) {
    document.body.insertAdjacentHTML('beforeend', `
      <div class="favorite-overlay" data-favorite-close></div>
      <aside class="favorite-drawer" aria-label="Sản phẩm yêu thích" aria-hidden="true">
        <div class="favorite-drawer-head">
          <div><p class="eyebrow">Danh sách cá nhân</p><h2>Yêu thích <span class="favorite-item-count">(0)</span></h2></div>
          <button type="button" class="favorite-close" data-favorite-close aria-label="Đóng yêu thích">×</button>
        </div>
        <div class="favorite-items"></div>
        <div class="favorite-empty">Bạn chưa lưu sản phẩm nào.<br />Hãy chạm vào biểu tượng trái tim để lưu lại.</div>
      </aside>
    `);

    const favoriteDrawer = document.querySelector('.favorite-drawer');
    const favoriteOverlay = document.querySelector('.favorite-overlay');
    const favoriteItemsContainer = document.querySelector('.favorite-items');
    const favoriteCount = document.querySelector('.favorite-item-count');
    const favoriteBadge = document.querySelector('.favorite-badge');
    const favoriteCloseButtons = document.querySelectorAll('[data-favorite-close]');
    let favoriteItems = [];

    const updateFavoriteState = () => {
      favoriteItemsContainer.innerHTML = favoriteItems.map((item) => `
        <article class="favorite-item" data-favorite-id="${item.id}">
          <img src="${item.image}" alt="${item.name}" />
          <div class="favorite-item-info"><h3>${item.name}</h3><p>${item.price}</p></div>
          <button type="button" class="favorite-item-remove" aria-label="Xóa ${item.name}">×</button>
        </article>
      `).join('');

      favoriteCount.textContent = `(${favoriteItems.length})`;
      favoriteBadge.textContent = favoriteItems.length;
      document.querySelector('.favorite-empty').hidden = favoriteItems.length > 0;

      favoriteItemsContainer.querySelectorAll('.favorite-item-remove').forEach((button) => {
        button.addEventListener('click', () => {
          const item = button.closest('.favorite-item');
          MiniShopAPI.removeFavorite(item.dataset.favoriteId).then((favorites) => {
            favoriteItems = favorites;
            document.querySelector(`[data-favorite-button="${item.dataset.favoriteId}"]`)?.classList.remove('active');
            updateFavoriteState();
          });
        });
      });
    };

    const setFavoriteDrawerState = (isOpen) => {
      document.body.classList.toggle('favorite-open', isOpen);
      favoriteDrawer.setAttribute('aria-hidden', String(!isOpen));
      favoriteTrigger.setAttribute('aria-expanded', String(isOpen));
    };

    productCardsForFavorites.forEach((card, index) => {
      const media = card.querySelector('.product-media');
      const product = MiniShopAPI.getProductFromCard(card, index);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'favorite-product-button';
      button.dataset.favoriteButton = product.id;
      button.setAttribute('aria-label', `Thêm ${product.name} vào yêu thích`);
      button.innerHTML = '♡';
      media?.appendChild(button);

      button.addEventListener('click', () => {
        const isFavorite = favoriteItems.some((favorite) => favorite.id === product.id);
        const action = isFavorite
          ? MiniShopAPI.removeFavorite(product.id)
          : MiniShopAPI.addFavorite(product);
        action.then((favorites) => {
          favoriteItems = favorites;
          button.classList.toggle('active', !isFavorite);
          updateFavoriteState();
        });
      });
    });

    favoriteTrigger.addEventListener('click', () => setFavoriteDrawerState(true));
    favoriteCloseButtons.forEach((button) => {
      button.addEventListener('click', () => setFavoriteDrawerState(false));
    });
    MiniShopAPI.getFavorites().then((favorites) => {
      favoriteItems = favorites;
      favoriteItems.forEach((item) => {
        document.querySelector(`[data-favorite-button="${item.id}"]`)?.classList.add('active');
      });
      updateFavoriteState();
    });
  }

  // Authentication drawer interaction
  const authTrigger = document.querySelector('.login-btn');
  const authDrawer = document.querySelector('.auth-drawer');
  const authCloseButtons = document.querySelectorAll('[data-auth-close]');
  const authTabs = document.querySelectorAll('.auth-tab');
  const authForms = document.querySelectorAll('[data-auth-form]');

  if (authTrigger && authDrawer) {
    const setAuthState = (isOpen) => {
      document.body.classList.toggle('auth-open', isOpen);
      authDrawer.setAttribute('aria-hidden', String(!isOpen));
    };

    authTrigger.addEventListener('click', () => setAuthState(true));
    authCloseButtons.forEach((button) => {
      button.addEventListener('click', () => setAuthState(false));
    });

    authTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.authTab;
        authTabs.forEach((item) => item.classList.toggle('active', item === tab));
        authForms.forEach((form) => {
          form.hidden = form.dataset.authForm !== target;
        });
      });
    });

    authDrawer.querySelectorAll('.password-toggle').forEach((button) => {
      button.addEventListener('click', () => {
        const input = button.closest('.password-field').querySelector('input');
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        button.textContent = isPassword ? 'Ẩn' : 'Hiện';
      });
    });

    authDrawer.querySelectorAll('.auth-form').forEach((form) => {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const submitButton = form.querySelector('.auth-submit');
        const values = Object.fromEntries(new FormData(form).entries());
        const request = form.dataset.authForm === 'register'
          ? MiniShopAPI.register({ name: values.name, email: values.email, password: values.password })
          : MiniShopAPI.login({ email: values.email || values.phone, password: values.password });

        request.then(() => {
          submitButton.textContent = form.dataset.authForm === 'register' ? 'Đã tạo tài khoản' : 'Đã đăng nhập';
          submitButton.disabled = true;
        }).catch(() => {
          submitButton.textContent = 'Thử lại';
        });
      });
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      document.body.classList.remove('cart-open', 'auth-open', 'favorite-open');
      document.body.classList.remove('location-open');
      document.querySelector('.auth-drawer')?.setAttribute('aria-hidden', 'true');
      document.querySelector('.favorite-drawer')?.setAttribute('aria-hidden', 'true');
      document.querySelector('.favorite-link')?.setAttribute('aria-expanded', 'false');
      document.querySelector('.location-drawer')?.setAttribute('aria-hidden', 'true');
    }
  });

  // Page transition for internal links
  const transitionLinks = document.querySelectorAll('.transition-link');

  transitionLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#')) return;

      if (href.startsWith('http')) return;

      event.preventDefault();
      document.body.classList.add('is-transitioning', 'loading');

      setTimeout(() => {
        window.location.href = href;
      }, 420);
    });
  });

  // Initial loaded state
  window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    setTimeout(() => {
      document.body.classList.remove('loading');
    }, 400);
  });
});
