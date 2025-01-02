import { kyselyDb } from '../db/connection';
import { sql } from 'kysely';
const fs = require('fs');
const path = require('path');

const unitsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../utils/units.json'), 'utf-8'));
 
export const getAllKaryawan = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = 20;
    const offset = (page - 1) * pageSize;
    const nikAtasan = req.user.username; 

    try {
        const checkNikAtasanQuery = kyselyDb
        .selectFrom('karyawan')
        .select('nik_atasan')
        .where('nik_atasan', 'like', `%${nikAtasan}%`)
        .limit(1);

        const hasDataForNikAtasan = await checkNikAtasanQuery.execute();

        let totalRecordsQuery = kyselyDb
            .selectFrom('karyawan')
            .select([sql`count(*)`.as('total_count')]);

        let karyawanListQuery = kyselyDb
            .selectFrom('karyawan')
            .select([
                'perner',
                'nama',
                'take_home_pay',
                'unit',
                'sub_unit',
                'posisi_pekerjaan',
                'sumber_anggaran',
            ])
            .orderBy('perner', 'asc')
            .limit(pageSize)
            .offset(offset);

        if (hasDataForNikAtasan.length > 0) {
            totalRecordsQuery = totalRecordsQuery.where(
                'nik_atasan',
                'like',
                `%${nikAtasan}%`
            );
            karyawanListQuery = karyawanListQuery.where(
                'nik_atasan',
                'like',
                `%${nikAtasan}%`
            );
        }

        const totalRecordsResult = await totalRecordsQuery.executeTakeFirstOrThrow();
        const karyawanList = await karyawanListQuery.execute();

        const totalPages = Math.ceil(totalRecordsResult.total_count / pageSize);

        res.status(200).json({
            currentPage: page,
            totalPages,
            totalRecords: totalRecordsResult.total_count,
            data: karyawanList,
        });
    } catch (error) {
        console.error('Error fetching karyawan:', error);
        res.status(500).json({ error: 'Failed to fetch karyawan data' });
    }
};

export const getKaryawanByPerner = async (perner, nikAtasan) => {
    try {
        const checkNikAtasanQuery = kyselyDb
        .selectFrom('karyawan')
        .select(['nik_atasan'])
        .where('nik_atasan', '=', nikAtasan)
        .limit(1); 
        
        const hasDataForNikAtasan = await checkNikAtasanQuery.execute();

        let karyawanQuery = kyselyDb
            .selectFrom('karyawan')
            .select([
                'perner',
                'status_karyawan',
                'nama',
                'jenis_kelamin',
                'status_pernikahan',
                'jumlah_anak',
                'posisi_pekerjaan',
                'kategori_posisi',
                'unit',
                'sub_unit',
                'kota',
                'nik_atasan',
                'nama_atasan',
                'sumber_anggaran',
                'skema_umk',
                'gaji_pokok',
                'tunjangan_operasional',
                'pph_21',
                'take_home_pay',
                'tunjangan_hari_raya',
                'gaji_kotor',
                'pajak_penghasilan',
                'thp_gross_pph_21',
                'uang_kehadiran',
                'bpjs_ketenagakerjaan',
                'bpjs_kesehatan',
                'perlindungan_asuransi',
                'tunjangan_ekstra',
                'invoice_bulanan',
                'invoice_kontrak',
                'tunjangan_lainnya',
                'bergabung_sejak',
            ])
            .where('perner', '=', perner); 

        if (hasDataForNikAtasan.length > 0) {
            karyawanQuery = karyawanQuery.where(
                'nik_atasan', 
                'like', 
                `%${nikAtasan}%`
            );
        }

        const karyawan = await karyawanQuery.executeTakeFirst();

        if (!karyawan) {
            throw new Error(`Karyawan with perner ${perner} not found or access denied`);
        }

        return karyawan;
    } catch (error) {
        console.error(`Error fetching karyawan with perner ${perner}:`, error);
        throw new Error('Karyawan not found or access denied');
    }
};

export const filterKaryawanByUnit = async (units) => {
    try {
        const validUnits = [
            "Kantor Telkom Regional III",
            "Witel Suramadu",
            "Witel Jatim Timur",
            "Witel Jatim Barat",
            "Witel Bali",
            "Witel Nusa Tenggara",
            "Witel Semarang Jateng Utara",
            "Witel Yogya Jateng Selatan",
            "Witel Solo Jateng Timur"
        ];

        const filteredUnits = units.filter(unit => validUnits.includes(unit));

        if (filteredUnits.length === 0) {
            throw new Error('Tidak ada unit yang valid.');
        }

        const karyawanList = await kyselyDb
            .selectFrom('karyawan')
            .select([
                'perner', 'nama', 'take_home_pay', 'unit', 'sub_unit', 'posisi_pekerjaan', 'sumber_anggaran'
            ])
            .where('unit', 'in', filteredUnits)  
            .execute();  

        const totalKaryawan = karyawanList.length;

        const dataByUnit = filteredUnits.reduce((acc, unit) => {
            acc[unit] = karyawanList.filter(karyawan => karyawan.unit === unit);
            return acc;
        }, {});

        return {
            message: 'Data karyawan berhasil diambil',
            total: totalKaryawan,
            total_per_unit: Object.fromEntries(
                Object.entries(dataByUnit).map(([unit, karyawan]) => [unit, karyawan.length])
            ),
            data: dataByUnit
        };

    } catch (error) {
        throw error;  
    }
};

export const updateKaryawan = async (req, res) => {
    const { perner } = req.params; // URL input
    const {
        nama, jenis_kelamin, status_pernikahan, jumlah_anak, posisi_pekerjaan,
        kategori_posisi, unit, sub_unit, kota, nik_atasan, nama_atasan, 
        sumber_anggaran, skema_umk, gaji_pokok, tunjangan_operasional, 
        pph_21, take_home_pay, tunjangan_hari_raya, gaji_kotor, 
        pajak_penghasilan, thp_gross_pph_21, uang_kehadiran, 
        bpjs_ketenagakerjaan, bpjs_kesehatan, perlindungan_asuransi, 
        tunjangan_ekstra, invoice_bulanan, invoice_kontrak, tunjangan_lainnya, 
        status_karyawan
    } = req.body;

    try {
        const existingKaryawan = await kyselyDb
            .selectFrom('karyawan')
            .select(['perner', 'bergabung_sejak'])
            .where('perner', '=', perner)
            .executeTakeFirst();

        if (!existingKaryawan) {
            return res.status(404).json({ error: `Karyawan dengan perner ${perner} tidak ditemukan` });
        }

        const { bergabung_sejak } = existingKaryawan;
        if (existingKaryawan.bergabung_sejak !== bergabung_sejak) {
            return res.status(400).json({ error: 'Tidak bisa mengubah tanggal bergabung' });
        }

        if (jenis_kelamin && !['Laki-Laki', 'Perempuan'].includes(jenis_kelamin)) {
            throw new Error('Jenis kelamin tidak valid');
        }
        if (status_pernikahan && !['Menikah', 'Belum Menikah'].includes(status_pernikahan)) {
            throw new Error('Status pernikahan tidak valid');
        }
        if (jumlah_anak && (isNaN(jumlah_anak) || jumlah_anak < 0)) {
            throw new Error('Jumlah anak tidak valid');
        }
        if (gaji_pokok && (isNaN(gaji_pokok) || gaji_pokok < 0)) {
            throw new Error('Gaji pokok tidak valid');
        }

        const decimalFields = [
            { name: 'Tunjangan Operasional', value: tunjangan_operasional },
            { name: 'PPH 21', value: pph_21 },
            { name: 'Take Home Pay', value: take_home_pay },
            { name: 'Tunjangan Hari Raya', value: tunjangan_hari_raya },
            { name: 'Gaji Kotor', value: gaji_kotor },
            { name: 'Pajak Penghasilan', value: pajak_penghasilan },
            { name: 'THP Gross PPH 21', value: thp_gross_pph_21 },
            { name: 'Uang Kehadiran', value: uang_kehadiran },
            { name: 'BPJS Ketenagakerjaan', value: bpjs_ketenagakerjaan },
            { name: 'BPJS Kesehatan', value: bpjs_kesehatan },
            { name: 'Perlindungan Asuransi', value: perlindungan_asuransi },
            { name: 'Invoice Bulanan', value: invoice_bulanan },
            { name: 'Invoice Kontrak', value: invoice_kontrak },
            { name: 'Tunjangan Lainnya', value: tunjangan_lainnya }
        ];

        for (const field of decimalFields) {
            if (field.value && (isNaN(field.value) || field.value < 0)) {
                return res.status(400).json({ error: `${field.name} harus berupa angka positif atau 0` });
            }
        }

        if (status_karyawan && !['Aktif', 'Tidak Aktif'].includes(status_karyawan)) {
            return res.status(400).json({ error: 'Status karyawan tidak valid' });
        }

        if (unit) {
            const validUnit = unitsData.find(unitData => unitData.unit_baru === unit);
            if (!validUnit) {
                return res.status(400).json({ error: `Unit ${unit} tidak valid` });
            }

            if (sub_unit) {
                const validSubUnit = validUnit.sub_unit_baru.includes(sub_unit);
                if (!validSubUnit) {
                    return res.status(400).json({ error: `Sub-unit ${sub_unit} tidak valid untuk unit ${unit}` });
                }
            }
        }

        const updateData = {};
        if (nama) updateData.nama = nama;
        if (jenis_kelamin) updateData.jenis_kelamin = jenis_kelamin;
        if (status_pernikahan) updateData.status_pernikahan = status_pernikahan;
        if (jumlah_anak) updateData.jumlah_anak = jumlah_anak;
        if (posisi_pekerjaan) updateData.posisi_pekerjaan = posisi_pekerjaan;
        if (kategori_posisi) updateData.kategori_posisi = kategori_posisi;
        if (unit) updateData.unit = unit;
        if (sub_unit) updateData.sub_unit = sub_unit;
        if (kota) updateData.kota = kota;
        if (nik_atasan) updateData.nik_atasan = nik_atasan;
        if (nama_atasan) updateData.nama_atasan = nama_atasan;
        if (sumber_anggaran) updateData.sumber_anggaran = sumber_anggaran;
        if (skema_umk) updateData.skema_umk = skema_umk;
        if (gaji_pokok) updateData.gaji_pokok = gaji_pokok;
        if (tunjangan_operasional) updateData.tunjangan_operasional = tunjangan_operasional;
        if (pph_21) updateData.pph_21 = pph_21;
        if (take_home_pay) updateData.take_home_pay = take_home_pay;
        if (tunjangan_hari_raya) updateData.tunjangan_hari_raya = tunjangan_hari_raya;
        if (gaji_kotor) updateData.gaji_kotor = gaji_kotor;
        if (pajak_penghasilan) updateData.pajak_penghasilan = pajak_penghasilan;
        if (thp_gross_pph_21) updateData.thp_gross_pph_21 = thp_gross_pph_21;
        if (uang_kehadiran) updateData.uang_kehadiran = uang_kehadiran;
        if (bpjs_ketenagakerjaan) updateData.bpjs_ketenagakerjaan = bpjs_ketenagakerjaan;
        if (bpjs_kesehatan) updateData.bpjs_kesehatan = bpjs_kesehatan;
        if (perlindungan_asuransi) updateData.perlindungan_asuransi = perlindungan_asuransi;
        if (tunjangan_ekstra) updateData.tunjangan_ekstra = tunjangan_ekstra;
        if (invoice_bulanan) updateData.invoice_bulanan = invoice_bulanan;
        if (invoice_kontrak) updateData.invoice_kontrak = invoice_kontrak;
        if (tunjangan_lainnya) updateData.tunjangan_lainnya = tunjangan_lainnya;
        if (status_karyawan) updateData.status_karyawan = status_karyawan;

        await kyselyDb
            .updateTable('karyawan')
            .set(updateData)
            .where('perner', '=', perner)
            .execute();

        res.status(200).json({ message: `Data karyawan dengan perner ${perner} berhasil diperbarui` });
    } catch (error) {
        console.error('Error updating karyawan:', error);
        res.status(500).json({ error: 'Gagal memperbarui data karyawan' });
    }
};


// for mutasi
export const getKaryawanDetails = async (perner) => {
    const result = await kyselyDb
      .selectFrom('karyawan')
      .select([
        'perner', 
        'nama', 
        'unit',
        'sub_unit',
        'kota',
        'nik_atasan',
        'nama_atasan',
        'posisi_pekerjaan'
      ])
      .where('perner', '=', perner) 
      .execute(); 
  
    if (!result || result.length === 0) {
        throw new Error('Karyawan tidak ditemukan');
    }
  
    return result;
};