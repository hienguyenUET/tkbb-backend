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
        logging: false
    }
)

db.sequelize = sequelize
db.Sequelize = Sequelize

db.connect = async () => {
    try {
        await db.sequelize.authenticate()

        console.log(`mysql: Connect to ${dbInfo.host}:${dbInfo.port} successfully`)

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

db.DiaChiCongBo = require('./DiaChiCongBo')(sequelize, Sequelize)
db.Account = require('./account')(sequelize, Sequelize)
db.Role = require('./role')(sequelize, Sequelize)
db.Category = require('./Category')(sequelize, Sequelize)
db.Faculty = require('./faculty')(sequelize, Sequelize)
db.ISI = require('./ISI')(sequelize, Sequelize)
db.SCOPUS = require('./SCOPUS')(sequelize, Sequelize)

db.Role.hasMany(db.Account, {
    foreignKey: 'role_id',
    sourceKey: 'id'
})

db.Account.belongsTo(db.Role, {
    foreignKey: 'role_id',
    sourceKey: 'id'
})

db.Account.belongsTo(db.Faculty, {
    foreignKey: 'faculty_id',
    as: 'facultyInfo',
    sourceKey: "id"
})

db.User.belongsTo(db.Account, {
    foreignKey: {
        name: 'account_id',
        allowNull: true
    },
});

db.Account.hasOne(db.User, {
    foreignKey: {
        name: 'account_id',
        allowNull: true
    },
    onDelete: 'CASCADE'
});


db.Faculty.hasMany(db.Account, {
    foreignKey: 'faculty_id',
    as: 'facultyInfo',
    sourceKey: "id"
})

db.User.hasMany(db.Article, {
    foreignKey: 'uid',
    sourceKey: 'id'
})

db.User.belongsTo(db.Faculty, {
    foreignKey: 'faculty_id',
    as: 'facultyInfo',
    sourceKey: "id"
})

db.Faculty.hasMany(db.User, {
    foreignKey: 'faculty_id',
    sourceKey: "id"
})

db.Article.belongsTo(db.User, {
    foreignKey: 'uid',
    sourceKey: 'id'
})

db.Article.belongsTo(db.Category, {
    foreignKey: 'categoryId',
    sourceKey: 'id'
});

db.Category.hasMany(db.Article, {
    foreignKey: 'categoryId',
    sourceKey: 'id'
});

db.DiaChiCongBo.belongsTo(db.Category, {
    foreignKey: 'categoryId',
    sourceKey: 'id'
});

db.Category.hasMany(db.DiaChiCongBo, {
    foreignKey: 'categoryId',
    sourceKey: 'id'
});

db.Junk = require('./Junk')(sequelize, Sequelize)

module.exports = db
