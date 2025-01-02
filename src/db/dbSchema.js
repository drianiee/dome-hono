import { pgTable, integer, serial, text, varchar, numeric, uuid, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  name: text('name'),
  username: text('username').unique(),
  password: text('password'),
  roles: text('roles'),
});

export const karyawan = pgTable('karyawan', {  
  perner: serial('perner').primaryKey(),  
  nama: varchar('nama'),  
  take_home_pay: numeric('take_home_pay'),  
  unit: varchar('unit'),  
  sub_unit: varchar('sub_unit'),  
  posisi_pekerjaan: varchar('posisi_pekerjaan'),  
  sumber_anggaran: varchar('sumber_anggaran'),  
}); 

export const mutasi = pgTable('mutasi', {
  id: serial('id').primaryKey(),
  perner: varchar('perner').references(() => karyawan.perner), // Foreign key ke tabel karyawan
  unit_baru: varchar('unit_baru'),
  sub_unit_baru: varchar('sub_unit_baru'),
  kota_baru: varchar('kota_baru'),
  posisi_baru: varchar('posisi_baru'),
  status_mutasi: text('status_mutasi').default('Diproses'), // Status default: Diproses
  created_at: timestamp('created_at').defaultNow(),
});

export const rating = pgTable('rating', {
  id: serial('id').primaryKey(),
  perner: varchar('perner').notNull().references(() => karyawan.perner), // Menggunakan perner sebagai foreign key
  customer_service_orientation: integer('customer_service_orientation'),  // Soal 1
  achievment_orientation: integer('achievment_orientation'),             // Soal 2
  team_work: integer('team_work'),                                       // Soal 3
  product_knowledge: integer('product_knowledge'),                       // Soal 4
  organization_commitments: integer('organization_commitments'),         // Soal 5
  performance: integer('performance'),                                   // Soal 6
  initiative: integer('initiative'),                                     // Soal 7
  total_poin: integer('total_poin'),                                     // Total nilai
  rata_rata_nilai: numeric('rata_rata'),                                         // Rata-rata rating
  kategori_hasil_penilaian: varchar('kategori_hasil_penilaian', { length: 50 }), // Kategori hasil penilaian
});