module.exports = (sequelize, Sequelize) => {
    return sequelize.define('users', {
        fullName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        faculty: {
            type: Sequelize.STRING,
        },
        gsUrl: {
            type: Sequelize.STRING,
            allowNull: false
        },
        crawlStatus: {
            type: Sequelize.STRING
        }
    })
}
