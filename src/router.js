// ========================================
// ROUTER – Hash-based SPA router
// ========================================

const routes = {};
let currentRoute = null;
let beforeNavigate = null;

export function registerRoute(path, handler) {
    routes[path] = handler;
}

export function navigate(path) {
    window.location.hash = path;
}

export function setBeforeNavigate(fn) {
    beforeNavigate = fn;
}

export function getCurrentRoute() {
    return currentRoute;
}

export function getRouteParams() {
    const hash = window.location.hash.slice(1) || '/';
    const parts = hash.split('/').filter(Boolean);
    return parts;
}

function matchRoute(path) {
    // Exact match first
    if (routes[path]) return { handler: routes[path], params: {} };

    // Pattern matching (e.g., /cases/:id)
    for (const pattern in routes) {
        const patternParts = pattern.split('/').filter(Boolean);
        const pathParts = path.split('/').filter(Boolean);

        if (patternParts.length !== pathParts.length) continue;

        const params = {};
        let match = true;

        for (let i = 0; i < patternParts.length; i++) {
            if (patternParts[i].startsWith(':')) {
                params[patternParts[i].slice(1)] = pathParts[i];
            } else if (patternParts[i] !== pathParts[i]) {
                match = false;
                break;
            }
        }

        if (match) return { handler: routes[pattern], params };
    }

    return null;
}

function handleRoute() {
    const path = window.location.hash.slice(1) || '/';
    currentRoute = path;

    const match = matchRoute(path);

    if (match) {
        const container = document.getElementById('page-content');
        if (container) {
            container.innerHTML = '';
            match.handler(container, match.params);
        }

        // Update active sidebar link
        document.querySelectorAll('.sidebar-link').forEach(link => {
            const href = link.getAttribute('data-route');
            if (href === path || (path.startsWith(href) && href !== '/')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    } else {
        // 404
        const container = document.getElementById('page-content');
        if (container) {
            container.innerHTML = `
        <div class="empty-state">
          <div class="icon">🔍</div>
          <h3>الصفحة غير موجودة</h3>
          <p>الصفحة المطلوبة غير متوفرة</p>
          <button class="btn btn-primary" onclick="window.location.hash='/'">العودة للرئيسية</button>
        </div>
      `;
        }
    }
}

export function initRouter() {
    window.addEventListener('hashchange', handleRoute);
    // Initial route
    handleRoute();
}

export default { registerRoute, navigate, initRouter, getCurrentRoute, getRouteParams, setBeforeNavigate };
