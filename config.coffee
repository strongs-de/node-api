module.exports =
    rethinkdb:
        host: 'localhost',
        port: 28015,
        authKey: '',
        db: 'rethinkdb',
        tables: [
            {
                name: 'todos',
                indices: ['createdAt']
            },
            'bible'
        ]
    express:
        port: 3000
