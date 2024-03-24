module.exports = (sequelize, Sequelize) => {
    return sequelize.define('author_types', {
        name: {
            field: 'name',
            type: Sequelize.STRING,
            unique: true,
            notNull: true
        }
    })
}
