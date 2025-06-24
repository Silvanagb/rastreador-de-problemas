const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let testId;

suite('Functional Tests', function() {

  suite('POST /api/issues/{project} => create issue', function() {
    test('Create an issue with every field', function(done) {
      chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'Text',
          created_by: 'Functional Test',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Title');
          assert.equal(res.body.issue_text, 'Text');
          assert.equal(res.body.created_by, 'Functional Test');
          assert.equal(res.body.assigned_to, 'Chai and Mocha');
          assert.equal(res.body.status_text, 'In QA');
          assert.isTrue(res.body.open);
          testId = res.body._id;
          done();
        });
    });

    test('Create an issue with only required fields', function(done) {
      chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'Text',
          created_by: 'Functional Test'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.assigned_to, '');
          assert.equal(res.body.status_text, '');
          done();
        });
    });

    test('Create an issue with missing required fields', function(done) {
      chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title'
        })
        .end(function(err, res){
          assert.equal(res.body.error, 'required field(s) missing');
          done();
        });
    });
  });

  suite('GET /api/issues/{project} => view issues', function() {
    test('View issues on a project', function(done) {
      chai.request(server)
        .get('/api/issues/test')
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          done();
        });
    });

    test('View issues on a project with one filter', function(done) {
      chai.request(server)
        .get('/api/issues/test')
        .query({ open: true })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          done();
        });
    });

    test('View issues on a project with multiple filters', function(done) {
      chai.request(server)
        .get('/api/issues/test')
        .query({ open: true, created_by: 'Functional Test' })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          done();
        });
    });
  });

  suite('PUT /api/issues/{project} => update issue', function() {
    test('Update one field on an issue', function(done) {
      chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: testId,
          status_text: 'Updated!'
        })
        .end(function(err, res){
          assert.equal(res.body.result, 'successfully updated');
          assert.equal(res.body._id, testId);
          done();
        });
    });

    test('Update multiple fields on an issue', function(done) {
      chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: testId,
          status_text: 'Multi-updated!',
          assigned_to: 'New assignee'
        })
        .end(function(err, res){
          assert.equal(res.body.result, 'successfully updated');
          done();
        });
    });

    test('Update an issue with missing _id', function(done) {
      chai.request(server)
        .put('/api/issues/test')
        .send({
          status_text: 'No ID'
        })
        .end(function(err, res){
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });

    test('Update an issue with no fields to update', function(done) {
      chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: testId
        })
        .end(function(err, res){
          assert.equal(res.body.error, 'no update field(s) sent');
          done();
        });
    });

    test('Update an issue with invalid _id', function(done) {
      chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: 'invalidid1234567890',
          issue_text: 'Invalid update'
        })
        .end(function(err, res){
          assert.equal(res.body.error, 'could not update');
          done();
        });
    });
  });

  suite('DELETE /api/issues/{project} => delete issue', function() {
    test('Delete an issue', function(done) {
      chai.request(server)
        .delete('/api/issues/test')
        .send({ _id: testId })
        .end(function(err, res){
          assert.equal(res.body.result, 'successfully deleted');
          done();
        });
    });

    test('Delete an issue with invalid _id', function(done) {
      chai.request(server)
        .delete('/api/issues/test')
        .send({ _id: 'invalidid123' })
        .end(function(err, res){
          assert.equal(res.body.error, 'could not delete');
          done();
        });
    });

    test('Delete an issue with missing _id', function(done) {
      chai.request(server)
        .delete('/api/issues/test')
        .send({})
        .end(function(err, res){
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });
  });
});
