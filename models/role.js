module.exports = (sequelize, Sequelize) => {
	return sequelize.define("roles", {
		roleName: {
			field: "role_name",
			type: Sequelize.STRING,
			unique: true,
			allowNull: false
		},
	}, {
		timestamps: false
	});
}