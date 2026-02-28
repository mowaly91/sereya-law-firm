const express = require('express');
const router = express.Router();
const { dbAsync } = require('../db');

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Generate generic CRUD routes for a given table name
function generateCrudRoutes(tableName) {
    const crudRouter = express.Router();

    // GET all
    crudRouter.get('/', async (req, res) => {
        try {
            const items = await dbAsync.all(`SELECT * FROM ${tableName} WHERE _deleted = 0`);
            // Parse arrays that might be stringified in the response (e.g. attachments, clientIds)
            const mappedItems = items.map(item => {
                const parsed = { ...item };
                try { if (parsed.attachments) parsed.attachments = JSON.parse(parsed.attachments); } catch (e) { }
                try { if (parsed.clientIds) parsed.clientIds = JSON.parse(parsed.clientIds); } catch (e) { }
                try { if (parsed.subTasks) parsed.subTasks = JSON.parse(parsed.subTasks); } catch (e) { }
                // handle booleans
                if (parsed.active !== undefined) parsed.active = !!parsed.active;
                return parsed;
            });
            res.json(mappedItems);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error fetching data.' });
        }
    });

    // GET by ID
    crudRouter.get('/:id', async (req, res) => {
        try {
            const item = await dbAsync.get(`SELECT * FROM ${tableName} WHERE id = ? AND _deleted = 0`, [req.params.id]);
            if (!item) return res.status(404).json({ error: 'Not found' });

            try { if (item.attachments) item.attachments = JSON.parse(item.attachments); } catch (e) { }
            try { if (item.clientIds) item.clientIds = JSON.parse(item.clientIds); } catch (e) { }
            try { if (item.subTasks) item.subTasks = JSON.parse(item.subTasks); } catch (e) { }
            if (item.active !== undefined) item.active = !!item.active;

            res.json(item);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error fetching data.' });
        }
    });

    // POST create
    crudRouter.post('/', async (req, res) => {
        try {
            const data = req.body;
            data.id = data.id || generateId();
            data._createdAt = new Date().toISOString();
            data._updatedAt = new Date().toISOString();
            data._deleted = 0;

            // Format arrays to strings before saving
            const dbData = { ...data };
            if (dbData.attachments) dbData.attachments = JSON.stringify(dbData.attachments);
            if (dbData.clientIds) dbData.clientIds = JSON.stringify(dbData.clientIds);
            if (dbData.subTasks) dbData.subTasks = JSON.stringify(dbData.subTasks);
            if (dbData.active !== undefined) dbData.active = dbData.active ? 1 : 0;

            const fields = Object.keys(dbData);
            const values = Object.values(dbData);
            const placeholders = fields.map(() => '?').join(', ');

            await dbAsync.run(
                `INSERT INTO ${tableName} (${fields.join(', ')}) VALUES (${placeholders})`,
                values
            );

            res.status(201).json(data);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error saving data.' });
        }
    });

    // PUT update
    crudRouter.put('/:id', async (req, res) => {
        try {
            const id = req.params.id;
            const data = req.body;
            data._updatedAt = new Date().toISOString();

            // Format arrays
            const dbData = { ...data };
            if (dbData.attachments) dbData.attachments = JSON.stringify(dbData.attachments);
            if (dbData.clientIds) dbData.clientIds = JSON.stringify(dbData.clientIds);
            if (dbData.subTasks) dbData.subTasks = JSON.stringify(dbData.subTasks);
            if (dbData.active !== undefined) dbData.active = dbData.active ? 1 : 0;

            // Cannot update id, _createdAt
            delete dbData.id;
            delete dbData._createdAt;

            const fields = Object.keys(dbData);
            const values = Object.values(dbData);
            const assignments = fields.map(f => `${f} = ?`).join(', ');

            await dbAsync.run(
                `UPDATE ${tableName} SET ${assignments} WHERE id = ?`,
                [...values, id]
            );

            // Fetch newly updated
            const updatedItem = await dbAsync.get(`SELECT * FROM ${tableName} WHERE id = ?`, [id]);
            res.json({ newItem: updatedItem });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error updating data.' });
        }
    });

    // DELETE soft delete
    crudRouter.delete('/:id', async (req, res) => {
        try {
            const id = req.params.id;
            await dbAsync.run(
                `UPDATE ${tableName} SET _deleted = 1, _updatedAt = ? WHERE id = ?`,
                [new Date().toISOString(), id]
            );
            res.json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Server error deleting data.' });
        }
    });

    return crudRouter;
}

module.exports = { generateCrudRoutes };
