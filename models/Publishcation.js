module.exports = (sequelize, Sequelize) => {
    return sequelize.define('publishcation', {
        type: {
            type: Sequelize.STRING,
        },
        point: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        name: {
            type: Sequelize.STRING,
        },
    })
}

module.exports.STATIC = {
    TYPE: {
        CONFERENCE: 'conference',
        JOURNAL: 'journal'
    }
}