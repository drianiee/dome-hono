const { getAllUsers, getUserById } = require('../services/userService');

const getAllUsersController = async (req, res) => {
    try {
        const users = await getAllUsers();
        console.log(`Successfully retrieved ${users.length} user(s).`);
        res.json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Error fetching users' });
    }
};

const getUserByIdController = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await getUserById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Error fetching user by ID:', error);
        res.status(500).json({ error: 'Error fetching user data' });
    }
};

module.exports = {
    getAllUsersController,
    getUserByIdController,
};
