module.exports = (sequelize, Sequelize) => {
	return sequelize.define("faculties", {
		facultyName: {
			field: "faculty_name",
			type: Sequelize.STRING,
			unique: true,
			allowNull: false
		}
	}, {
		timestamps: false
	});
}