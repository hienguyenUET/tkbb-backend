
const Sequelize = require('sequelize')
const config = require('config')

const dbInfo = config.get('database')
const db = {}

const sequelize = new Sequelize(
    dbInfo.name,
    dbInfo.user,
    dbInfo.password, {
        host: dbInfo.host,
        port: dbInfo.port,
        dialect: 'mysql',
        operatorsAliases: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 1000000,
            idle: 200000,
        },
        define: {
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci',
            freezeTableName: true
        },
    }
)

db.sequelize = sequelize
db.Sequelize = Sequelize

db.connect = async() => {
    try {
        await db.sequelize.authenticate()

        console.log(`mysql: 🍱 Connect to ${dbInfo.host}:${dbInfo.port} successfully`)

        sequelize.sync({
            force: false,
            logging: false
        })
    } catch (err) {
        console.error(err.message)
    }
}


db.User = require('./User')(sequelize, Sequelize)
db.Article = require('./Article')(sequelize, Sequelize)

db.Publishcation = require('./Publishcation')(sequelize, Sequelize)
db.Publishcation.STATIC = require('./Publishcation').STATIC


db.User.hasMany(db.Article, {
    foreignKey: 'uid',
    sourceKey: 'id'
})

db.Article.belongsTo(db.User, {
    foreignKey: 'uid',
    sourceKey: 'id'
})

db.Article.belongsTo(db.Publishcation, {
    foreignKey: 'publishcationId',
    sourceKey: 'id'
})

db.Publishcation.hasMany(db.Article, {
    foreignKey: 'publishcationId',
    sourceKey: 'id'
})


module.exports = db