'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {

    async up(queryInterface, Sequelize) {

        const tableDescription =
            await queryInterface.describeTable('Users');


        // --------------------------------------------------
        // STATUS
        // --------------------------------------------------

        if (!tableDescription.status) {
            await queryInterface.addColumn(
                'Users',
                'status',
                {
                    type: Sequelize.STRING,
                    allowNull: true,
                    defaultValue: 'active'
                }
            );
        }


        // --------------------------------------------------
        // TUITION CODE
        // --------------------------------------------------

        if (!tableDescription.tuition_code) {
            await queryInterface.addColumn(
                'Users',
                'tuition_code',
                {
                    type: Sequelize.STRING,
                    allowNull: true
                }
            );
        }


        // --------------------------------------------------
        // ACTIVE DEVICE ID
        // --------------------------------------------------

        if (!tableDescription.active_device_id) {
            await queryInterface.addColumn(
                'Users',
                'active_device_id',
                {
                    type: Sequelize.STRING,
                    allowNull: true
                }
            );
        }


        // --------------------------------------------------
        // LAST ACTIVE AT
        // --------------------------------------------------

        if (!tableDescription.last_active_at) {
            await queryInterface.addColumn(
                'Users',
                'last_active_at',
                {
                    type: Sequelize.DATE,
                    allowNull: true
                }
            );
        }
    },


    async down(queryInterface, Sequelize) {

        await queryInterface.removeColumn('Users', 'status');
        await queryInterface.removeColumn('Users', 'tuition_code');
        await queryInterface.removeColumn('Users', 'active_device_id');
        await queryInterface.removeColumn('Users', 'last_active_at');
    }
};
