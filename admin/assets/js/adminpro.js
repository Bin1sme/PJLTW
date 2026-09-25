/* ==============================================================================
   ADMINPRO THEME CONTROLLER - PROFESSIONAL & CORPORATE
   - Hỗ trợ đổi giao diện Sáng / Tối (Light & Dark Mode)
   - Thiết kế & Tùy chỉnh Avatar cá nhân (Upload ảnh hoặc chọn mẫu)
   - Quản lý phiên Đăng nhập / Đăng xuất (Auth Session)
   - Điều khiển biểu đồ Chart.js và các Tab Nghiệp vụ
   ============================================================================== */

// Nạp sidebar.html (nếu trang có <div id="sidebar-container">) TRƯỚC khi
// chạy phần code còn lại — để các getElementById của phần tử nằm trong
// sidebar (nút Logout, avatar sidebar...) tìm thấy đúng phần tử.
async function loadComponentSidebar() {
  const container = document.getElementById('sidebar-container');
  if (!container) return; // trang không dùng sidebar dùng chung -> bỏ qua

  try {
    const response = await fetch('sidebar.html');
    if (response.ok) {
      container.innerHTML = await response.text();
    }
  } catch (err) {
    console.error('Không thể nạp sidebar:', err);
  }

  // Tô sáng đúng mục điều hướng ứng với trang đang xem
  const currentPage = (location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.nav-link-item[data-page]').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-page') === currentPage);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadComponentSidebar();

  // Khai báo sớm để tránh lỗi "Cannot access before initialization":
  // applyTheme() (chạy ngay bên dưới) gọi updateChartTheme(), hàm này
  // cần đọc được 2 biến chart này dù biểu đồ chưa được vẽ.
  let salesLineChart = null;
  let revenueBarChart = null;

  // 1. QUẢN LÝ PHIÊN ĐĂNG NHẬP / ĐĂNG XUẤT (AUTH SESSION)
  const session = JSON.parse(localStorage.getItem('admin_session') || 'null');
  const sidebarLoginText = document.getElementById('sidebarLoginText');
  const sidebarLoginBtn = document.getElementById('sidebarLoginBtn');
  const btnLogout = document.getElementById('btnLogout');

  if (session) {
    if (sidebarLoginText) sidebarLoginText.textContent = 'Logout';
  } else {
    if (sidebarLoginText) sidebarLoginText.textContent = 'Login';
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    window.location.href = 'login.html';
  };

  sidebarLoginBtn?.addEventListener('click', () => {
    if (session) {
      if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi hệ thống quản trị?')) {
        handleLogout();
      }
    } else {
      window.location.href = 'login.html';
    }
  });

  btnLogout?.addEventListener('click', handleLogout);

  // 2. THEME SWITCHER (LIGHT / DARK MODE)
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const floatingGear = document.getElementById('floatingGear');
  const themeText = document.getElementById('themeText');
  const themeIcon = document.getElementById('themeIcon');

  const getSavedTheme = () => localStorage.getItem('adminpro_theme') || 'light';

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('adminpro_theme', theme);

    if (themeText && themeIcon) {
      if (theme === 'dark') {
        themeText.textContent = 'Giao diện Tối';
      } else {
        themeText.textContent = 'Giao diện Sáng';
      }
    }
    updateChartTheme(theme);
  };

  const toggleTheme = () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  };

  themeToggleBtn?.addEventListener('click', toggleTheme);
  floatingGear?.addEventListener('click', toggleTheme);
  applyTheme(getSavedTheme());

  // 3. THIẾT KẾ & TÙY CHỈNH AVATAR QUẢN TRỊ VIÊN
  const defaultProfile = {
    name: session ? session.name : 'Quản Trị Viên',
    role: session ? session.role : 'Super Admin',
    email: session ? session.email : 'admin@minishop.local',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
  };

  const savedProfile = JSON.parse(localStorage.getItem('admin_profile') || JSON.stringify(defaultProfile));

  const sidebarAvatarImg = document.getElementById('sidebarAvatarImg');
  const topbarAvatarImg = document.getElementById('topbarAvatarImg');
  const avatarPreviewCurrent = document.getElementById('avatarPreviewCurrent');
  const sidebarUserName = document.getElementById('sidebarUserName');
  const sidebarUserRole = document.getElementById('sidebarUserRole');
  const dropdownUserName = document.getElementById('dropdownUserName');
  const dropdownUserEmail = document.getElementById('dropdownUserEmail');
  const customAdminName = document.getElementById('customAdminName');
  const customAdminRole = document.getElementById('customAdminRole');

  const updateProfileUI = (profile) => {
    if (sidebarAvatarImg) sidebarAvatarImg.src = profile.avatar;
    if (topbarAvatarImg) topbarAvatarImg.src = profile.avatar;
    if (avatarPreviewCurrent) avatarPreviewCurrent.src = profile.avatar;
    if (sidebarUserName) sidebarUserName.textContent = profile.name;
    if (sidebarUserRole) sidebarUserRole.textContent = profile.role;
    if (dropdownUserName) dropdownUserName.textContent = profile.name;
    if (dropdownUserEmail) dropdownUserEmail.textContent = profile.email || 'admin@minishop.local';
    if (customAdminName) customAdminName.value = profile.name;
    if (customAdminRole) customAdminRole.value = profile.role;
  };

  updateProfileUI(savedProfile);

  // Modal Avatar Controls
  const avatarModal = document.getElementById('avatarCustomizeModal');
  const btnOpenAvatarModal = document.getElementById('btnOpenAvatarModal');
  const sidebarUserProfile = document.getElementById('sidebarUserProfile');
  const btnSidebarSettings = document.getElementById('btnSidebarSettings');
  const btnCloseAvatarModal = document.getElementById('btnCloseAvatarModal');
  const userDropdownMenu = document.getElementById('userDropdownMenu');
  const topbarUserPill = document.getElementById('topbarUserPill');

  const openAvatarModal = () => {
    avatarModal?.classList.add('active');
    userDropdownMenu?.classList.remove('active');
  };

  sidebarUserProfile?.addEventListener('click', openAvatarModal);
  btnOpenAvatarModal?.addEventListener('click', openAvatarModal);
  btnSidebarSettings?.addEventListener('click', openAvatarModal);
  btnCloseAvatarModal?.addEventListener('click', () => avatarModal?.classList.remove('active'));

  // Toggle Topbar dropdown
  topbarUserPill?.addEventListener('click', (e) => {
    e.stopPropagation();
    userDropdownMenu?.classList.toggle('active');
  });

  document.addEventListener('click', (e) => {
    if (!userDropdownMenu?.contains(e.target) && !topbarUserPill?.contains(e.target)) {
      userDropdownMenu?.classList.remove('active');
    }
  });

  // Chọn avatar từ bộ sưu tập có sẵn
  let currentChosenAvatar = savedProfile.avatar;
  const presetButtons = document.querySelectorAll('.avatar-preset-btn');
  presetButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      presetButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const url = btn.getAttribute('data-avatar-url');
      currentChosenAvatar = url;
      if (avatarPreviewCurrent) avatarPreviewCurrent.src = url;
    });
  });

  // Tải ảnh avatar từ máy tính
  const avatarFileInput = document.getElementById('avatarCustomFileInput');
  const avatarUploadLabel = document.getElementById('avatarUploadLabel');
  avatarFileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        currentChosenAvatar = event.target.result;
        if (avatarPreviewCurrent) avatarPreviewCurrent.src = currentChosenAvatar;
        if (avatarUploadLabel) {
          avatarUploadLabel.innerHTML = `Đã chọn: <strong>${file.name}</strong> (${(file.size / 1024).toFixed(1)} KB)`;
        }
      };
      reader.readAsDataURL(file);
    }
  });

  // Submit form cập nhật Avatar & Hồ sơ
  const formCustomizeAvatar = document.getElementById('formCustomizeAvatar');
  formCustomizeAvatar?.addEventListener('submit', (e) => {
    e.preventDefault();
    const updatedName = customAdminName.value.trim() || 'Quản Trị Viên';
    const updatedRole = customAdminRole.value.trim() || 'Super Admin';

    const newProfile = {
      ...savedProfile,
      name: updatedName,
      role: updatedRole,
      avatar: currentChosenAvatar
    };

    localStorage.setItem('admin_profile', JSON.stringify(newProfile));
    updateProfileUI(newProfile);
    if (window.showSuccessModal) {
      showSuccessModal('Cập nhật thành công!', 'Avatar và thông tin quản trị viên đã được lưu.');
    } else if (window.showToast) {
      showToast('Đã cập nhật Avatar và thông tin quản trị viên thành công!');
    } else {
      alert('Đã cập nhật Avatar và thông tin quản trị viên thành công!');
    }
    avatarModal?.classList.remove('active');
  });

  // 4. TAB NAVIGATION (Dashboard, Vendors, Customers, Products, Orders, History)
  const navButtons = document.querySelectorAll('[data-admin-tab]');
  const tabPanes = document.querySelectorAll('.admin-tab-pane');
  const pageTitle = document.getElementById('currentPageTitle');
  const sidebar = document.querySelector('.admin-sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const main = document.querySelector('.admin-main');

  sidebarToggle?.addEventListener('click', () => {
    if (window.innerWidth <= 991) {
      sidebar.classList.toggle('mobile-open');
    } else {
      if (sidebar.style.width === '70px') {
        sidebar.style.width = '250px';
        main.style.marginLeft = '250px';
        document.querySelectorAll('.sidebar-user, .brand-text-pro, .nav-link-item span, .nav-chevron').forEach(el => el.style.display = '');
      } else {
        sidebar.style.width = '70px';
        main.style.marginLeft = '70px';
        document.querySelectorAll('.sidebar-user, .brand-text-pro, .nav-link-item span, .nav-chevron').forEach(el => el.style.display = 'none');
      }
    }
  });

  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-admin-tab');
      navButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      tabPanes.forEach((pane) => {
        pane.classList.toggle('active', pane.id === targetTab);
      });

      if (pageTitle) {
        const text = btn.querySelector('.nav-link-left span')?.textContent || 'Dashboard';
        pageTitle.textContent = text;
      }

      if (window.innerWidth <= 991) {
        sidebar.classList.remove('mobile-open');
      }
    });
  });

  // 5. CHART.JS INITIALIZATION (Sales Overview Line & Bar Charts)

  function initCharts() {
    const lineCtx = document.getElementById('salesLineChart')?.getContext('2d');
    const barCtx = document.getElementById('revenueBarChart')?.getContext('2d');

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    const textColor = isDark ? '#94a3b8' : '#8d97ad';

    if (lineCtx) {
      salesLineChart = new Chart(lineCtx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [
            {
              label: 'Sales ($)',
              data: [3200, 4500, 3900, 5800, 5100, 6800, 7200, 8900, 9400, 10500, 11800, 13500],
              borderColor: '#2563eb',
              backgroundColor: 'rgba(37, 99, 235, 0.08)',
              borderWidth: 2.5,
              fill: true,
              tension: 0.35,
              pointBackgroundColor: '#2563eb',
              pointRadius: 3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: textColor } },
            y: { grid: { color: gridColor }, ticks: { color: textColor } }
          }
        }
      });
    }

    if (barCtx) {
      revenueBarChart = new Chart(barCtx, {
        type: 'bar',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [
            {
              label: 'Targets',
              data: [3000, 4000, 3500, 5200, 4800, 6000, 6800, 8000, 8500, 9500, 10000, 12000],
              backgroundColor: '#93c5fd',
              borderRadius: 4,
              barThickness: 10
            },
            {
              label: 'Actual',
              data: [3200, 4500, 3900, 5800, 5100, 6800, 7200, 8900, 9400, 10500, 11800, 13500],
              backgroundColor: '#2563eb',
              borderRadius: 4,
              barThickness: 10
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: textColor } },
            y: { grid: { color: gridColor }, ticks: { color: textColor } }
          }
        }
      });
    }
  }

  function updateChartTheme(theme) {
    const isDark = theme === 'dark';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    const textColor = isDark ? '#94a3b8' : '#8d97ad';

    [salesLineChart, revenueBarChart].forEach((chart) => {
      if (chart) {
        if (chart.options.scales.x) chart.options.scales.x.ticks.color = textColor;
        if (chart.options.scales.y) {
          chart.options.scales.y.ticks.color = textColor;
          chart.options.scales.y.grid.color = gridColor;
        }
        chart.update();
      }
    });
  }

  initCharts();

  // 6. THÊM SẢN PHẨM & TẠO PHIẾU NHẬP KHO
  const productModal = document.getElementById('addProductModal');
  const openProductModalBtn = document.getElementById('btnOpenAddProduct');
  const closeProductModalBtn = document.getElementById('btnCloseProductModal');
  openProductModalBtn?.addEventListener('click', () => productModal?.classList.add('active'));
  closeProductModalBtn?.addEventListener('click', () => productModal?.classList.remove('active'));

  const fileInput = document.getElementById('productImageFile');
  const fileLabel = document.getElementById('fileUploadText');
  fileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && fileLabel) {
      fileLabel.innerHTML = `Đã chọn ảnh: <strong>${file.name}</strong> (${(file.size / 1024).toFixed(1)} KB)`;
    }
  });

  const formAddProduct = document.getElementById('formAddProduct');
  formAddProduct?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('newProdName').value;
    const price = document.getElementById('newProdPrice').value;
    const category = document.getElementById('newProdCat').value;
    const stock = document.getElementById('newProdStock').value;
    const fileName = fileInput?.files[0]?.name || 'default-it-product.jpg';

    const tableBody = document.querySelector('#productsTable tbody');
    if (tableBody) {
      const newRow = document.createElement('tr');
      newRow.innerHTML = `
        <td><strong style="color:var(--primary)">#IT-${Math.floor(100 + Math.random() * 900)}</strong></td>
        <td><strong>${name}</strong></td>
        <td>${category}</td>
        <td><strong>${parseInt(price).toLocaleString('vi-VN')}₫</strong></td>
        <td><span class="badge-status success">${stock} cái</span></td>
        <td><span class="badge-status info">Đang bán</span></td>
        <td>
          <button class="btn-sm-action">Sửa</button>
          <button class="btn-sm-action delete" onclick="this.closest('tr').remove()">Xóa</button>
        </td>
      `;
      tableBody.prepend(newRow);
      if (window.showSuccessModal) {
        showSuccessModal('Thêm sản phẩm thành công!', `Đã thêm "${name}" kèm ảnh minh họa: ${fileName}.`);
      } else if (window.showToast) {
        showToast(`Đã thêm sản phẩm "${name}" thành công!`);
      } else {
        alert(`Đã thêm sản phẩm "${name}" thành công!`);
      }
      productModal?.classList.remove('active');
      formAddProduct.reset();
      if (fileLabel) fileLabel.innerHTML = '📁 Kéo thả ảnh vào đây hoặc <strong>Bấm để chọn file ảnh từ máy tính</strong>';
    }
  });

  // Phiếu nhập kho
  const stockModal = document.getElementById('addStockModal');
  const openStockModalBtn = document.getElementById('btnOpenAddStock');
  const closeStockModalBtn = document.getElementById('btnCloseStockModal');
  openStockModalBtn?.addEventListener('click', () => stockModal?.classList.add('active'));
  closeStockModalBtn?.addEventListener('click', () => stockModal?.classList.remove('active'));

  const formAddStock = document.getElementById('formAddStock');
  formAddStock?.addEventListener('submit', (e) => {
    e.preventDefault();
    const supplier = document.getElementById('stockSupplier').value;
    const product = document.getElementById('stockProduct').value;
    const qty = document.getElementById('stockQty').value;
    const code = `PN-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const stockTable = document.querySelector('#stockMovementsTable tbody');
    if (stockTable) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong style="color:var(--primary)">${code}</strong></td>
        <td><strong>${product}</strong></td>
        <td>${supplier}</td>
        <td><span class="badge-status success">Nhập hàng (+${qty})</span></td>
        <td>${new Date().toLocaleDateString('vi-VN')}</td>
        <td>${savedProfile.name}</td>
      `;
      stockTable.prepend(row);
      if (window.showSuccessModal) {
        showSuccessModal('Nhập kho thành công!', `Đã tạo phiếu ${code} (+${qty} sản phẩm từ ${supplier}).`);
      } else if (window.showToast) {
        showToast(`Đã tạo phiếu nhập kho ${code} thành công!`);
      } else {
        alert(`Đã tạo phiếu nhập kho ${code} thành công!`);
      }
      stockModal?.classList.remove('active');
      formAddStock.reset();
    }
  });

  // Đóng modal khi bấm ra ngoài
  document.querySelectorAll('.admin-modal-overlay').forEach((overlay) => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('active');
    });
  });
});