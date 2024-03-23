module.exports = (sequelize, Sequelize) => {
	return sequelize.define("accounts", {
		username: {
			field: "username",
			type: Sequelize.STRING,
			unique: true,
			allowNull: false
		},
		name: {
			field: "name",
			type: Sequelize.STRING,
			unique: false,
			allowNull: false
		},
		email: {
			field: "email",
			type: Sequelize.STRING,
			unique: false,
			allowNull: false
		},
		password: {
			field: "password",
			type: Sequelize.STRING,
			allowNull: false
		},
		hashed_password: {
			field: "hashed_password",
			type: Sequelize.STRING,
			allowNull: false
		}	}, {
		timestamps: false
	});
}
