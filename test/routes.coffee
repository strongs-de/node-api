should = require('chai').should()
supertest = require 'supertest'
api = supertest 'http://localhost:3000'

describe 'Translation Service', () ->
    it 'returns all available translations', (done) ->
        api.get('/translations')
        .expect(200)
        .expect('Content-Type', /json/)
        .end (err, res) ->
            if err?
                return done(err)
            res.body.should.be.instanceof(Array)
            done()

describe 'Bible Service', () ->
    it 'returns a bible chapter', (done) ->
        api.get('/bible/LUTH1912/1/1/')
        .expect(200)
        .expect('Content-Type', /json/)
        .end (err, res) ->
            if err?
                return done(err)
            res.body.should.be.instanceof(Array)
            done()

    it 'searches for a text in a translation', (done) ->
        api.get('/search/LUTH1912/Liebe')
        .expect(200)
        .expect('Content-Type', /json/)
        .end (err, res) ->
            if err?
                return done(err)
            res.body.should.be.instanceof(Array)
            done()

    it 'returns an error if a non existing bible book is requested', (done) ->
        api.get('/bible/LUTH1912/100/1/')
        .expect(500)
        .expect('Content-Type', /json/)
        .end (err, res) ->
            if err?
                return done(err)
            done()

    it 'returns an error if a non existing bible chapter is requested', (done) ->
        api.get('/bible/LUTH1912/1/100/')
        .expect(500)
        .expect('Content-Type', /json/)
        .end (err, res) ->
            if err?
                return done(err)
            done()
