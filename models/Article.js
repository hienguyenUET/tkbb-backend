module.exports = (sequelize, Sequelize) => {
    return sequelize.define('articles', {
	    status: {
            type: Sequelize.STRING,
            defaultValue: 'active'
        },
        authors: {
            type: Sequelize.STRING(512),
            allowNull: false,
        },
        isFirstAuthor: {
            field: 'is_first_author',
            type: Sequelize.BOOLEAN,
        },
        isCorrespondingAuthor: {
            field: 'is_corresponding_author',
            type: Sequelize.BOOLEAN,
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
        venue: {
            type: Sequelize.STRING
        },
        publisher: {
            type: Sequelize.STRING,
        },
        publicationDate: {
            type: Sequelize.DATEONLY
        },
        categoryId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        classified: {
            type: Sequelize.BOOLEAN
        },
        originalCategory: {
            field: 'original_category',
            type: Sequelize.INTEGER,
            defaultValue: 1
        }
    })
}
