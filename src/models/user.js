"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {

    class User extends Model {

        static associate(models) {

            User.belongsTo(
                models.Organization,
                {
                    foreignKey: "organization_id"
                }
            );

            User.hasMany(
                models.Submission,
                {
                    foreignKey: "user_id"
                }
            );
        }
    }


    User.init({

        name: {
            type: DataTypes.STRING,
            allowNull: false
        },

        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },

        password: {
            type: DataTypes.STRING,
            allowNull: false
        },

        role: {
            type: DataTypes.ENUM(
                "superadmin",
                "admin",
                "teacher",
                "tutor",
                "student"
            ),
            defaultValue: "student"
        },

        organization_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },

        class: {
            type: DataTypes.STRING,
            allowNull: true
        },

        semester: {
            type: DataTypes.STRING,
            allowNull: true
        },

        course: {
            type: DataTypes.STRING,
            allowNull: true
        },

        status: {
            type: DataTypes.STRING,
            defaultValue: "active"
        },

        tuition_code: {
            type: DataTypes.STRING,
            allowNull: true
        },

        active_device_id: {
            type: DataTypes.STRING,
            allowNull: true
        },

        last_active_at: {
            type: DataTypes.DATE,
            allowNull: true
        }

    }, {

        sequelize,

        modelName: "User",

        tableName: "Users"

    });


    return User;
};