// ========================================
// AUTH PAGE: Login
// ========================================

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export function renderLogin() {
    const root = document.getElementById('auth-root');
    root.classList.remove('hidden');

    root.innerHTML = `
    <div class="auth-bg">
        <div class="auth-grid"></div>
        <div class="auth-bg-orb"></div>
    </div>

    <div class="auth-card">
        <div class="auth-brand">
            <div class="auth-logo-img-wrap">
                <img src="/logo-transparent.png" alt="شعار مكتب سرية للمحاماة" class="auth-logo-img" />
            </div>
            <div class="auth-brand-name">مكتب سرية للمحاماة</div>
            <div class="auth-brand-sub">نظام إدارة القضايا</div>
        </div>

        <h2 class="auth-title">تسجيل الدخول</h2>
        <p class="auth-subtitle">أدخل بيانات حسابك للمتابعة</p>

        <div id="login-error" style="display:none;" class="auth-error">
            <i class='bx bx-error-circle'></i>
            <span id="login-error-text"></span>
        </div>

        <form class="auth-form" id="login-form" novalidate>
            <div class="auth-field">
                <label class="auth-label" for="login-email">البريد الإلكتروني</label>
                <div style="position:relative;">
                    <i class='bx bx-envelope auth-field-icon'></i>
                    <input
                        class="auth-input"
                        type="email"
                        id="login-email"
                        placeholder="example@office.com"
                        autocomplete="email"
                        dir="ltr"
                        required
                    />
                </div>
            </div>

            <div class="auth-field">
                <label class="auth-label" for="login-password">كلمة المرور</label>
                <div style="position:relative;">
                    <i class='bx bx-lock-alt auth-field-icon'></i>
                    <input
                        class="auth-input has-toggle"
                        type="password"
                        id="login-password"
                        placeholder="••••••••"
                        autocomplete="current-password"
                        required
                    />
                    <button type="button" class="auth-pw-toggle" id="pw-toggle" title="إظهار/إخفاء كلمة المرور" tabindex="-1">
                        <i class='bx bx-hide' id="pw-toggle-icon"></i>
                    </button>
                </div>
            </div>

            <button type="submit" class="auth-btn" id="login-btn">
                <span>دخول</span>
            </button>
        </form>

        <div class="auth-footer">
            <p>لا تملك كلمة مرور؟ تحقق من بريدك الإلكتروني للحصول على رابط الدعوة</p>
        </div>
    </div>
    `;

    // Password toggle
    const pwInput = document.getElementById('login-password');
    const pwToggle = document.getElementById('pw-toggle');
    const pwIcon = document.getElementById('pw-toggle-icon');
    pwToggle.addEventListener('click', () => {
        const isHidden = pwInput.type === 'password';
        pwInput.type = isHidden ? 'text' : 'password';
        pwIcon.className = isHidden ? 'bx bx-show' : 'bx bx-hide';
    });

    // Form submit
    const form = document.getElementById('login-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await doLogin();
    });

    // Focus email on load
    setTimeout(() => document.getElementById('login-email')?.focus(), 100);
}

async function doLogin() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('login-btn');
    const errorEl = document.getElementById('login-error');
    const errorText = document.getElementById('login-error-text');

    errorEl.style.display = 'none';

    if (!email || !password) {
        showLoginError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
        return;
    }

    // Loading state
    btn.classList.add('loading');
    btn.disabled = true;

    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            showLoginError(data.error || 'خطأ في تسجيل الدخول');
            return;
        }

        // Store JWT and user
        localStorage.setItem('slf_jwt', data.token);
        localStorage.setItem('slf_current_user', JSON.stringify(data.user));

        // Hide auth root and reload app
        document.getElementById('auth-root').classList.add('hidden');
        // Trigger app init
        window.dispatchEvent(new CustomEvent('auth:login', { detail: data.user }));

    } catch (err) {
        showLoginError('تعذر الاتصال بالخادم، يرجى المحاولة مجدداً');
    } finally {
        btn.classList.remove('loading');
        btn.disabled = false;
    }
}

function showLoginError(msg) {
    const el = document.getElementById('login-error');
    const text = document.getElementById('login-error-text');
    if (el && text) {
        text.textContent = msg;
        el.style.display = 'flex';
    }
}
