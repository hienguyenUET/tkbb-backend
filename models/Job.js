const STATUS = {
    NEW: 'new',
    PROCESSING: 'processing',
    DONE: 'done',
    FAIL: 'fail',
}

module.exports = (sequelize, Sequelize) => {
    return sequelize.define('jobs', {
        status: {
            type: Sequelize.STRING,
            defaultValue: 'active'
        },
        
        payload: {
            type: Sequelize.STRING,
        },

        name: {
            type: Sequelize.STRING,
        },

        error: {
            type: Sequelize.STRING,
        },
    })
}

module.exports.STATICS = { STATUS }