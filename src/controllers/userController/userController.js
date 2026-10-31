const { User } = require("../../models");
const bcrypt = require("bcryptjs");

// ======================================================
// CREATE USER / REGISTER
// ======================================================
const createUser = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            role,
            studentClass,
            semester,
            course,
            deviceId,
            adminEnrollment,
            organization_id
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            where: {
                email: normalizedEmail
            }
        });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        /*
         * PUBLIC REGISTRATION
         *
         * A normal registration from LoginView is always treated
         * as a student and remains pending until a Tuition Pass
         * is issued by the teacher/admin.
         *
         * Admin/teacher accounts should be created from the
         * authenticated admin side using adminEnrollment=true.
         */

        const isAdminEnrollment = adminEnrollment === true;

        const userRole = isAdminEnrollment
            ? (role || "student")
            : "student";

        const userStatus = userRole === "student" && !isAdminEnrollment
            ? "pending"
            : "active";

        const user = await User.create({
            name: name.trim(),

            email: normalizedEmail,

            password: hashedPassword,

            role: userRole,

            organization_id:
                Number(organization_id) || 1,

            class:
                studentClass ||
                req.body.class ||
                null,

            semester:
                semester ||
                null,

            course:
                course ||
                null,

            status: userStatus,

            tuition_code: null,

            active_device_id:
                isAdminEnrollment
                    ? (deviceId || null)
                    : null
        });

        const userData = user.toJSON();

        delete userData.password;

        // --------------------------------------------------
        // NORMAL STUDENT REGISTRATION
        // --------------------------------------------------
        if (
            userRole === "student" &&
            !isAdminEnrollment
        ) {
            return res.status(201).json({
                message:
                    "Account created successfully. Wait for your teacher to issue your Tuition Pass before logging in.",

                user: userData
            });
        }

        // --------------------------------------------------
        // ADMIN-SIDE ENROLLMENT
        // --------------------------------------------------
        return res.status(201).json({
            message:
                "User created successfully",

            user: userData
        });

    } catch (error) {

        console.error(
            "Create User Error:",
            error
        );

        return res.status(500).json({
            message:
                "Error creating user",

            error:
                error.message
        });
    }
};


// ======================================================
// LOGIN USER
// ======================================================
const loginUser = async (req, res) => {
    try {

        const {
            email,
            password,
            deviceId
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message:
                    "Email and password are required"
            });
        }

        const normalizedEmail =
            email.trim().toLowerCase();

        const user = await User.findOne({
            where: {
                email: normalizedEmail
            }
        });

        if (!user) {
            return res.status(401).json({
                message:
                    "Invalid email or password"
            });
        }

        // --------------------------------------------------
        // PENDING STUDENT
        // --------------------------------------------------
        if (
            user.role === "student" &&
            user.status === "pending"
        ) {
            return res.status(403).json({
                message:
                    "Your account is awaiting approval. Your tutor must issue a Tuition Pass before you can login."
            });
        }

        // --------------------------------------------------
        // SUSPENDED USER
        // --------------------------------------------------
        if (
            user.status === "suspended"
        ) {
            return res.status(403).json({
                message:
                    "Your tuition access has been suspended by your tutor. Please contact your instructor."
            });
        }

        // --------------------------------------------------
        // INACTIVE USER
        // --------------------------------------------------
        if (
            user.status === "inactive"
        ) {
            return res.status(403).json({
                message:
                    "Your tuition account is currently inactive."
            });
        }

        // --------------------------------------------------
        // PASSWORD CHECK
        // --------------------------------------------------
        const isPasswordValid =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!isPasswordValid) {
            return res.status(401).json({
                message:
                    "Invalid email or password"
            });
        }

        // --------------------------------------------------
        // DEVICE LOGIN
        // --------------------------------------------------
        if (deviceId) {

            user.active_device_id =
                deviceId;

            if (
                Object.prototype.hasOwnProperty.call(
                    user.dataValues,
                    "last_active_at"
                )
            ) {
                user.last_active_at =
                    new Date();
            }

            await user.save();
        }

        const userData =
            user.toJSON();

        delete userData.password;

        return res.status(200).json({
            message:
                "Login successful",

            user:
                userData
        });

    } catch (error) {

        console.error(
            "Login Error:",
            error
        );

        return res.status(500).json({
            message:
                "Error logging in",

            error:
                error.message
        });
    }
};


// ======================================================
// GET ALL USERS
// ======================================================
const getAllUsers = async (req, res) => {
    try {

        const where = {};

        if (req.query.organization_id) {
            where.organization_id =
                Number(req.query.organization_id);
        }

        const users =
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

        return res.status(200).json(users);

    } catch (error) {

        console.error(
            "Get All Users Error:",
            error
        );

        return res.status(500).json({
            message:
                "Error fetching users",

            error:
                error.message
        });
    }
};


// ======================================================
// GET USER BY ID
// ======================================================
const getUserById = async (req, res) => {
    try {

        const user =
            await User.findByPk(
                req.params.id,
                {
                    attributes: {
                        exclude: [
                            "password"
                        ]
                    }
                }
            );

        if (!user) {
            return res.status(404).json({
                message:
                    "User not found"
            });
        }

        return res.status(200).json(user);

    } catch (error) {

        console.error(
            "Get User By ID Error:",
            error
        );

        return res.status(500).json({
            message:
                "Error fetching user",

            error:
                error.message
        });
    }
};


// ======================================================
// UPDATE USER
// ======================================================
const updateUser = async (req, res) => {
    try {

        const user =
            await User.findByPk(
                req.params.id
            );

        if (!user) {
            return res.status(404).json({
                message:
                    "User not found"
            });
        }

        const {
            name,
            email,
            password,
            role,
            studentClass,
            semester,
            course,
            status,
            organization_id
        } = req.body;

        if (name) {
            user.name = name;
        }

        if (email) {
            user.email =
                email.trim().toLowerCase();
        }

        if (role) {
            user.role = role;
        }

        if (
            studentClass ||
            req.body.class
        ) {
            user.class =
                studentClass ||
                req.body.class;
        }

        if (semester) {
            user.semester =
                semester;
        }

        if (course) {
            user.course =
                course;
        }

        if (organization_id) {
            user.organization_id =
                Number(organization_id);
        }

        if (status) {
            user.status =
                status;
        }

        if (password) {
            user.password =
                await bcrypt.hash(
                    password,
                    10
                );
        }

        await user.save();

        const userData = user.toJSON();
        delete userData.password;

        return res.status(200).json({
            message: "User updated successfully",
            user: userData
        });

    } catch (error) {

        console.error(
            "Update User Error:",
            error
        );

        return res.status(500).json({
            message:
                "Error updating user",

            error:
                error.message
        });
    }
};


// ======================================================
// DELETE USER
// ======================================================
const deleteUser = async (req, res) => {
    try {

        const user =
            await User.findByPk(
                req.params.id
            );

        if (!user) {
            return res.status(404).json({
                message:
                    "User not found"
            });
        }

        await user.destroy();

        return res.status(200).json({
            message:
                "User deleted successfully"
        });

    } catch (error) {

        console.error(
            "Delete User Error:",
            error
        );

        return res.status(500).json({
            message:
                "Error deleting user",

            error:
                error.message
        });
    }
};




module.exports = {
    createUser:createUser,
    loginUser:loginUser,
    getAllUsers:getAllUsers,
    getUserById:getUserById,
    updateUser:updateUser,
    deleteUser:deleteUser
};