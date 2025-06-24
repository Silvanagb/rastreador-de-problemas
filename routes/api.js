'use strict';

const { MongoClient, ObjectId } = require('mongodb');
const CONNECTION = process.env.DB;

module.exports = function (app) {
  MongoClient.connect(CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(client => {
      const db = client.db('issuetracker');
      const collection = db.collection('issues');

      app.route('/api/issues/:project')

        // GET: Ver problemas
        .get(async (req, res) => {
          const filter = { ...req.query };

          if (filter._id) filter._id = new ObjectId(filter._id);
          if (filter.open) filter.open = filter.open === 'true';

          const issues = await collection.find(filter).toArray();
          res.json(issues);
        })

        // POST: Crear problema
        .post(async (req, res) => {
          const { issue_title, issue_text, created_by, assigned_to = '', status_text = '' } = req.body;

          if (!issue_title || !issue_text || !created_by) {
            return res.json({ error: 'required field(s) missing' });
          }

          const newIssue = {
            issue_title,
            issue_text,
            created_by,
            assigned_to,
            status_text,
            created_on: new Date(),
            updated_on: new Date(),
            open: true
          };

          const result = await collection.insertOne(newIssue);
          res.json({
            _id: result.insertedId,
            ...newIssue
          });
        })

        // PUT: Actualizar problema
        .put(async (req, res) => {
          const { _id, ...fields } = req.body;

          if (!_id) return res.json({ error: 'missing _id' });

          const updateFields = {};
          for (let key in fields) {
            if (fields[key]) {
              updateFields[key] = fields[key];
            }
          }

          if (Object.keys(updateFields).length === 0) {
            return res.json({ error: 'no update field(s) sent', _id });
          }

          updateFields.updated_on = new Date();

          try {
            const result = await collection.updateOne(
              { _id: new ObjectId(_id) },
              { $set: updateFields }
            );

            if (result.modifiedCount === 0) {
              return res.json({ error: 'could not update', _id });
            }

            res.json({ result: 'successfully updated', _id });
          } catch (err) {
            res.json({ error: 'could not update', _id });
          }
        })

        // DELETE: Eliminar problema
        .delete(async (req, res) => {
          const { _id } = req.body;

          if (!_id) return res.json({ error: 'missing _id' });

          try {
            const result = await collection.deleteOne({ _id: new ObjectId(_id) });
            if (result.deletedCount === 0) {
              return res.json({ error: 'could not delete', _id });
            }
            res.json({ result: 'successfully deleted', _id });
          } catch (err) {
            res.json({ error: 'could not delete', _id });
          }
        });
    })
    .catch(err => console.error('MongoDB connection error:', err));
};
