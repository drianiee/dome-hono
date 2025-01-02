const {
    getKaryawanDetails,
    createMutasi,
    getMutasiDetails,
    updateMutasiStatus,
    getAllMutasi,
    updateMutasi,
    deleteMutasi,
    isDuplicateMutasi,
    validateUnitAndSubUnit,
    findKaryawanByPerner
} = require('../services/mutationService'); // Import service functions

// Get karyawan details (mutasi left-side data)
const getKaryawanDetailsController = async (req, res) => {
    try {
        const { perner } = req.params;
        const karyawanDetails = await getKaryawanDetails(perner);

        if (!karyawanDetails) {
            return res.status(404).json({ error: 'Karyawan not found' });
        }

        res.json(karyawanDetails);
    } catch (error) {
        console.error('Error fetching karyawan details:', error);
        return res.status(500).json({ error: error.message });
    }
};

// Create mutasi
const createMutasiController = async (req, res) => {
    try {
        const { perner, unit_baru, sub_unit_baru, posisi_baru } = req.body;

        const isValid = validateUnitAndSubUnit(unit_baru, sub_unit_baru);
        if (!isValid) {
            return res.status(400).json({ message: 'Unit atau Sub-Unit tidak valid' });
        }

        const isDuplicate = await isDuplicateMutasi(perner, unit_baru, sub_unit_baru);
        if (isDuplicate) {
            return res.status(409).json({ message: 'Mutasi dengan unit dan sub-unit yang sama sudah ada' });
        }

        const karyawan = await findKaryawanByPerner(perner);
        if (!karyawan) {
            return res.status(404).json({ message: 'Karyawan tidak ditemukan' });
        }

        await createMutasi({ perner, unit_baru, sub_unit_baru, posisi_baru });

        res.status(201).json({ message: 'Pengajuan mutasi berhasil diajukan.' });
    } catch (error) {
        console.error('Error processing mutasi:', error);
        res.status(500).json({ error: 'Failed to process mutasi' });
    }
};

// Get mutasi details
const getMutasiDetailsController = async (req, res) => {
    try {
        const { perner } = req.params;
        const mutasiDetails = await getMutasiDetails(perner);

        res.json(mutasiDetails);
    } catch (error) {
        console.error('Error fetching mutasi details:', error);
        return res.status(500).json({ error: error.message });
    }
};

// Approve mutasi
const approveMutasiController = async (req, res) => {
    try {
        const { perner } = req.params;

        const result = await updateMutasiStatus(perner, 'Disetujui', null);

        res.json({ message: 'Mutasi disetujui', status: result });
    } catch (error) {
        console.error('Error updating mutasi status to approved:', error);
        res.status(500).json({ error: 'Error updating mutasi status' });
    }
};

// Reject mutasi
const rejectMutasiController = async (req, res) => {
    try {
        const { perner } = req.params;
        const { alasan_penolakan } = req.body;

        if (!alasan_penolakan) {
            return res.status(400).json({ message: 'Alasan penolakan diperlukan' });
        }

        // Update status mutasi menjadi "Ditolak" dengan alasan_penolakan
        const result = await updateMutasiStatus(perner, 'Ditolak', alasan_penolakan);

        res.json({ message: 'Mutasi ditolak', status: result });
    } catch (error) {
        console.error('Error updating mutasi status to rejected:', error);
        res.status(500).json({ error: 'Error updating mutasi status' });
    }
};

// Get all mutasi records
const getAllMutasiController = async (req, res) => {
    try {
        const mutasi = await getAllMutasi();
        res.json(mutasi);
    } catch (error) {
        console.error('Error fetching mutasi:', error);
        res.status(500).json({ error: 'Failed to fetch mutasi' });
    }
};

// Update mutasi
const updateMutasiController = async (req, res) => {
    try {
        const { perner } = req.params;
        await updateMutasi(req, res, perner);
    } catch (error) {
        console.error('Error updating mutasi:', error);
        res.status(500).json({ error: 'Gagal memperbarui mutasi' });
    }
};

// Delete mutasi
const deleteMutasiController = async (req, res) => {
    try {
        const { perner } = req.params;

        const response = await deleteMutasi(perner);

        res.status(200).json(response);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    getKaryawanDetailsController,
    createMutasiController,
    getMutasiDetailsController,
    approveMutasiController,
    rejectMutasiController,
    getAllMutasiController,
    updateMutasiController,
    deleteMutasiController
};
