const {
    getAllKaryawan,
    getKaryawanByPerner,
    filterKaryawanByUnit,
    updateKaryawan,
} = require('../services/employeeService');

const getAllKaryawanController = async (req, res) => {
    try {
        const results = await getAllKaryawan(req, res);
        res.json(results);
    } catch (error) {
        console.error('Error fetching karyawan:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getKaryawanByPernerController = async (req, res) => {
    const { perner } = req.params;
    const nikAtasan = req.user.username; 

    try {
        const karyawan = await getKaryawanByPerner(perner, nikAtasan);
        res.status(200).json(karyawan);
    } catch (error) {
        if (error.message.includes('access denied') || error.message.includes('not found')) {
            res.status(403).json({ error: 'Access Denied: You do not have permission to access this karyawan or the perner is invalid.' });
        } else {
            res.status(404).json({ error: error.message });
        }
    }
};

const filterKaryawanByUnitController = async (req, res) => {
    try {
        const units = req.query.unit ? req.query.unit.split(',') : [];

        if (units.length === 0) {
            return res.status(400).json({ error: 'Unit harus diberikan sebagai parameter.' });
        }

        const response = await filterKaryawanByUnit(units);
        res.status(200).json(response);
    } catch (error) {
        console.error('Error filtering karyawan by unit:', error);
        res.status(500).json({ error: error.message });
    }
};

const updateKaryawanController = async (req, res) => {
    try {
        const { perner } = req.params;
        await updateKaryawan(req, res, perner);
    } catch (error) {
        console.error('Error updating karyawan:', error);
        res.status(500).json({ error: 'Gagal memperbarui data karyawan' });
    }
};

module.exports = {
    getAllKaryawanController,
    getKaryawanByPernerController,
    filterKaryawanByUnitController,
    updateKaryawanController,
};
