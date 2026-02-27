// ========================================
// DATA STORE – localStorage CRUD wrapper
// ========================================

const STORE_PREFIX = 'slf_';

function getStoreKey(entity) {
    return STORE_PREFIX + entity;
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export const Store = {
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
        return { oldItem, newItem: items[index] };
    },

    softDelete(entity, id) {
        const items = this.getAllIncludingDeleted(entity);
        const index = items.findIndex(item => item.id === id);
        if (index === -1) return false;
        items[index]._deleted = true;
        items[index]._deletedAt = new Date().toISOString();
        localStorage.setItem(getStoreKey(entity), JSON.stringify(items));
        return true;
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
    }
};

export default Store;
