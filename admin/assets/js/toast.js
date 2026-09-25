/* =============================================================
   ADMIN TOAST, DIALOG & VALIDATION SYSTEM
   ============================================================= */
(function () {

  // ─── CSS ─────────────────────────────────────────────────
  const css = `
  /* ── Toast container ── */
  #toast-container{position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;pointer-events:none}
  .toast-item{display:flex;align-items:flex-start;gap:12px;background:var(--card-bg,#fff);border:1px solid var(--border-color,#e2e8f0);border-radius:12px;padding:14px 16px;min-width:300px;max-width:380px;box-shadow:0 8px 24px rgba(0,0,0,.12);pointer-events:all;animation:toastIn .3s cubic-bezier(.34,1.56,.64,1) forwards;position:relative;overflow:hidden}
  .toast-item.hiding{animation:toastOut .25s ease-in forwards}
  @keyframes toastIn{from{opacity:0;transform:translateX(60px) scale(.95)}to{opacity:1;transform:translateX(0) scale(1)}}
  @keyframes toastOut{from{opacity:1;transform:translateX(0) scale(1)}to{opacity:0;transform:translateX(60px) scale(.95)}}
  .toast-progress{position:absolute;bottom:0;left:0;height:3px;border-radius:0 0 12px 12px;animation:toastProgress linear forwards}
  @keyframes toastProgress{from{width:100%}to{width:0%}}
  .toast-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .toast-body{flex:1;min-width:0}
  .toast-title{font-size:.875rem;font-weight:700;color:var(--text-heading,#0f172a);margin-bottom:2px}
  .toast-msg{font-size:.8rem;color:var(--text-muted,#64748b);line-height:1.4}
  .toast-close{background:none;border:none;cursor:pointer;color:var(--text-muted,#64748b);font-size:1rem;line-height:1;padding:0;flex-shrink:0;margin-top:2px}
  .toast-close:hover{color:var(--text-heading,#0f172a)}
  .toast-success .toast-icon{background:#dcfce7;color:#16a34a}.toast-success .toast-progress{background:#22c55e}
  .toast-error   .toast-icon{background:#fee2e2;color:#dc2626}.toast-error   .toast-progress{background:#ef4444}
  .toast-warning .toast-icon{background:#fef9c3;color:#b45309}.toast-warning .toast-progress{background:#f59e0b}
  .toast-info    .toast-icon{background:#dbeafe;color:#2563eb}.toast-info    .toast-progress{background:#3b82f6}

  /* ── Form Validation ── */
  .required-star{color:#ef4444;margin-left:3px;font-weight:700}
  .form-input.is-invalid{border-color:#ef4444!important;background:#fff5f5!important;animation:shakeInput .35s ease}
  @keyframes shakeInput{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
  .field-error{font-size:.74rem;color:#ef4444;margin-top:5px;display:flex;align-items:center;gap:5px;font-weight:500;min-height:18px}
  .field-error:empty{display:none}
  .field-error svg{flex-shrink:0}
  .form-input.is-valid{border-color:#22c55e!important}
  .form-input.is-invalid:focus{box-shadow:0 0 0 3px rgba(239,68,68,.15)}

  /* ── Confirm overlay ── */
  #confirm-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:10000;align-items:center;justify-content:center;backdrop-filter:blur(2px)}
  #confirm-overlay.show{display:flex}
  #confirm-box{background:var(--card-bg,#fff);border-radius:16px;padding:28px 28px 22px;width:380px;max-width:95vw;box-shadow:0 24px 64px rgba(0,0,0,.2);animation:toastIn .3s cubic-bezier(.34,1.56,.64,1) forwards}
  #confirm-icon-wrap{width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px}
  #confirm-title{font-size:1rem;font-weight:700;color:var(--text-heading,#0f172a);text-align:center;margin-bottom:8px}
  #confirm-msg{font-size:.85rem;color:var(--text-muted,#64748b);text-align:center;line-height:1.5;margin-bottom:22px}
  .confirm-btns{display:flex;gap:10px;justify-content:center}
  .confirm-btn-cancel{flex:1;padding:10px;border-radius:8px;border:1px solid var(--border-color,#e2e8f0);background:transparent;color:var(--text-main,#334155);font-size:.875rem;font-weight:600;cursor:pointer;transition:.15s}
  .confirm-btn-cancel:hover{background:var(--body-bg,#f4f6f9)}
  .confirm-btn-ok{flex:1;padding:10px;border-radius:8px;border:none;color:#fff;font-size:.875rem;font-weight:600;cursor:pointer;transition:.15s}
  .confirm-btn-ok.danger-btn{background:#ef4444}.confirm-btn-ok.danger-btn:hover{background:#dc2626}
  .confirm-btn-ok.primary-btn{background:var(--primary,#2563eb)}.confirm-btn-ok.primary-btn:hover{background:#1d4ed8}

  /* ── Success Modal ── */
  #success-modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:10000;align-items:center;justify-content:center;backdrop-filter:blur(2px)}
  #success-modal.show{display:flex}
  #success-modal-box{background:var(--card-bg,#fff);border-radius:20px;padding:40px 36px;width:360px;max-width:95vw;text-align:center;box-shadow:0 24px 64px rgba(0,0,0,.2);animation:toastIn .35s cubic-bezier(.34,1.56,.64,1) forwards}
  .success-checkmark{width:72px;height:72px;border-radius:50%;background:#dcfce7;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;animation:checkPop .4s .1s cubic-bezier(.34,1.56,.64,1) both}
  @keyframes checkPop{from{transform:scale(.5);opacity:0}to{transform:scale(1);opacity:1}}
  #success-modal-title{font-size:1.2rem;font-weight:800;color:var(--text-heading,#0f172a);margin-bottom:8px}
  #success-modal-msg{font-size:.875rem;color:var(--text-muted,#64748b);line-height:1.5;margin-bottom:24px}
  #success-modal-btn{background:var(--primary,#2563eb);color:#fff;border:none;padding:11px 32px;border-radius:10px;font-size:.875rem;font-weight:700;cursor:pointer;transition:.15s;width:100%}
  #success-modal-btn:hover{background:#1d4ed8}
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ─── Toast container ─────────────────────────────────────
  const container = document.createElement('div');
  container.id = 'toast-container';
  document.body.appendChild(container);

  // ─── Confirm overlay ─────────────────────────────────────
  document.body.insertAdjacentHTML('beforeend', `
    <div id="confirm-overlay">
      <div id="confirm-box">
        <div id="confirm-icon-wrap"></div>
        <div id="confirm-title"></div>
        <div id="confirm-msg"></div>
        <div class="confirm-btns">
          <button class="confirm-btn-cancel" id="confirm-cancel-btn">Hủy</button>
          <button class="confirm-btn-ok" id="confirm-ok-btn">Xác nhận</button>
        </div>
      </div>
    </div>`);

  // ─── Success modal ────────────────────────────────────────
  document.body.insertAdjacentHTML('beforeend', `
    <div id="success-modal">
      <div id="success-modal-box">
        <div class="success-checkmark">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <div id="success-modal-title"></div>
        <div id="success-modal-msg"></div>
        <button id="success-modal-btn">Đóng</button>
      </div>
    </div>`);

  document.getElementById('success-modal-btn').addEventListener('click', () => document.getElementById('success-modal').classList.remove('show'));
  document.getElementById('success-modal').addEventListener('click', e => { if (e.target === e.currentTarget) e.currentTarget.classList.remove('show'); });

  // ─── Icons ───────────────────────────────────────────────
  const ICONS = {
    success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    error:   `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
    warning: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
    info:    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
  };
  const TITLES = { success: 'Thành công', error: 'Lỗi', warning: 'Cảnh báo', info: 'Thông tin' };

  // ─── showToast ───────────────────────────────────────────
  window.showToast = function (message, type = 'success', duration = 3500) {
    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;
    toast.innerHTML = `
      <div class="toast-icon">${ICONS[type] || ICONS.info}</div>
      <div class="toast-body">
        <div class="toast-title">${TITLES[type] || 'Thông báo'}</div>
        <div class="toast-msg">${message}</div>
      </div>
      <button class="toast-close" aria-label="Đóng">✕</button>
      <div class="toast-progress" style="animation-duration:${duration}ms"></div>`;
    container.appendChild(toast);
    const close = () => { toast.classList.add('hiding'); setTimeout(() => toast.remove(), 250); };
    toast.querySelector('.toast-close').addEventListener('click', close);
    setTimeout(close, duration);
  };

  // ─── showConfirm ─────────────────────────────────────────
  window.showConfirm = function ({ title = 'Xác nhận', message = '', confirmText = 'Xác nhận', cancelText = 'Hủy', type = 'warning', onConfirm, onCancel } = {}) {
    const overlay = document.getElementById('confirm-overlay');
    const iconWrap = document.getElementById('confirm-icon-wrap');
    const titleEl  = document.getElementById('confirm-title');
    const msgEl    = document.getElementById('confirm-msg');
    const okBtn    = document.getElementById('confirm-ok-btn');
    const cancelBtn= document.getElementById('confirm-cancel-btn');

    const iconColors = { warning: ['#fef9c3','#b45309'], danger: ['#fee2e2','#dc2626'], info: ['#dbeafe','#2563eb'] };
    const [bg, color] = iconColors[type] || iconColors.warning;
    iconWrap.style.background = bg;
    iconWrap.innerHTML = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${
      type === 'danger'
        ? '<polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>'
        : '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>'
    }</svg>`;

    titleEl.textContent = title;
    msgEl.textContent   = message;
    okBtn.textContent   = confirmText;
    cancelBtn.textContent = cancelText;
    okBtn.className = `confirm-btn-ok ${type === 'danger' ? 'danger-btn' : 'primary-btn'}`;
    overlay.classList.add('show');

    const doConfirm = () => { overlay.classList.remove('show'); if (typeof onConfirm === 'function') onConfirm(); };
    const doCancel  = () => { overlay.classList.remove('show'); if (typeof onCancel  === 'function') onCancel(); };
    okBtn.onclick     = doConfirm;
    cancelBtn.onclick = doCancel;
    overlay.onclick   = e => { if (e.target === overlay) doCancel(); };
  };

  // ─── showSuccessModal ────────────────────────────────────
  window.showSuccessModal = function (title = 'Thành công!', message = 'Thao tác đã được thực hiện.', btnText = 'Đóng', onClose) {
    const modal   = document.getElementById('success-modal');
    const titleEl = document.getElementById('success-modal-title');
    const msgEl   = document.getElementById('success-modal-msg');
    const btn     = document.getElementById('success-modal-btn');
    titleEl.textContent = title;
    msgEl.textContent   = message;
    btn.textContent     = btnText;
    modal.classList.add('show');
    btn.onclick = () => { modal.classList.remove('show'); if (typeof onClose === 'function') onClose(); };
  };

  // ─── validateForm ────────────────────────────────────────
  /**
   * Validate tất cả fields có attribute [data-required]
   * @param {HTMLElement} formEl - element chứa các input (modal-box hoặc form)
   * @returns {boolean} true nếu hợp lệ
   */
  window.validateForm = function (formEl) {
    let valid = true;

    // Lấy tất cả input/select/textarea có data-required
    const fields = formEl.querySelectorAll('[data-required]');

    fields.forEach(field => {
      const errorEl = field.closest('.form-row')?.querySelector('.field-error');
      const label   = field.dataset.label || 'Trường này';
      let fieldValid = true;
      let errorMsg = '';

      // Kiểm tra rỗng
      if (!field.value || !field.value.trim()) {
        fieldValid = false;
        errorMsg = `${label} không được để trống.`;
      }
      // Kiểm tra email
      else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())) {
        fieldValid = false;
        errorMsg = `${label} không đúng định dạng email.`;
      }
      // Kiểm tra số > 0
      else if ((field.type === 'number') && Number(field.value) <= 0) {
        fieldValid = false;
        errorMsg = `${label} phải lớn hơn 0.`;
      }
      // Kiểm tra mật khẩu tối thiểu 6 ký tự
      else if (field.type === 'password' && field.value.trim().length < 6) {
        fieldValid = false;
        errorMsg = `${label} phải có ít nhất 6 ký tự.`;
      }

      if (!fieldValid) {
        field.classList.add('is-invalid');
        field.classList.remove('is-valid');
        if (errorEl) {
          errorEl.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>${errorMsg}`;
        }
        valid = false;
      } else {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
        if (errorEl) errorEl.textContent = '';
      }
    });

    // Focus vào field lỗi đầu tiên
    if (!valid) {
      const firstInvalid = formEl.querySelector('.is-invalid');
      firstInvalid?.focus();
      showToast('Vui lòng điền đầy đủ thông tin bắt buộc.', 'error', 3000);
    }

    return valid;
  };

  // ─── Auto-clear lỗi khi user bắt đầu nhập ───────────────
  document.addEventListener('input', e => {
    const el = e.target;
    if (el.classList.contains('is-invalid')) {
      el.classList.remove('is-invalid');
      const errorEl = el.closest('.form-row')?.querySelector('.field-error');
      if (errorEl) errorEl.textContent = '';
    }
  });

})();
