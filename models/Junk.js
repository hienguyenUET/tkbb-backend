module.exports = (sequelize, Sequelize) => {
    return sequelize.define('junk', {
        citation: {
            type: Sequelize.STRING,
            primaryKey: true
        },
        user: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        fullName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        uid: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        title: {
            type: Sequelize.STRING,
            defaultValue: '[Missing]'
        },
        error: {
            type: Sequelize.STRING,
        },
    })
}
