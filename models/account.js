module.exports = (sequelize, Sequelize) => {
	return sequelize.define("accounts", {
		username: {
			field: "username",
			type: Sequelize.STRING,
			unique: true,
			allowNull: false
		},
		password: {
			field: "password",
			type: Sequelize.STRING,
			allowNull: false
		}
	}, {
		timestamps: false
	});
}