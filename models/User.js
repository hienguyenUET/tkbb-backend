module.exports = (sequelize, Sequelize) => {
    return sequelize.define('users', {
        fullName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        gsUrl: {
            type: Sequelize.STRING,
            allowNull: false
        },
        crawlStatus: {
            type: Sequelize.STRING
        },
        startDate: {
            type: Sequelize.DATEONLY,
            allowNull: true
        },
        endDate: {
            type: Sequelize.DATEONLY,
            allowNull: true
        },
        englishName: {
            type: Sequelize.STRING
        }
    })
}
