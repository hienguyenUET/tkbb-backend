module.exports = (sequelize, Sequelize) => {
    return sequelize.define('category', {
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        description: {
            type: Sequelize.STRING(512),
            allowNull: true
        },
        researchHours: {
            type: Sequelize.INTEGER,
            allowNull: false
        }
    })
}
