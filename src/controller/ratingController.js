const { 
    getAllKaryawanWithRating, 
    getKaryawanWithRatingByBulanTahun, 
    createRating 
} = require('../services/ratingService'); // Import service functions

// Get all karyawan with rating
const getAllKaryawanWithRatingController = async (req, res) => {
    try {
        const karyawan = await getAllKaryawanWithRating();
        res.json(karyawan);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Filter karyawan by bulan and tahun pemberian
const getKaryawanWithRatingByBulanTahunController = async (req, res) => {
    try {
        const { bulan_pemberian, tahun_pemberian } = req.query;

        if (!bulan_pemberian && !tahun_pemberian) {
            return res.status(400).send('Bulan atau Tahun Pemberian harus diberikan.');
        }
        const karyawan = await getKaryawanWithRatingByBulanTahun(bulan_pemberian, tahun_pemberian);
        res.json(karyawan);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Give rating to karyawan
const createRatingController = async (req, res) => {
    const { perner } = req.params;
    const {
        customer_service_orientation,
        achievment_orientation,
        team_work,
        product_knowledge,
        organization_commitments,
        performance,
        initiative,
        bulan_pemberian,
        tahun_pemberian,
    } = req.body;

    if (
        customer_service_orientation === undefined ||
        achievment_orientation === undefined ||
        team_work === undefined ||
        product_knowledge === undefined ||
        organization_commitments === undefined ||
        performance === undefined ||
        initiative === undefined ||
        !bulan_pemberian ||
        !tahun_pemberian
    ) {
        return res.status(400).json({ error: 'All rating fields are required' });
    }

    const ratings = [
        customer_service_orientation,
        achievment_orientation,
        team_work,
        product_knowledge,
        organization_commitments,
        performance,
        initiative
    ];

    if (ratings.some(rating => rating < 1 || rating > 5)) {
        return res.status(400).json({ error: 'Ratings must be between 1 and 5' });
    }

    try {
        const response = await createRating(perner, req.body, bulan_pemberian, tahun_pemberian);
        res.status(201).json({
            message: response.message,
            perner: response.perner,
            nama_karyawan: response.nama_karyawan,
            skorRating: response.skorRating,
            rataRataNilai: response.rataRataNilai,
            kategoriHasilPenilaian: response.kategoriHasilPenilaian,
            bulan_pemberian: response.bulan_pemberian,
            tahun_pemberian: response.tahun_pemberian,
        });
    } catch (error) {
        if (error.message.includes('Rating sudah diberikan')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllKaryawanWithRatingController,
    getKaryawanWithRatingByBulanTahunController,
    createRatingController
};
