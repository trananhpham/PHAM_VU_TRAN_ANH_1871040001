// Auto-dismiss flash messages
document.addEventListener('DOMContentLoaded', () => {
  const flash = document.querySelector('.flash');
  if (flash) {
    setTimeout(() => {
      flash.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      flash.style.opacity = '0';
      flash.style.transform = 'translateY(-10px)';
      setTimeout(() => flash.remove(), 500);
    }, 4000);
  }

  // Update current date in topbar
  const dateEl = document.getElementById('current-date');
  if (dateEl) {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.textContent = now.toLocaleDateString('vi-VN', options);
  }

  // Confirm delete dialogs
  document.querySelectorAll('[data-confirm]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (!confirm(btn.dataset.confirm)) e.preventDefault();
    });
  });

  // Active nav item highlight
  const currentPath = window.location.pathname.split('/')[1];
  document.querySelectorAll('.nav-item').forEach(item => {
    const href = item.getAttribute('href');
    if (href && href !== '/' && href.includes(currentPath) && currentPath) {
      item.classList.add('active');
    } else if (href === '/' && currentPath === '') {
      item.classList.add('active');
    }
  });

  // Due date auto-calculate on borrow form
  const borrowDateInput = document.getElementById('borrow_date');
  const dueDateInput = document.getElementById('due_date');
  if (borrowDateInput && dueDateInput) {
    borrowDateInput.addEventListener('change', () => {
      const d = new Date(borrowDateInput.value);
      d.setDate(d.getDate() + 14);
      dueDateInput.value = d.toISOString().split('T')[0];
    });
  }

  // Search form auto-submit on category change
  const categorySelect = document.getElementById('category-filter');
  if (categorySelect) {
    categorySelect.addEventListener('change', () => {
      categorySelect.closest('form').submit();
    });
  }

  // Status filter auto-submit
  const statusSelect = document.getElementById('status-filter');
  if (statusSelect) {
    statusSelect.addEventListener('change', () => {
      statusSelect.closest('form').submit();
    });
  }
});
