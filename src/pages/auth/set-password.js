// ========================================
// AUTH PAGE: Set Password (Invitation flow)
// ========================================

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export function renderSetPassword() {
    const root = document.getElementById('auth-root');
    root.classList.remove('hidden');

    // Extract token from URL query string (?token=...)
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
        root.innerHTML = `
        <div class="auth-bg"><div class="auth-grid"></div><div class="auth-bg-orb"></div></div>
        <div class="auth-card">
            <div class="auth-brand">
                <div class="auth-logo-img-wrap">
                    <img src="/logo-transparent.png" alt="شعار مكتب سرية للمحاماة" class="auth-logo-img" />
                </div>
                <div class="auth-brand-name">مكتب سرية للمحاماة</div>
            </div>
            <div class="auth-error" style="margin-top: 24px;">
                <i class='bx bx-error-circle'></i>
                <span>رابط الدعوة غير صالح أو منتهي الصلاحية</span>
            </div>
            <div class="auth-footer" style="margin-top: 24px;">
                <a href="/" style="color:var(--accent-primary);">العودة لتسجيل الدخول</a>
            </div>
        </div>`;
        return;
    }

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
            <div class="auth-brand-sub">تعيين كلمة المرور</div>
        </div>

        <h2 class="auth-title">أهلاً بك!</h2>
        <p class="auth-subtitle">قم بتعيين كلمة مرور لتفعيل حسابك</p>

        <div id="sp-message" style="display:none;"></div>

        <form class="auth-form" id="set-pw-form" novalidate>
            <div class="auth-field">
                <label class="auth-label" for="sp-password">كلمة المرور الجديدة</label>
                <div style="position:relative;">
                    <i class='bx bx-lock auth-field-icon'></i>
                    <input
                        class="auth-input has-toggle"
                        type="password"
                        id="sp-password"
                        placeholder="••••••••"
                        autocomplete="new-password"
                        required
                    />
                    <button type="button" class="auth-pw-toggle" id="sp-pw-toggle" tabindex="-1">
                        <i class='bx bx-hide' id="sp-pw-icon"></i>
                    </button>
                </div>
                <div class="auth-strength-wrap">
                    <div class="auth-strength-bar">
                        <div class="auth-strength-fill" id="strength-fill"></div>
                    </div>
                    <div class="auth-strength-label" id="strength-label"></div>
                </div>
            </div>

            <div class="auth-field">
                <label class="auth-label" for="sp-confirm">تأكيد كلمة المرور</label>
                <div style="position:relative;">
                    <i class='bx bx-lock-open auth-field-icon'></i>
                    <input
                        class="auth-input has-toggle"
                        type="password"
                        id="sp-confirm"
                        placeholder="••••••••"
                        autocomplete="new-password"
                        required
                    />
                    <button type="button" class="auth-pw-toggle" id="sp-confirm-toggle" tabindex="-1">
                        <i class='bx bx-hide' id="sp-confirm-icon"></i>
                    </button>
                </div>
            </div>

            <button type="submit" class="auth-btn" id="sp-btn">
                <span>تعيين كلمة المرور</span>
            </button>
        </form>
    </div>
    `;

    // Password toggle #1
    setupToggle('sp-password', 'sp-pw-toggle', 'sp-pw-icon');
    // Password toggle #2
    setupToggle('sp-confirm', 'sp-confirm-toggle', 'sp-confirm-icon');

    // Strength meter
    document.getElementById('sp-password').addEventListener('input', (e) => {
        updateStrength(e.target.value);
    });

    // Form submit
    document.getElementById('set-pw-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await doSetPassword(token);
    });

    setTimeout(() => document.getElementById('sp-password')?.focus(), 100);
}

function setupToggle(inputId, btnId, iconId) {
    const input = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    const icon = document.getElementById(iconId);
    btn.addEventListener('click', () => {
        const isHidden = input.type === 'password';
        input.type = isHidden ? 'text' : 'password';
        icon.className = isHidden ? 'bx bx-show' : 'bx bx-hide';
    });
}

function updateStrength(pw) {
    const fill = document.getElementById('strength-fill');
    const label = document.getElementById('strength-label');
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    const levels = [
        { pct: '0%', color: 'transparent', text: '' },
        { pct: '25%', color: '#ef4444', text: 'ضعيفة جداً' },
        { pct: '50%', color: '#f59e0b', text: 'ضعيفة' },
        { pct: '75%', color: '#60a5fa', text: 'جيدة' },
        { pct: '100%', color: '#10b981', text: 'قوية ✓' }
    ];

    const level = pw.length === 0 ? levels[0] : levels[Math.max(1, score)];
    fill.style.width = level.pct;
    fill.style.backgroundColor = level.color;
    label.textContent = level.text;
    label.style.color = level.color;
}

async function doSetPassword(token) {
    const password = document.getElementById('sp-password').value;
    const confirm = document.getElementById('sp-confirm').value;
    const btn = document.getElementById('sp-btn');

    showMessage('', '');

    if (password.length < 8) {
        showMessage('error', 'كلمة المرور يجب أن تكون 8 أحرف على الأقل');
        return;
    }
    if (password !== confirm) {
        showMessage('error', 'كلمتا المرور غير متطابقتين');
        return;
    }

    btn.classList.add('loading');
    btn.disabled = true;

    try {
        const res = await fetch(`${API_BASE}/auth/set-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, password })
        });

        const data = await res.json();

        if (!res.ok) {
            showMessage('error', data.error || 'خطأ في تعيين كلمة المرور');
            return;
        }

        showMessage('success', 'تم تعيين كلمة المرور بنجاح! جارٍ تحويلك لتسجيل الدخول...');

        // Clear the token from URL and redirect to login
        setTimeout(() => {
            // Remove token from URL
            const url = new URL(window.location.href);
            url.searchParams.delete('token');
            window.history.replaceState({}, '', url.pathname);
            // Redirect to login
            window.location.hash = '/login';
            window.location.reload();
        }, 1800);

    } catch (err) {
        showMessage('error', 'تعذر الاتصال بالخادم، يرجى المحاولة مجدداً');
    } finally {
        btn.classList.remove('loading');
        btn.disabled = false;
    }
}

function showMessage(type, text) {
    const el = document.getElementById('sp-message');
    if (!el) return;
    if (!text) { el.style.display = 'none'; return; }
    el.className = type === 'error' ? 'auth-error' : 'auth-success';
    el.innerHTML = `<i class='bx ${type === 'error' ? 'bx-error-circle' : 'bx-check-circle'}'></i><span>${text}</span>`;
    el.style.display = 'flex';
}
