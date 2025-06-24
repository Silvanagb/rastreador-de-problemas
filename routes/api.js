'use strict';
const Issue = require('../models/issue');

module.exports = function (app) {

  app.route('/api/issues/:project')

    // GET issues (con filtros opcionales)
    .get(async function (req, res) {
      let project = req.params.project;
      let filters = req.query;
      filters.project = project;

      try {
        const issues = await Issue.find(filters).exec();
        res.json(issues);
      } catch (err) {
        res.status(500).json({ error: 'error al obtener los issues' });
      }
    })

    // POST: crear issue
    .post(async function (req, res) {
      const project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      try {
        const issue = new Issue({
          issue_title,
          issue_text,
          created_by,
          assigned_to: assigned_to || '',
          status_text: status_text || '',
          project
        });

        const saved = await issue.save();
        res.json(saved);
      } catch (err) {
        res.status(500).json({ error: 'error al crear el issue' });
      }
    })

    // PUT: actualizar issue
    .put(async function (req, res) {
      const { _id, ...fields } = req.body;

      if (!_id) return res.json({ error: 'missing _id' });

      if (Object.keys(fields).length === 0) {
        return res.json({ error: 'no update field(s) sent', _id });
      }

      fields.updated_on = new Date();

      try {
        const updated = await Issue.findByIdAndUpdate(_id, fields, { new: true });
        if (!updated) {
          return res.json({ error: 'could not update', _id });
        }
        res.json({ result: 'successfully updated', _id });
      } catch (err) {
        res.json({ error: 'could not update', _id });
      }
    })

    // DELETE: eliminar issue
    .delete(async function (req, res) {
      const { _id } = req.body;
      if (!_id) return res.json({ error: 'missing _id' });

      try {
        const deleted = await Issue.findByIdAndDelete(_id);
        if (!deleted) {
          return res.json({ error: 'could not delete', _id });
        }
        res.json({ result: 'successfully deleted', _id });
      } catch (err) {
        res.json({ error: 'could not delete', _id });
      }
    });
};
