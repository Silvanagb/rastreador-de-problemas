const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let testId;

suite('Functional Tests', function () {
  test('Create issue with all fields', function (done) {
    chai.request(server)
      .post('/api/issues/test')
      .send({
        issue_title: 'Issue 1',
        issue_text: 'Text',
        created_by: 'User',
        assigned_to: 'Dev',
        status_text: 'In QA'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, 'Issue 1');
        testId = res.body._id;
        done();
      });
  });

  test('Create issue with required fields', function (done) {
    chai.request(server)
      .post('/api/issues/test')
      .send({
        issue_title: 'Issue 2',
        issue_text: 'Text',
        created_by: 'User'
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, 'Issue 2');
        done();
      });
  });

  test('Create issue missing required fields', function (done) {
    chai.request(server)
      .post('/api/issues/test')
      .send({ issue_title: '', issue_text: '', created_by: '' })
      .end((err, res) => {
        assert.equal(res.body.error, 'required field(s) missing');
        done();
      });
  });

  test('View issues on project', function (done) {
    chai.request(server)
      .get('/api/issues/test')
      .end((err, res) => {
        assert.isArray(res.body);
        done();
      });
  });

  test('View issues with one filter', function (done) {
    chai.request(server)
      .get('/api/issues/test?open=true')
      .end((err, res) => {
        assert.isArray(res.body);
        done();
      });
  });

  test('View issues with multiple filters', function (done) {
    chai.request(server)
      .get('/api/issues/test?open=true&created_by=User')
      .end((err, res) => {
        assert.isArray(res.body);
        done();
      });
  });

  test('Update one field', function (done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({ _id: testId, issue_text: 'Updated text' })
      .end((err, res) => {
        assert.equal(res.body.result, 'successfully updated');
        done();
      });
  });

  test('Update multiple fields', function (done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({ _id: testId, issue_title: 'New title', open: false })
      .end((err, res) => {
        assert.equal(res.body.result, 'successfully updated');
        done();
      });
  });

  test('Update missing _id', function (done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({ issue_text: 'Updated text' })
      .end((err, res) => {
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });

  test('Update with no fields', function (done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({ _id: testId })
      .end((err, res) => {
        assert.equal(res.body.error, 'no update field(s) sent');
        done();
      });
  });

  test('Update with invalid _id', function (done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({ _id: 'invalidid', issue_text: 'New text' })
      .end((err, res) => {
        assert.equal(res.body.error, 'could not update');
        done();
      });
  });

  test('Delete valid _id', function (done) {
    chai.request(server)
      .delete('/api/issues/test')
      .send({ _id: testId })
      .end((err, res) => {
        assert.equal(res.body.result, 'successfully deleted');
        done();
      });
  });

  test('Delete invalid _id', function (done) {
    chai.request(server)
      .delete('/api/issues/test')
      .send({ _id: 'invalidid' })
      .end((err, res) => {
        assert.equal(res.body.error, 'could not delete');
        done();
      });
  });

  test('Delete missing _id', function (done) {
    chai.request(server)
      .delete('/api/issues/test')
      .send({ })
      .end((err, res) => {
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });
});
