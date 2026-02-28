// ========================================
// DATA STORE – localStorage CRUD with Backend Sync
// ========================================

const STORE_PREFIX = 'slf_';
const API_BASE_URL = 'http://localhost:3000/api';

function getStoreKey(entity) {
    return STORE_PREFIX + entity;
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Background sync function (fire and forget)
async function syncToBackend(method, entity, data = null, id = null) {
    try {
        let url = `${API_BASE_URL}/${entity}`;
        if (id && method !== 'POST') url += `/${id}`;

        const options = {
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (data) options.body = JSON.stringify(data);

        const res = await fetch(url, options);
        if (!res.ok) console.error(`Backend sync failed for ${entity} ${method}`, await res.text());
    } catch (err) {
        console.error(`Backend sync network error for ${entity} ${method}:`, err);
    }
}

export const Store = {
    // --- SYNCHRONOUS READS (from localStorage) ---
    getAll(entity) {
        const data = localStorage.getItem(getStoreKey(entity));
        const items = data ? JSON.parse(data) : [];
        return items.filter(item => !item._deleted);
    },

    getAllIncludingDeleted(entity) {
        const data = localStorage.getItem(getStoreKey(entity));
        return data ? JSON.parse(data) : [];
    },

    getById(entity, id) {
        const items = this.getAll(entity);
        return items.find(item => item.id === id) || null;
    },

    query(entity, filterFn) {
        const items = this.getAll(entity);
        return items.filter(filterFn);
    },

    count(entity, filterFn) {
        if (filterFn) {
            return this.query(entity, filterFn).length;
        }
        return this.getAll(entity).length;
    },

    // --- SYNCHRONOUS WRITES (updates localStorage, then syncs to backend) ---
    create(entity, data) {
        const items = this.getAllIncludingDeleted(entity);
        const newItem = {
            ...data,
            id: generateId(),
            _createdAt: new Date().toISOString(),
            _updatedAt: new Date().toISOString(),
            _deleted: false
        };
        items.push(newItem);
        localStorage.setItem(getStoreKey(entity), JSON.stringify(items));

        // Sync to backend
        syncToBackend('POST', entity, newItem);

        return newItem;
    },

    update(entity, id, updates) {
        const items = this.getAllIncludingDeleted(entity);
        const index = items.findIndex(item => item.id === id);
        if (index === -1) return null;

        const oldItem = { ...items[index] };
        items[index] = {
            ...items[index],
            ...updates,
            id: items[index].id,
            _createdAt: items[index]._createdAt,
            _updatedAt: new Date().toISOString(),
            _deleted: items[index]._deleted
        };
        localStorage.setItem(getStoreKey(entity), JSON.stringify(items));

        // Sync to backend
        syncToBackend('PUT', entity, items[index], id);

        return { oldItem, newItem: items[index] };
    },

    softDelete(entity, id) {
        const items = this.getAllIncludingDeleted(entity);
        const index = items.findIndex(item => item.id === id);
        if (index === -1) return false;

        items[index]._deleted = true;
        items[index]._deletedAt = new Date().toISOString();
        localStorage.setItem(getStoreKey(entity), JSON.stringify(items));

        // Sync to backend
        syncToBackend('DELETE', entity, null, id);

        return true;
    },

    clear(entity) {
        localStorage.removeItem(getStoreKey(entity));
    },

    clearAll() {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(STORE_PREFIX)) {
                localStorage.removeItem(key);
            }
        });
    },

    // Settings uses a special endpoint but we'll keep local cache for sync UI
    getSetting(key) {
        const data = localStorage.getItem(STORE_PREFIX + 'settings');
        const settings = data ? JSON.parse(data) : {};
        return settings[key] !== undefined ? settings[key] : null;
    },

    setSetting(key, value) {
        const data = localStorage.getItem(STORE_PREFIX + 'settings');
        const settings = data ? JSON.parse(data) : {};
        settings[key] = value;
        localStorage.setItem(STORE_PREFIX + 'settings', JSON.stringify(settings));

        // Sync specific endpoint
        fetch(`${API_BASE_URL}/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key, value })
        }).catch(err => console.error("Setting sync error", err));
    },

    // --- INITIALIZATION ---
    // Called once on app load to populate localStorage from the backend.
    async syncFromServer(entities) {
        try {
            console.log("Syncing from server...");
            for (let entity of entities) {
                const res = await fetch(`${API_BASE_URL}/${entity}`);
                if (res.ok) {
                    const data = await res.json();
                    localStorage.setItem(getStoreKey(entity), JSON.stringify(data));
                }
            }
            console.log("Sync complete!");
            return true;
        } catch (error) {
            console.error("Critical error syncing from backend:", error);
            return false;
        }
    }
};

export default Store;
