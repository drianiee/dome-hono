import { kyselyDb } from '../db/connection';

export const getAllKaryawanWithRating = async () => {
    try {
        const karyawan = await kyselyDb
            .selectFrom('karyawan')
            .select([
                'karyawan.perner', 
                'karyawan.nama', 
                'karyawan.unit', 
                'karyawan.sub_unit', 
                'karyawan.posisi_pekerjaan', 
                'rating.skor_rating',
                'rating.kategori_hasil_penilaian',
                'rating.bulan_pemberian',
                'rating.tahun_pemberian'
            ])
            .leftJoin('rating', 'karyawan.perner', 'rating.perner') 
            .where('karyawan.status_karyawan', '=', 'Aktif') 
            .where('karyawan.unit', '=', 'Kantor Telkom Regional III') 
            .orderBy('karyawan.perner', 'asc')
            .execute();

        if (karyawan.length === 0) {
            throw new Error('Tidak ada data karyawan ditemukan dengan status Aktif di Kantor Telkom Regional III.');
        }

        const result = karyawan.map(k => ({
            ...k,
            skor_rating: k.skor_rating === null ? '-' : k.skor_rating
        }));

        return result;
    } catch (error) {
        console.error(error);
        throw new Error(`Error saat mengambil data karyawan: ${error.message}`);
    }
};

export const getKaryawanWithRatingByBulanTahun = async (bulan_pemberian, tahun_pemberian) => {
    try {
        const validBulan = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];
        if (bulan_pemberian && !validBulan.includes(bulan_pemberian)) {
            throw new Error('Bulan pemberian rating tidak valid. Pilih bulan yang benar (Januari, Februari, ..., Desember).');
        }

        let tahun = null;
        if (tahun_pemberian) {
            tahun = parseInt(tahun_pemberian, 10);
            if (isNaN(tahun) || tahun < 2024) {
                throw new Error('Tahun pemberian rating tidak valid. Masukkan tahun 2024 atau tahun setelahnya.');
            }
        }

        let query = kyselyDb
            .selectFrom('karyawan')
            .select([
                'karyawan.perner', 
                'karyawan.nama', 
                'karyawan.unit', 
                'karyawan.sub_unit', 
                'karyawan.posisi_pekerjaan', 
                'rating.skor_rating'
            ])
            .leftJoin('rating', 'karyawan.perner', 'rating.perner')
            .where('karyawan.status_karyawan', '=', 'Aktif')
            .where('karyawan.unit', '=', 'Kantor Telkom Regional III');
        
        if (bulan_pemberian) {
            query = query.where('rating.bulan_pemberian', '=', bulan_pemberian);
        }

        if (tahun) {
            query = query.where('rating.tahun_pemberian', '=', tahun);
        }

        query = query.where('rating.skor_rating', 'is not', null);

        const karyawan = await query.execute();
        
        if (karyawan.length === 0) {
            const periodText = tahun_pemberian && bulan_pemberian 
                ? `di bulan ${bulan_pemberian} tahun ${tahun_pemberian}`
                : tahun_pemberian 
                    ? `di tahun ${tahun_pemberian}`
                    : bulan_pemberian 
                        ? `di bulan ${bulan_pemberian}`
                        : '';
            return {
                status: 'success',
                message: `Tidak ada data rating karyawan ${periodText}`,
                data: []
            };
        }

        return {
            status: 'success',
            message: 'Data rating karyawan berhasil ditemukan',
            data: karyawan
        };

    } catch (error) {
        console.error(error);
        throw new Error(error.message);
    }
};

const calculateTotalPoints = (ratings) => {
    const { customer_service_orientation, 
        achievment_orientation, 
        team_work, 
        product_knowledge, 
        organization_commitments, 
        performance, 
        initiative } = ratings;

    const aspek = [
        customer_service_orientation, 
        achievment_orientation, 
        team_work, 
        product_knowledge, 
        organization_commitments, 
        performance, 
        initiative
    ];

    const points = [
        customer_service_orientation === 5 ? 20 : customer_service_orientation * 4, 
        achievment_orientation === 5 ? 10 : achievment_orientation * 2,
        team_work === 5 ? 10 : team_work * 2,
        product_knowledge === 5 ? 20 : product_knowledge * 4,
        organization_commitments === 5 ? 10 : organization_commitments * 2,
        performance === 5 ? 20 : performance * 4,
        initiative === 5 ? 10 : initiative * 2
    ];

    const skorRating = points.reduce((sum, point) => sum + point, 0);
    
    const totalAspek = aspek.filter(aspek => aspek !== undefined).length; 
    const rataRataNilai = aspek.reduce((sum, rating) => sum + rating, 0) / totalAspek;

    let kategoriHasilPenilaian = '';
    if (skorRating >= 81 && skorRating <= 100) {
        kategoriHasilPenilaian = 'DISARANKAN / BAIK';
    } else if (skorRating >= 61 && skorRating <= 80) {
        kategoriHasilPenilaian = 'DIPERTIMBANGKAN / CUKUP';
    } else if (skorRating >= 20 && skorRating <= 60) {
        kategoriHasilPenilaian = 'TIDAK DISARANKAN / KURANG';
    }

    return { skorRating, rataRataNilai: parseFloat(rataRataNilai.toFixed(2)), kategoriHasilPenilaian };
};

export const createRating = async (perner, ratings, bulan_pemberian, tahun_pemberian) => {
    try {
        const validBulan = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];
        
        if (!validBulan.includes(bulan_pemberian)) {
            throw new Error('Bulan pemberian rating tidak valid. Pilih bulan yang benar (Januari, Februari, ..., Desember).');
        }

        if (!Number.isInteger(tahun_pemberian) || tahun_pemberian < 2024 || tahun_pemberian > new Date().getFullYear()) {
            throw new Error('Tahun pemberian rating tidak valid. Masukkan tahun 2024 atau tahun setelahnya.');
        }

        const existingRating = await kyselyDb
        .selectFrom('rating')
        .select(['perner'])
        .where('perner', '=', perner)
        .where('bulan_pemberian', '=', bulan_pemberian)
        .where('tahun_pemberian', '=', tahun_pemberian)
        .execute();

        if (existingRating.length > 0) {
            throw new Error(`Rating sudah diberikan untuk perner ${perner} pada bulan ${bulan_pemberian} tahun ${tahun_pemberian}.`);
        }

        const karyawan = await kyselyDb
            .selectFrom('karyawan')
            .select(['perner', 'unit', 'status_karyawan',  'nama'])
            .where('perner', '=', perner)
            .execute();

        if (karyawan.length === 0) {
            throw new Error('Karyawan tidak ditemukan.');
        }

        const { unit, status_karyawan, nama } = karyawan[0];

        if (unit !== 'Kantor Telkom Regional III' || status_karyawan !== 'Aktif') {
            throw new Error('Rating hanya dapat diberikan kepada karyawan di Kantor Telkom Regional III dengan status Aktif.');
        }

        const { skorRating, rataRataNilai, kategoriHasilPenilaian } = calculateTotalPoints(ratings);

        await kyselyDb
            .insertInto('rating')
            .values({
                perner,
                customer_service_orientation: ratings.customer_service_orientation,
                achievment_orientation: ratings.achievment_orientation,
                team_work: ratings.team_work,
                product_knowledge: ratings.product_knowledge,
                organization_commitments: ratings.organization_commitments,
                performance: ratings.performance,
                initiative: ratings.initiative,
                skor_rating: skorRating,
                rata_rata_nilai: rataRataNilai,
                kategori_hasil_penilaian: kategoriHasilPenilaian,
                bulan_pemberian,
                tahun_pemberian,
            })
            .execute();
        
            return {
                message: 'Rating successfully added',
                perner,
                nama_karyawan: nama,
                skorRating,
                rataRataNilai,
                kategoriHasilPenilaian,
                bulan_pemberian,
                tahun_pemberian,
            };
    } catch (error) {
        console.error(error);
        throw new Error(`Error creating rating: ${error.message}`);
    }
};