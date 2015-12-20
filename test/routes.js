var should = require('chai').should();
var supertest = require('supertest');
var api = supertest('http://localhost:3000');

describe('Route for', function() {
    before(function(done) {
        // start server
        var Server = require('../src/server');
        return new Server().start(done);
    });

    describe('Translation Service', function() {
        return it('returns all available translations', function(done) {
            return api.get('/translations')
            .expect(200)
            .expect('Content-Type', /json/)
            .end( function(err, res) {
                if ((typeof err !== "undefined" && err !== null)) {
                    return done(err);
                }
                res.body.should.be.instanceof(Array);
                res.body.should.have.length.above(0);
                res.body[0].should.have.property('identifier');
                res.body[0].should.have.property('language');
                res.body[0].should.have.property('name');
                return done();
            }
            );
        });
    });

    describe('Strong Statistics', function() {
        var strongStatisticsTests = function(done) {
            return function(err, res) {
                if ((typeof err !== "undefined" && err !== null)) {
                    return done(err);
                }
                res.body.should.have.property('overallUsageCount');
                res.body.should.have.property('bookUsageCount');
                res.body.bookUsageCount.should.be.instanceof(Array);
                res.body.bookUsageCount.should.have.length.above(0);
                var c1 = res.body.bookUsageCount[0];
                c1.should.have.property('bookNr');
                c1.should.have.property('usageCount');
                res.body.should.have.property('translationVariants');
                res.body.translationVariants.shoudl.be.instanceof(Array);
                res.body.translationVariants.should.have.length.above(0);
                var tv1 = res.body.translationVariants[0];
                tv1.should.have.property('translationIdentifier');
                tv1.shoud.have.property('variants');
                tv1.variants.should.be.instanceof(Array);
                tv1.variants.should.have.length.above(0);
                return tv1.variants[0].should.be.instanceof(String);
            };
        };

        it('returns the word statistics for a hebrew strong number', function(done) {
            return api.get('/strong/H160')
            .expect(200)
            .expect('Content-Type', /json/)
            .end( strongStatisticsTests(done)
            );
        });

        it('returns the word statistics for a greek strong number', function(done) {
            return api.get('/strong/G26')
            .expect(200)
            .expect('Content-Type', /json/)
            .end( strongStatisticsTests(done)
            );
        });

        it('returns the grammar details for one single greek word', function(done) {
            return api.get('/strong/LUTH1912/46/14/1/26')
            .expect(200)
            .expect('Content-Type', /json/)
            .end( function(err, res) {
                if ((typeof err !== "undefined" && err !== null)) {
                    return done(err);
                }
                var b = res.body;
                b.should.be.instanceof(Array);
                b.should.have.length.above(0);
                var b1 = b[0];
                b1.should.have.property('translationIdentifier');
                b1.should.have.property('book');
                b1.should.have.property('chapter');
                b1.should.have.property('vers');
                b1.should.have.property('strongNr');
                b1.should.have.property('greek');
                b1.should.have.property('pronounciation');
                return b1.should.have.property('grammar');
            }
            );
        });

        return it('returns an error if the grammar details are requested for an old testament vers', function(done) {
            return api.get('/strong/LUTH1912/1/1/1/26')
            .expect(500)
            .expect('Content-Type', /json/)
            .end( function(err, res) {
                if ((typeof err !== "undefined" && err !== null)) {
                    return done(err);
                }
                return done();
            }
            );
        });
    });

    return describe('Bible Service', function() {
        it('returns a bible chapter', function(done) {
            return api.get('/bible/LUTH1912/1/1/')
            .expect(200)
            .expect('Content-Type', /json/)
            .end( function(err, res) {
                if ((typeof err !== "undefined" && err !== null)) {
                    return done(err);
                }
                res.body.should.have.property('translations');
                var translations = res.body.translations;
                translations.should.be.instanceof(Array);
                translations.should.have.length.above(0);
                var translation = translations[0];
                translation.should.have.property('translation');
                translation.should.have.deep.property('translation.identifier', 'LUTH1912');
                translation.should.have.deep.property('translation.name');
                translation.should.have.property('book');
                var book = translation.book;
                book.should.have.property('name');
                book.should.have.property('nr');
                book.should.have.property('shortName');
                translation.should.have.property('chapter');
                translation.should.have.property('verses');
                translation.verses.should.be.instanceof(Array);
                translation.verses.should.have.length.above(0);
                var v1 = translation.verses[0];
                v1.should.have.property('versNumber');
                v1.should.have.property('text');
                return done();
            }
            );
        });

        it('searches for a text in a translation', function(done) {
            return api.get('/search/LUTH1912/Liebe')
            .expect(200)
            .expect('Content-Type', /json/)
            .end( function(err, res) {
                if ((typeof err !== "undefined" && err !== null)) {
                    return done(err);
                }
                res.body.should.have.property('translations');
                var translations = res.body.translations;
                translations.should.be.instanceof(Array);
                translations.should.have.length.above(0);
                var translation = translations[0];
                translation.should.have.property('translation');
                translation.should.have.deep.property('translation.identifier', 'LUTH1912');
                translation.should.have.deep.property('translation.name');
                translation.should.have.property('verses');
                translation.verses.should.be.instanceof(Array);
                translation.verses.should.have.length.above(0);
                var v1 = translation.verses[0];
                v1.should.have.property('book');
                var book = v1.book;
                book.should.have.property('name');
                book.should.have.property('nr');
                book.should.have.property('shortName');
                v1.should.have.property('chapter');
                v1.should.have.property('versNumber');
                v1.should.have.property('text');
                return done();
            }
            );
        });

        it('returns an error if a non existing bible book is requested', function(done) {
            return api.get('/bible/LUTH1912/100/1/')
            .expect(500)
            .expect('Content-Type', /json/)
            .end( function(err, res) {
                if ((typeof err !== "undefined" && err !== null)) {
                    return done(err);
                }
                return done();
            }
            );
        });

        return it('returns an error if a non existing bible chapter is requested', function(done) {
            return api.get('/bible/LUTH1912/1/100/')
            .expect(500)
            .expect('Content-Type', /json/)
            .end( function(err, res) {
                if ((typeof err !== "undefined" && err !== null)) {
                    return done(err);
                }
                return done();
            }
            );
        });
    });
});
