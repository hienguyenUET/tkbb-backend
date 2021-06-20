module.exports = (sequelize, Sequelize) => {
    return sequelize.define('articles', {
        status: {
            type: Sequelize.STRING,
            defaultValue: 'active'
        },
        authors: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        year: {
            type: Sequelize.STRING,
        },
        title: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        citedUrl: {
            type: Sequelize.STRING,
        },
        citedCount: {
            type: Sequelize.INTEGER,
        },
        publisher: {
            type: Sequelize.STRING,
        },
    })
}