module.exports = (sequelize, Sequelize) => {
  return sequelize.define('isi', {
    journalTitle: {
      type: Sequelize.STRING,
      allowNull: false
    },
    issn: {
      type: Sequelize.STRING(20),
      allowNull: false
    },
    eissn: {
      type: Sequelize.STRING(20),
      allowNull: false
    },
    publisherName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    publisherAddress: {
      type: Sequelize.STRING,
      allowNull: false
    },
    language: {
      type: Sequelize.STRING(50),
    },
    wosc: {
      type: Sequelize.STRING
    }
  })
  
}
