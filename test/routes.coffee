should = require('chai').should()
supertest = require 'supertest'
api = supertest 'http://localhost:3000'

describe 'Route for', () ->
    before (done) ->
        # start server
        Server = require '../src/server'
        new Server().start(done)

    describe 'Translation Service', () ->
        it 'returns all available translations', (done) ->
            api.get('/translations')
            .expect(200)
            .expect('Content-Type', /json/)
            .end (err, res) ->
                if err?
                    return done(err)
                res.body.should.be.instanceof Array
                res.body.should.have.length.above 0
                res.body[0].should.have.property 'identifier'
                res.body[0].should.have.property 'language'
                res.body[0].should.have.property 'name'
                done()

    describe 'Strong Statistics', () ->
        strongStatisticsTests = (done) ->
            return (err, res) ->
                if err?
                    return done(err)
                res.body.should.have.property 'overallUsageCount'
                res.body.should.have.property 'bookUsageCount'
                res.body.bookUsageCount.should.be.instanceof Array
                res.body.bookUsageCount.should.have.length.above 0
                c1 = res.body.bookUsageCount[0]
                c1.should.have.property 'bookNr'
                c1.should.have.property 'usageCount'
                res.body.should.have.property 'translationVariants'
                res.body.translationVariants.shoudl.be.instanceof Array
                res.body.translationVariants.should.have.length.above 0
                tv1 = res.body.translationVariants[0]
                tv1.should.have.property 'translationIdentifier'
                tv1.shoud.have.property 'variants'
                tv1.variants.should.be.instanceof Array
                tv1.variants.should.have.length.above 0
                tv1.variants[0].should.be.instanceof String

        it 'returns the word statistics for a hebrew strong number', (done) ->
            api.get('/strong/H160')
            .expect(200)
            .expect('Content-Type', /json/)
            .end strongStatisticsTests(done)

        it 'returns the word statistics for a greek strong number', (done) ->
            api.get('/strong/G26')
            .expect(200)
            .expect('Content-Type', /json/)
            .end strongStatisticsTests(done)

        it 'returns the grammar details for one single greek word', (done) ->
            api.get('/strong/LUTH1912/46/14/1/26')
            .expect(200)
            .expect('Content-Type', /json/)
            .end (err, res) ->
                if err?
                    return done(err)
                b = res.body
                b.should.be.instanceof Array
                b.should.have.length.above 0
                b1 = b[0]
                b1.should.have.property 'translationIdentifier'
                b1.should.have.property 'book'
                b1.should.have.property 'chapter'
                b1.should.have.property 'vers'
                b1.should.have.property 'strongNr'
                b1.should.have.property 'greek'
                b1.should.have.property 'pronounciation'
                b1.should.have.property 'grammar'

        it 'returns an error if the grammar details are requested for an old testament vers', (done) ->
            api.get('/strong/LUTH1912/1/1/1/26')
            .expect(500)
            .expect('Content-Type', /json/)
            .end (err, res) ->
                if err?
                    return done(err)
                done()

    describe 'Bible Service', () ->
        it 'returns a bible chapter', (done) ->
            api.get('/bible/LUTH1912/1/1/')
            .expect(200)
            .expect('Content-Type', /json/)
            .end (err, res) ->
                if err?
                    return done(err)
                res.body.should.have.property 'translations'
                translations = res.body.translations
                translations.should.be.instanceof Array
                translations.should.have.length.above 0
                translation = translations[0]
                translation.should.have.property 'translation'
                translation.should.have.deep.property 'translation.identifier', 'LUTH1912'
                translation.should.have.deep.property 'translation.name'
                translation.should.have.property 'book'
                book = translation.book
                book.should.have.property 'name'
                book.should.have.property 'nr'
                book.should.have.property 'shortName'
                translation.should.have.property 'chapter'
                translation.should.have.property 'verses'
                translation.verses.should.be.instanceof Array
                translation.verses.should.have.length.above 0
                v1 = translation.verses[0]
                v1.should.have.property 'versNumber'
                v1.should.have.property 'text'
                done()

        it 'searches for a text in a translation', (done) ->
            api.get('/search/LUTH1912/Liebe')
            .expect(200)
            .expect('Content-Type', /json/)
            .end (err, res) ->
                if err?
                    return done(err)
                res.body.should.have.property 'translations'
                translations = res.body.translations
                translations.should.be.instanceof Array
                translations.should.have.length.above 0
                translation = translations[0]
                translation.should.have.property 'translation'
                translation.should.have.deep.property 'translation.identifier', 'LUTH1912'
                translation.should.have.deep.property 'translation.name'
                translation.should.have.property 'verses'
                translation.verses.should.be.instanceof Array
                translation.verses.should.have.length.above 0
                v1 = translation.verses[0]
                v1.should.have.property 'book'
                book = v1.book
                book.should.have.property 'name'
                book.should.have.property 'nr'
                book.should.have.property 'shortName'
                v1.should.have.property 'chapter'
                v1.should.have.property 'versNumber'
                v1.should.have.property 'text'
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
