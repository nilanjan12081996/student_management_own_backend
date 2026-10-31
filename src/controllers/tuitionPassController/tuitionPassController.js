const crypto = require("crypto");
const { User } = require("../../models");


// ======================================================
// GENERATE TUITION CODE
// ======================================================

const generateTuitionCode = () => {
    return (
        "TUITION-" +
        crypto
            .randomBytes(3)
            .toString("hex")
            .toUpperCase()
    );
};


// ======================================================
// CREATE / ISSUE TUITION PASS
// ======================================================

const createTuitionPass = async (req, res) => {
    try {

        const {
            student_email,
            student_id,
            organization_id,
            batch_name,
            expires_at,
            custom_code,
            code,
            is_single_use
        } = req.body;


        // --------------------------------------------------
        // VALIDATE STUDENT
        // --------------------------------------------------

        if (!student_email && !student_id) {
            return res.status(400).json({
                message:
                    "Student email or student ID is required."
            });
        }


        // --------------------------------------------------
        // FIND STUDENT
        // --------------------------------------------------

        let user = null;

        if (student_id) {

            user = await User.findByPk(
                student_id
            );

        } else {

            user = await User.findOne({
                where: {
                    email:
                        student_email
                            .trim()
                            .toLowerCase()
                }
            });

        }


        // --------------------------------------------------
        // STUDENT NOT FOUND
        // --------------------------------------------------

        if (!user) {
            return res.status(404).json({
                message:
                    "Student not found."
            });
        }


        // --------------------------------------------------
        // ONLY STUDENTS
        // --------------------------------------------------

        if (user.role !== "student") {
            return res.status(400).json({
                message:
                    "Tuition Pass can only be issued to a student."
            });
        }


        // --------------------------------------------------
        // ORGANIZATION CHECK
        // --------------------------------------------------

        if (
            organization_id &&
            user.organization_id &&
            Number(user.organization_id) !==
                Number(organization_id)
        ) {

            return res.status(403).json({
                message:
                    "Student does not belong to this organization."
            });
        }


        // --------------------------------------------------
        // ALREADY HAS ACTIVE PASS
        // --------------------------------------------------

        if (
            user.status === "active" &&
            user.tuition_code
        ) {

            return res.status(400).json({
                message:
                    "This student already has an active Tuition Pass."
            });
        }


        // --------------------------------------------------
        // GENERATE / USE CUSTOM CODE
        // --------------------------------------------------

        let tuitionCode =
            custom_code ||
            code ||
            null;


        if (tuitionCode) {

            tuitionCode =
                tuitionCode
                    .trim()
                    .toUpperCase();


            // Automatically add TUITION- prefix
            if (
                !tuitionCode.startsWith(
                    "TUITION-"
                )
            ) {

                tuitionCode =
                    "TUITION-" +
                    tuitionCode;
            }


            // Check duplicate
            const existingCustomCode =
                await User.findOne({
                    where: {
                        tuition_code:
                            tuitionCode
                    }
                });


            if (existingCustomCode) {
                return res.status(400).json({
                    message:
                        "This Tuition Pass code is already in use."
                });
            }

        } else {

            // ------------------------------------------------
            // AUTO GENERATE UNIQUE CODE
            // ------------------------------------------------

            let existingPass = null;

            do {

                tuitionCode =
                    generateTuitionCode();

                existingPass =
                    await User.findOne({
                        where: {
                            tuition_code:
                                tuitionCode
                        }
                    });

            } while (existingPass);
        }


        // --------------------------------------------------
        // ACTIVATE STUDENT
        // --------------------------------------------------

        user.status = "active";

        user.tuition_code =
            tuitionCode;

        if (batch_name) {
            user.class = batch_name;
        }


        // Assign organization if supplied
        if (organization_id) {

            user.organization_id =
                Number(
                    organization_id
                );
        }


        // New pass should not inherit
        // previous device session
        user.active_device_id = null;


        await user.save();


        // --------------------------------------------------
        // USER RESPONSE
        // --------------------------------------------------

        const userData =
            user.toJSON();

        delete userData.password;


        // --------------------------------------------------
        // CREATE PASS RESPONSE OBJECT
        // --------------------------------------------------

        const pass = {

            id:
                user.id,

            student_id:
                user.id,

            student_name:
                user.name,

            student_email:
                user.email,

            organization_id:
                user.organization_id,

            code:
                tuitionCode,

            tuition_code:
                tuitionCode,

            batch_name:
                batch_name ||
                "Tuition Batch",

            is_single_use:
                is_single_use !== false,

            is_redeemed:
                false,

            redeemed_by:
                null,

            redeemed_at:
                null,

            expires_at:
                expires_at ||
                null,

            createdAt:
                new Date().toISOString(),

            status:
                "active"
        };


        // --------------------------------------------------
        // SEND RESPONSE
        // --------------------------------------------------

        return res.status(201).json({

            message:
                "Tuition Pass issued successfully.",

            pass,

            user:
                userData
        });


    } catch (error) {

        console.error(
            "Create Tuition Pass Error:",
            error
        );

        return res.status(500).json({

            message:
                "Error issuing Tuition Pass.",

            error:
                error.message
        });
    }
};


// ======================================================
// GET ALL TUITION PASSES
// ======================================================

const getAllTuitionPasses = async (req, res) => {

    try {

        const where = {
            role: "student"
        };


        // Filter by organization
        if (
            req.query.organization_id
        ) {

            where.organization_id =
                Number(
                    req.query.organization_id
                );
        }


        const students =
            await User.findAll({

                where,

                attributes: {
                    exclude: [
                        "password"
                    ]
                },

                order: [
                    [
                        "createdAt",
                        "DESC"
                    ]
                ]
            });


        // Only students having a tuition code
        const passes =
            students
                .filter(
                    student =>
                        student.tuition_code
                )
                .map(
                    student => ({

                        id:
                            student.id,

                        student_id:
                            student.id,

                        student_name:
                            student.name,

                        student_email:
                            student.email,

                        organization_id:
                            student.organization_id,

                        code:
                            student.tuition_code,

                        tuition_code:
                            student.tuition_code,

                        batch_name:
                            "Tuition Batch",

                        is_single_use:
                            true,

                        is_redeemed:
                            false,

                        redeemed_by:
                            null,

                        redeemed_at:
                            null,

                        expires_at:
                            null,

                        status:
                            student.status

                    })
                );


        return res.status(200).json(
            passes
        );


    } catch (error) {

        console.error(
            "Get Tuition Passes Error:",
            error
        );

        return res.status(500).json({

            message:
                "Error fetching Tuition Passes.",

            error:
                error.message
        });
    }
};


// ======================================================
// DELETE / REVOKE TUITION PASS
// ======================================================

const deleteTuitionPass = async (req, res) => {

    try {

        const {
            id
        } = req.params;


        const user =
            await User.findByPk(id);


        if (!user) {

            return res.status(404).json({

                message:
                    "Student not found."
            });
        }


        if (
            user.role !== "student"
        ) {

            return res.status(400).json({

                message:
                    "Tuition Pass can only be revoked from a student."
            });
        }


        if (
            !user.tuition_code
        ) {

            return res.status(400).json({

                message:
                    "This student does not have a Tuition Pass."
            });
        }


        // --------------------------------------------------
        // REVOKE PASS
        // --------------------------------------------------

        user.tuition_code = null;

        user.status = "pending";

        user.active_device_id = null;


        await user.save();


        return res.status(200).json({

            message:
                "Tuition Pass revoked successfully."
        });


    } catch (error) {

        console.error(
            "Delete Tuition Pass Error:",
            error
        );

        return res.status(500).json({

            message:
                "Error revoking Tuition Pass.",

            error:
                error.message
        });
    }
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    createTuitionPass:
        createTuitionPass,

    getAllTuitionPasses:
        getAllTuitionPasses,

    deleteTuitionPass:
        deleteTuitionPass
};