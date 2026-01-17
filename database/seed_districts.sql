-- =====================================================
-- BYD KDS - İlçe Verileri (30 Büyük Şehir)
-- =====================================================

USE byd_kds;

-- İstanbul İlçeleri
INSERT INTO districts (city_id, name, latitude, longitude, population, is_central) VALUES
((SELECT id FROM cities WHERE plate_code = '34'), 'Kadıköy', 40.9927, 29.0277, 484957, TRUE),
((SELECT id FROM cities WHERE plate_code = '34'), 'Beşiktaş', 41.0422, 29.0083, 181074, TRUE),
((SELECT id FROM cities WHERE plate_code = '34'), 'Şişli', 41.0602, 28.9877, 274289, TRUE),
((SELECT id FROM cities WHERE plate_code = '34'), 'Üsküdar', 41.0234, 29.0152, 527489, TRUE),
((SELECT id FROM cities WHERE plate_code = '34'), 'Bakırköy', 40.9819, 28.8772, 223248, FALSE),
((SELECT id FROM cities WHERE plate_code = '34'), 'Ataşehir', 40.9923, 29.1244, 417064, FALSE),
((SELECT id FROM cities WHERE plate_code = '34'), 'Maltepe', 40.9344, 29.1300, 518208, FALSE),
((SELECT id FROM cities WHERE plate_code = '34'), 'Kartal', 40.8891, 29.1858, 475752, FALSE),
((SELECT id FROM cities WHERE plate_code = '34'), 'Pendik', 40.8756, 29.2339, 732068, FALSE),
((SELECT id FROM cities WHERE plate_code = '34'), 'Beylikdüzü', 41.0021, 28.6406, 362156, FALSE);

-- Ankara İlçeleri
INSERT INTO districts (city_id, name, latitude, longitude, population, is_central) VALUES
((SELECT id FROM cities WHERE plate_code = '06'), 'Çankaya', 39.9208, 32.8541, 944609, TRUE),
((SELECT id FROM cities WHERE plate_code = '06'), 'Keçiören', 39.9667, 32.8667, 939097, FALSE),
((SELECT id FROM cities WHERE plate_code = '06'), 'Yenimahalle', 39.9500, 32.8000, 687453, FALSE),
((SELECT id FROM cities WHERE plate_code = '06'), 'Mamak', 39.9333, 32.9167, 661579, FALSE),
((SELECT id FROM cities WHERE plate_code = '06'), 'Etimesgut', 39.9500, 32.6667, 607935, FALSE),
((SELECT id FROM cities WHERE plate_code = '06'), 'Sincan', 39.9833, 32.5667, 535293, FALSE),
((SELECT id FROM cities WHERE plate_code = '06'), 'Altındağ', 39.9500, 32.8667, 389510, TRUE),
((SELECT id FROM cities WHERE plate_code = '06'), 'Pursaklar', 40.0333, 32.9000, 168654, FALSE);

-- İzmir İlçeleri
INSERT INTO districts (city_id, name, latitude, longitude, population, is_central) VALUES
((SELECT id FROM cities WHERE plate_code = '35'), 'Konak', 38.4192, 27.1287, 347076, TRUE),
((SELECT id FROM cities WHERE plate_code = '35'), 'Karşıyaka', 38.4561, 27.1084, 344453, TRUE),
((SELECT id FROM cities WHERE plate_code = '35'), 'Bornova', 38.4697, 27.2159, 452436, FALSE),
((SELECT id FROM cities WHERE plate_code = '35'), 'Buca', 38.3867, 27.1753, 519085, FALSE),
((SELECT id FROM cities WHERE plate_code = '35'), 'Bayraklı', 38.4614, 27.1625, 314523, FALSE),
((SELECT id FROM cities WHERE plate_code = '35'), 'Çiğli', 38.5000, 27.0833, 215234, FALSE),
((SELECT id FROM cities WHERE plate_code = '35'), 'Gaziemir', 38.3167, 27.1333, 141845, FALSE),
((SELECT id FROM cities WHERE plate_code = '35'), 'Karabağlar', 38.3667, 27.1333, 480856, FALSE);

-- Bursa İlçeleri
INSERT INTO districts (city_id, name, latitude, longitude, population, is_central) VALUES
((SELECT id FROM cities WHERE plate_code = '16'), 'Osmangazi', 40.1956, 29.0601, 920543, TRUE),
((SELECT id FROM cities WHERE plate_code = '16'), 'Nilüfer', 40.2167, 28.9833, 508234, FALSE),
((SELECT id FROM cities WHERE plate_code = '16'), 'Yıldırım', 40.1833, 29.0833, 665432, TRUE),
((SELECT id FROM cities WHERE plate_code = '16'), 'Gemlik', 40.4333, 29.1667, 123456, FALSE),
((SELECT id FROM cities WHERE plate_code = '16'), 'İnegöl', 40.0833, 29.5000, 235678, FALSE);

-- Antalya İlçeleri
INSERT INTO districts (city_id, name, latitude, longitude, population, is_central) VALUES
((SELECT id FROM cities WHERE plate_code = '07'), 'Muratpaşa', 36.8969, 30.7133, 503832, TRUE),
((SELECT id FROM cities WHERE plate_code = '07'), 'Kepez', 36.9500, 30.7167, 575342, FALSE),
((SELECT id FROM cities WHERE plate_code = '07'), 'Konyaaltı', 36.8833, 30.6333, 195234, FALSE),
((SELECT id FROM cities WHERE plate_code = '07'), 'Alanya', 36.5431, 31.9994, 333456, FALSE),
((SELECT id FROM cities WHERE plate_code = '07'), 'Manavgat', 36.7833, 31.4333, 245678, FALSE),
((SELECT id FROM cities WHERE plate_code = '07'), 'Serik', 36.9167, 31.1000, 145234, FALSE);

-- Adana İlçeleri
INSERT INTO districts (city_id, name, latitude, longitude, population, is_central) VALUES
((SELECT id FROM cities WHERE plate_code = '01'), 'Seyhan', 37.0000, 35.3213, 765432, TRUE),
((SELECT id FROM cities WHERE plate_code = '01'), 'Yüreğir', 37.0167, 35.3667, 456789, FALSE),
((SELECT id FROM cities WHERE plate_code = '01'), 'Çukurova', 36.9500, 35.3000, 387654, FALSE),
((SELECT id FROM cities WHERE plate_code = '01'), 'Sarıçam', 37.0500, 35.4167, 189234, FALSE),
((SELECT id FROM cities WHERE plate_code = '01'), 'Ceyhan', 37.0333, 35.8167, 167543, FALSE);

-- Konya İlçeleri
INSERT INTO districts (city_id, name, latitude, longitude, population, is_central) VALUES
((SELECT id FROM cities WHERE plate_code = '42'), 'Selçuklu', 37.9167, 32.4833, 665432, TRUE),
((SELECT id FROM cities WHERE plate_code = '42'), 'Meram', 37.8500, 32.4500, 345678, TRUE),
((SELECT id FROM cities WHERE plate_code = '42'), 'Karatay', 37.8667, 32.5167, 287654, TRUE),
((SELECT id FROM cities WHERE plate_code = '42'), 'Ereğli', 37.5167, 34.0500, 156789, FALSE);

-- Gaziantep İlçeleri
INSERT INTO districts (city_id, name, latitude, longitude, population, is_central) VALUES
((SELECT id FROM cities WHERE plate_code = '27'), 'Şahinbey', 37.0663, 37.3649, 923456, TRUE),
((SELECT id FROM cities WHERE plate_code = '27'), 'Şehitkamil', 37.0855, 37.3685, 765432, TRUE),
((SELECT id FROM cities WHERE plate_code = '27'), 'Nizip', 37.0167, 37.8000, 145678, FALSE),
((SELECT id FROM cities WHERE plate_code = '27'), 'İslahiye', 37.0333, 36.6333, 78543, FALSE);

-- Diyarbakır İlçeleri
INSERT INTO districts (city_id, name, latitude, longitude, population, is_central) VALUES
((SELECT id FROM cities WHERE plate_code = '21'), 'Bağlar', 37.9167, 40.2167, 398765, TRUE),
((SELECT id FROM cities WHERE plate_code = '21'), 'Kayapınar', 37.9333, 40.1500, 367890, TRUE),
((SELECT id FROM cities WHERE plate_code = '21'), 'Yenişehir', 37.9000, 40.2333, 289654, TRUE),
((SELECT id FROM cities WHERE plate_code = '21'), 'Sur', 37.9144, 40.2306, 98765, TRUE);

-- Mersin İlçeleri
INSERT INTO districts (city_id, name, latitude, longitude, population, is_central) VALUES
((SELECT id FROM cities WHERE plate_code = '33'), 'Yenişehir', 36.8167, 34.6333, 267890, TRUE),
((SELECT id FROM cities WHERE plate_code = '33'), 'Mezitli', 36.7667, 34.5667, 212345, FALSE),
((SELECT id FROM cities WHERE plate_code = '33'), 'Akdeniz', 36.8000, 34.6333, 198765, TRUE),
((SELECT id FROM cities WHERE plate_code = '33'), 'Toroslar', 36.8500, 34.6167, 312456, FALSE),
((SELECT id FROM cities WHERE plate_code = '33'), 'Tarsus', 36.9167, 34.8833, 345678, FALSE);

-- Hatay İlçeleri
INSERT INTO districts (city_id, name, latitude, longitude, population, is_central) VALUES
((SELECT id FROM cities WHERE plate_code = '31'), 'Antakya', 36.2023, 36.1603, 389654, TRUE),
((SELECT id FROM cities WHERE plate_code = '31'), 'İskenderun', 36.5833, 36.1667, 245678, FALSE),
((SELECT id FROM cities WHERE plate_code = '31'), 'Defne', 36.2167, 36.1500, 156789, FALSE),
((SELECT id FROM cities WHERE plate_code = '31'), 'Samandağ', 36.0833, 35.9667, 134567, FALSE);

-- Kocaeli İlçeleri
INSERT INTO districts (city_id, name, latitude, longitude, population, is_central) VALUES
((SELECT id FROM cities WHERE plate_code = '41'), 'İzmit', 40.7656, 29.9408, 367890, TRUE),
((SELECT id FROM cities WHERE plate_code = '41'), 'Gebze', 40.8000, 29.4333, 378654, FALSE),
((SELECT id FROM cities WHERE plate_code = '41'), 'Darıca', 40.7667, 29.3833, 212345, FALSE),
((SELECT id FROM cities WHERE plate_code = '41'), 'Körfez', 40.7333, 29.7500, 178654, FALSE),
((SELECT id FROM cities WHERE plate_code = '41'), 'Derince', 40.7500, 29.8167, 145678, FALSE);

-- Kayseri İlçeleri  
INSERT INTO districts (city_id, name, latitude, longitude, population, is_central) VALUES
((SELECT id FROM cities WHERE plate_code = '38'), 'Melikgazi', 38.7312, 35.4787, 567890, TRUE),
((SELECT id FROM cities WHERE plate_code = '38'), 'Kocasinan', 38.7500, 35.4667, 412345, TRUE),
((SELECT id FROM cities WHERE plate_code = '38'), 'Talas', 38.6833, 35.5500, 167890, FALSE),
((SELECT id FROM cities WHERE plate_code = '38'), 'Develi', 38.3833, 35.4833, 67543, FALSE);

-- Eskişehir İlçeleri
INSERT INTO districts (city_id, name, latitude, longitude, population, is_central) VALUES
((SELECT id FROM cities WHERE plate_code = '26'), 'Odunpazarı', 39.7767, 30.5206, 412345, TRUE),
((SELECT id FROM cities WHERE plate_code = '26'), 'Tepebaşı', 39.7833, 30.5000, 389654, TRUE),
((SELECT id FROM cities WHERE plate_code = '26'), 'Sivrihisar', 39.4500, 31.5333, 23456, FALSE);

-- Sakarya İlçeleri
INSERT INTO districts (city_id, name, latitude, longitude, population, is_central) VALUES
((SELECT id FROM cities WHERE plate_code = '54'), 'Adapazarı', 40.7940, 30.4020, 289654, TRUE),
((SELECT id FROM cities WHERE plate_code = '54'), 'Serdivan', 40.7500, 30.3667, 156789, FALSE),
((SELECT id FROM cities WHERE plate_code = '54'), 'Erenler', 40.7667, 30.4167, 134567, FALSE),
((SELECT id FROM cities WHERE plate_code = '54'), 'Arifiye', 40.7167, 30.3500, 67890, FALSE);

-- Samsun İlçeleri
INSERT INTO districts (city_id, name, latitude, longitude, population, is_central) VALUES
((SELECT id FROM cities WHERE plate_code = '55'), 'İlkadım', 41.2867, 36.3300, 345678, TRUE),
((SELECT id FROM cities WHERE plate_code = '55'), 'Atakum', 41.3333, 36.2667, 289654, FALSE),
((SELECT id FROM cities WHERE plate_code = '55'), 'Canik', 41.2667, 36.3500, 112345, FALSE),
((SELECT id FROM cities WHERE plate_code = '55'), 'Bafra', 41.5667, 35.9000, 145678, FALSE);

-- Şanlıurfa İlçeleri
INSERT INTO districts (city_id, name, latitude, longitude, population, is_central) VALUES
((SELECT id FROM cities WHERE plate_code = '63'), 'Eyyübiye', 37.1674, 38.7955, 412345, TRUE),
((SELECT id FROM cities WHERE plate_code = '63'), 'Haliliye', 37.1500, 38.7833, 389654, TRUE),
((SELECT id FROM cities WHERE plate_code = '63'), 'Karaköprü', 37.2000, 38.7500, 267890, FALSE),
((SELECT id FROM cities WHERE plate_code = '63'), 'Suruç', 36.9833, 38.4333, 123456, FALSE);

-- Malatya İlçeleri
INSERT INTO districts (city_id, name, latitude, longitude, population, is_central) VALUES
((SELECT id FROM cities WHERE plate_code = '44'), 'Battalgazi', 38.3833, 38.3333, 334567, TRUE),
((SELECT id FROM cities WHERE plate_code = '44'), 'Yeşilyurt', 38.3167, 38.2500, 298765, TRUE),
((SELECT id FROM cities WHERE plate_code = '44'), 'Darende', 38.5500, 37.5000, 34567, FALSE);

-- Erzurum İlçeleri
INSERT INTO districts (city_id, name, latitude, longitude, population, is_central) VALUES
((SELECT id FROM cities WHERE plate_code = '25'), 'Yakutiye', 39.9000, 41.2700, 234567, TRUE),
((SELECT id FROM cities WHERE plate_code = '25'), 'Palandöken', 39.8833, 41.2333, 189654, TRUE),
((SELECT id FROM cities WHERE plate_code = '25'), 'Aziziye', 39.9167, 41.3167, 134567, TRUE),
((SELECT id FROM cities WHERE plate_code = '25'), 'Horasan', 40.0333, 42.1667, 45678, FALSE);

-- Balıkesir İlçeleri
INSERT INTO districts (city_id, name, latitude, longitude, population, is_central) VALUES
((SELECT id FROM cities WHERE plate_code = '10'), 'Altıeylül', 39.6484, 27.8826, 189654, TRUE),
((SELECT id FROM cities WHERE plate_code = '10'), 'Karesi', 39.6500, 27.8667, 167890, TRUE),
((SELECT id FROM cities WHERE plate_code = '10'), 'Bandırma', 40.3500, 27.9667, 156789, FALSE),
((SELECT id FROM cities WHERE plate_code = '10'), 'Edremit', 39.5833, 27.0167, 134567, FALSE);

-- Ordu İlçeleri
INSERT INTO districts (city_id, name, latitude, longitude, population, is_central) VALUES
((SELECT id FROM cities WHERE plate_code = '52'), 'Altınordu', 40.9862, 37.8797, 212345, TRUE),
((SELECT id FROM cities WHERE plate_code = '52'), 'Ünye', 41.1333, 37.2833, 123456, FALSE),
((SELECT id FROM cities WHERE plate_code = '52'), 'Fatsa', 41.0333, 37.5000, 98765, FALSE);

-- Trabzon İlçeleri
INSERT INTO districts (city_id, name, latitude, longitude, population, is_central) VALUES
((SELECT id FROM cities WHERE plate_code = '61'), 'Ortahisar', 41.0027, 39.7168, 334567, TRUE),
((SELECT id FROM cities WHERE plate_code = '61'), 'Akçaabat', 41.0167, 39.5500, 134567, FALSE),
((SELECT id FROM cities WHERE plate_code = '61'), 'Yomra', 40.9500, 39.8667, 67890, FALSE),
((SELECT id FROM cities WHERE plate_code = '61'), 'Araklı', 40.9333, 40.0500, 45678, FALSE);

-- Denizli İlçeleri
INSERT INTO districts (city_id, name, latitude, longitude, population, is_central) VALUES
((SELECT id FROM cities WHERE plate_code = '20'), 'Merkezefendi', 37.7765, 29.0864, 312345, TRUE),
((SELECT id FROM cities WHERE plate_code = '20'), 'Pamukkale', 37.9167, 29.1167, 356789, FALSE),
((SELECT id FROM cities WHERE plate_code = '20'), 'Çivril', 38.3000, 29.7333, 67890, FALSE);

-- Manisa İlçeleri
INSERT INTO districts (city_id, name, latitude, longitude, population, is_central) VALUES
((SELECT id FROM cities WHERE plate_code = '45'), 'Şehzadeler', 38.6191, 27.4289, 178654, TRUE),
((SELECT id FROM cities WHERE plate_code = '45'), 'Yunusemre', 38.6000, 27.4000, 256789, TRUE),
((SELECT id FROM cities WHERE plate_code = '45'), 'Akhisar', 38.9167, 27.8333, 178654, FALSE),
((SELECT id FROM cities WHERE plate_code = '45'), 'Turgutlu', 38.5000, 27.7000, 167890, FALSE);

-- Kahramanmaraş İlçeleri
INSERT INTO districts (city_id, name, latitude, longitude, population, is_central) VALUES
((SELECT id FROM cities WHERE plate_code = '46'), 'Onikişubat', 37.5858, 36.9371, 412345, TRUE),
((SELECT id FROM cities WHERE plate_code = '46'), 'Dulkadiroğlu', 37.5667, 36.9167, 267890, TRUE),
((SELECT id FROM cities WHERE plate_code = '46'), 'Elbistan', 38.2000, 37.2000, 145678, FALSE);

-- Van İlçeleri
INSERT INTO districts (city_id, name, latitude, longitude, population, is_central) VALUES
((SELECT id FROM cities WHERE plate_code = '65'), 'İpekyolu', 38.4891, 43.4089, 312345, TRUE),
((SELECT id FROM cities WHERE plate_code = '65'), 'Tuşba', 38.5167, 43.4333, 234567, TRUE),
((SELECT id FROM cities WHERE plate_code = '65'), 'Edremit', 38.4333, 43.2667, 134567, FALSE),
((SELECT id FROM cities WHERE plate_code = '65'), 'Erciş', 39.0167, 43.3667, 178654, FALSE);

-- Adıyaman İlçeleri
INSERT INTO districts (city_id, name, latitude, longitude, population, is_central) VALUES
((SELECT id FROM cities WHERE plate_code = '02'), 'Merkez', 37.7648, 38.2786, 289654, TRUE),
((SELECT id FROM cities WHERE plate_code = '02'), 'Kahta', 37.7833, 38.6167, 123456, FALSE),
((SELECT id FROM cities WHERE plate_code = '02'), 'Besni', 37.6833, 37.8500, 78654, FALSE);

-- Edirne İlçeleri
INSERT INTO districts (city_id, name, latitude, longitude, population, is_central) VALUES
((SELECT id FROM cities WHERE plate_code = '22'), 'Merkez', 41.6771, 26.5557, 189654, TRUE),
((SELECT id FROM cities WHERE plate_code = '22'), 'Keşan', 40.8500, 26.6333, 89654, FALSE),
((SELECT id FROM cities WHERE plate_code = '22'), 'Uzunköprü', 41.2667, 26.6833, 67890, FALSE);

-- Muğla İlçeleri
INSERT INTO districts (city_id, name, latitude, longitude, population, is_central) VALUES
((SELECT id FROM cities WHERE plate_code = '48'), 'Menteşe', 37.2153, 28.3636, 112345, TRUE),
((SELECT id FROM cities WHERE plate_code = '48'), 'Bodrum', 37.0333, 27.4333, 189654, FALSE),
((SELECT id FROM cities WHERE plate_code = '48'), 'Fethiye', 36.6500, 29.1167, 167890, FALSE),
((SELECT id FROM cities WHERE plate_code = '48'), 'Marmaris', 36.8500, 28.2667, 98765, FALSE),
((SELECT id FROM cities WHERE plate_code = '48'), 'Milas', 37.3167, 27.7833, 145678, FALSE);

-- Tekirdağ İlçeleri
INSERT INTO districts (city_id, name, latitude, longitude, population, is_central) VALUES
((SELECT id FROM cities WHERE plate_code = '59'), 'Süleymanpaşa', 41.2867, 27.5167, 212345, TRUE),
((SELECT id FROM cities WHERE plate_code = '59'), 'Çorlu', 41.1500, 27.8000, 289654, FALSE),
((SELECT id FROM cities WHERE plate_code = '59'), 'Çerkezköy', 41.2833, 28.0000, 178654, FALSE),
((SELECT id FROM cities WHERE plate_code = '59'), 'Ergene', 41.3000, 27.6167, 67890, FALSE);
