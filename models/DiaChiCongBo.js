module.exports = (sequelize, Sequelize) => {
    return sequelize.define('diachicongbo', {
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        description: {
            type: Sequelize.STRING,
            allowNull: true
        }
    })
}
