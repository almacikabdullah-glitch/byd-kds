/**
 * BYD KDS - Word Rapor Oluşturucu
 */
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = require('docx');
const fs = require('fs');

async function createReport() {
    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                // Kapak Sayfası
                new Paragraph({ text: "", spacing: { after: 400 } }),
                new Paragraph({
                    children: [new TextRun({ text: "T.C.", bold: true, size: 28 })],
                    alignment: AlignmentType.CENTER
                }),
                new Paragraph({
                    children: [new TextRun({ text: "DOKUZ EYLÜL ÜNİVERSİTESİ", bold: true, size: 28 })],
                    alignment: AlignmentType.CENTER
                }),
                new Paragraph({
                    children: [new TextRun({ text: "İKTİSADİ VE İDARİ BİLİMLER FAKÜLTESİ", bold: true, size: 28 })],
                    alignment: AlignmentType.CENTER
                }),
                new Paragraph({
                    children: [new TextRun({ text: "YÖNETİM BİLİŞİM SİSTEMLERİ BÖLÜMÜ", bold: true, size: 28 })],
                    alignment: AlignmentType.CENTER
                }),
                new Paragraph({
                    children: [new TextRun({ text: "DÖNEM PROJESİ", bold: true, size: 28 })],
                    alignment: AlignmentType.CENTER
                }),
                new Paragraph({ text: "", spacing: { after: 800 } }),
                new Paragraph({
                    children: [new TextRun({ text: "YBS 3015", bold: true, size: 32 })],
                    alignment: AlignmentType.CENTER
                }),
                new Paragraph({
                    children: [new TextRun({ text: "KARAR DESTEK SİSTEMLERİ", bold: true, size: 32 })],
                    alignment: AlignmentType.CENTER
                }),
                new Paragraph({ text: "", spacing: { after: 600 } }),
                new Paragraph({
                    children: [new TextRun({ text: "BYD TÜRKİYE EV ŞARJ İSTASYONU KARAR DESTEK SİSTEMİ", bold: true, size: 36 })],
                    alignment: AlignmentType.CENTER
                }),
                new Paragraph({ text: "", spacing: { after: 1200 } }),
                new Paragraph({
                    children: [new TextRun({ text: "2022469126", size: 24 })],
                    alignment: AlignmentType.CENTER
                }),
                new Paragraph({
                    children: [new TextRun({ text: "ABDULLAH ALMACIK", bold: true, size: 28 })],
                    alignment: AlignmentType.CENTER
                }),
                new Paragraph({ text: "", spacing: { after: 800 } }),
                new Paragraph({
                    children: [new TextRun({ text: "Öğretim Üyesi", size: 24 })],
                    alignment: AlignmentType.CENTER
                }),
                new Paragraph({
                    children: [new TextRun({ text: "Prof.Dr. Vahap TECİM", bold: true, size: 28 })],
                    alignment: AlignmentType.CENTER
                }),
                new Paragraph({ text: "", spacing: { after: 800 } }),
                new Paragraph({
                    children: [new TextRun({ text: "İZMİR - 2025", bold: true, size: 28 })],
                    alignment: AlignmentType.CENTER
                }),

                // Sayfa Sonu
                new Paragraph({ text: "", pageBreakBefore: true }),

                // ÖZET
                new Paragraph({
                    text: "ÖZET",
                    heading: HeadingLevel.HEADING_1,
                    alignment: AlignmentType.CENTER
                }),
                new Paragraph({ text: "" }),
                new Paragraph({
                    children: [new TextRun({
                        text: "Bu projede, BYD Türkiye için elektrikli araç şarj istasyonu yatırımı yapılacak en uygun şehirlerin belirlenmesi amacıyla bir karar destek sistemi geliştirilmiştir. Sistem, TOPSIS (Technique for Order Preference by Similarity to Ideal Solution) çok kriterli karar verme yöntemi kullanarak Türkiye'deki 30 büyükşehri analiz etmekte ve yatırım öncelik sıralaması oluşturmaktadır. Karar destek sistemi; veritabanı analizleri, istatistiksel yöntemler, ROI hesaplamaları ve grafiksel sunumlarla karar vericilere destek olmaktadır. Sonuç olarak, farklı yatırım stratejilerine göre en uygun şehirler ve yatırım geri dönüş süreleri önerilmiştir.",
                        size: 24
                    })]
                }),

                // GİRİŞ
                new Paragraph({ text: "", spacing: { after: 400 } }),
                new Paragraph({
                    text: "GİRİŞ",
                    heading: HeadingLevel.HEADING_1,
                    alignment: AlignmentType.CENTER
                }),
                new Paragraph({ text: "" }),
                new Paragraph({
                    children: [new TextRun({
                        text: "Elektrikli araç pazarı Türkiye'de hızla büyümektedir. Bu büyümeyle birlikte şarj altyapısı ihtiyacı da artmaktadır. BYD, dünya genelinde lider elektrikli araç üreticilerinden biri olarak Türkiye pazarında da şarj istasyonu ağını genişletmeyi planlamaktadır. Ancak sınırlı kaynakların etkin kullanılması için hangi şehirlere öncelik verilmesi gerektiği stratejik bir karar problemidir.",
                        size: 24
                    })]
                }),
                new Paragraph({ text: "" }),
                new Paragraph({
                    children: [new TextRun({
                        text: "Bu proje, BYD Türkiye'nin şarj istasyonu yatırım kararlarını veri odaklı, objektif ve ölçülebilir hale getirmeyi amaçlamaktadır. Çok kriterli karar verme yöntemi ile şehirler karşılaştırılarak yatırım öncelik listesi oluşturulmaktadır.",
                        size: 24
                    })]
                }),

                // BÖLÜM 1
                new Paragraph({ text: "", spacing: { after: 400 } }),
                new Paragraph({
                    text: "BÖLÜM 1: PROBLEMİN TANIMI, İNCELENMESİ",
                    heading: HeadingLevel.HEADING_1
                }),
                new Paragraph({ text: "" }),
                new Paragraph({
                    text: "1.1 Problemin Tanımı",
                    heading: HeadingLevel.HEADING_2
                }),
                new Paragraph({
                    children: [new TextRun({
                        text: "BYD Türkiye'nin elektrikli araç şarj istasyonu yatırım kararları üzerine iki temel problem tanımlanmıştır:",
                        size: 24
                    })]
                }),
                new Paragraph({
                    children: [new TextRun({ text: "1. Türkiye'deki 30 büyükşehirden hangilerine öncelikli olarak şarj istasyonu yatırımı yapılmalıdır?", size: 24 })],
                    bullet: { level: 0 }
                }),
                new Paragraph({
                    children: [new TextRun({ text: "2. Farklı yatırım stratejileri (agresif, dengeli, temkinli) uygulandığında şehir sıralaması nasıl değişmektedir?", size: 24 })],
                    bullet: { level: 0 }
                }),
                new Paragraph({
                    children: [new TextRun({ text: "3. Yatırımın geri dönüş süresi ne kadardır ve hangi şehirler daha karlıdır?", size: 24 })],
                    bullet: { level: 0 }
                }),
                new Paragraph({ text: "" }),
                new Paragraph({
                    text: "1.2 Problem Üzerine Mevcut Durumun Analizi",
                    heading: HeadingLevel.HEADING_2
                }),
                new Paragraph({
                    children: [new TextRun({
                        text: "Şarj istasyonu yatırım kararları geleneksel olarak sezgisel yöntemlerle verilmektedir. Bu durum subjektif değerlendirmeler nedeniyle tutarsız kararlara, farklı kriterlerin ağırlıklandırılmasında belirsizliğe, yatırım getirisi hesaplamalarının manuel ve zaman alıcı olmasına ve farklı senaryoların karşılaştırılamamasına yol açmaktadır.",
                        size: 24
                    })]
                }),

                // BÖLÜM 2
                new Paragraph({ text: "", spacing: { after: 400 } }),
                new Paragraph({
                    text: "BÖLÜM 2: YÖNTEM-METOD",
                    heading: HeadingLevel.HEADING_1
                }),
                new Paragraph({ text: "" }),
                new Paragraph({
                    text: "2.1 Verilerin Toplanması",
                    heading: HeadingLevel.HEADING_2
                }),
                new Paragraph({
                    children: [new TextRun({ text: "Demografik Veriler: ", bold: true, size: 24 }), new TextRun({ text: "TÜİK'ten nüfus, nüfus yoğunluğu ve gelir düzeyi verileri", size: 24 })]
                }),
                new Paragraph({
                    children: [new TextRun({ text: "Elektrikli Araç Verileri: ", bold: true, size: 24 }), new TextRun({ text: "Ulaştırma Bakanlığı'ndan şehir bazlı EV sayıları", size: 24 })]
                }),
                new Paragraph({
                    children: [new TextRun({ text: "Enerji Altyapısı: ", bold: true, size: 24 }), new TextRun({ text: "EPDK ve TEİAŞ'tan enerji kapasitesi ve şebeke güvenilirliği verileri", size: 24 })]
                }),
                new Paragraph({
                    children: [new TextRun({ text: "Rekabet Verileri: ", bold: true, size: 24 }), new TextRun({ text: "Mevcut şarj istasyonu sayıları ve dağılımları", size: 24 })]
                }),
                new Paragraph({ text: "" }),
                new Paragraph({
                    text: "2.2 Kullanılan Yöntemler",
                    heading: HeadingLevel.HEADING_2
                }),
                new Paragraph({
                    children: [new TextRun({
                        text: "TOPSIS Algoritması: Çok kriterli karar verme için TOPSIS (Technique for Order Preference by Similarity to Ideal Solution) yöntemi uygulanmıştır. Bu yöntem, alternatifleri ideal pozitif çözüme yakınlık ve ideal negatif çözümden uzaklık kriterlerine göre sıralar.",
                        size: 24
                    })]
                }),
                new Paragraph({ text: "" }),
                new Paragraph({
                    children: [new TextRun({ text: "Kullanılan Teknolojiler:", bold: true, size: 24 })]
                }),
                new Paragraph({
                    children: [new TextRun({ text: "• HTML ve CSS: Kullanıcı dostu arayüz tasarımı ve grafiksel sunumlar", size: 24 })]
                }),
                new Paragraph({
                    children: [new TextRun({ text: "• JavaScript ve Chart.js: Dinamik grafikler ve kullanıcı etkileşimleri", size: 24 })]
                }),
                new Paragraph({
                    children: [new TextRun({ text: "• Node.js ve Express.js: Backend API geliştirme", size: 24 })]
                }),
                new Paragraph({
                    children: [new TextRun({ text: "• MySQL: Veritabanı yönetimi ve sorgulama", size: 24 })]
                }),
                new Paragraph({
                    children: [new TextRun({ text: "• jsPDF: PDF rapor oluşturma", size: 24 })]
                }),

                // BÖLÜM 3
                new Paragraph({ text: "", spacing: { after: 400 } }),
                new Paragraph({
                    text: "BÖLÜM 3: BULGULAR-UYGULAMA-YAZILIMLAR",
                    heading: HeadingLevel.HEADING_1
                }),
                new Paragraph({ text: "" }),
                new Paragraph({
                    text: "3.1 TOPSIS Analizi Sonuçları",
                    heading: HeadingLevel.HEADING_2
                }),
                new Paragraph({
                    children: [new TextRun({
                        text: "Yapılan analizler sonucunda, dengeli strateji uygulandığında şehirlerin yatırım öncelik sıralaması belirlenmiştir. En yüksek TOPSIS skoru alan ilk 5 şehir:",
                        size: 24
                    })]
                }),
                new Paragraph({
                    children: [new TextRun({ text: "1. İstanbul - En yüksek EV yoğunluğu ve nüfus", size: 24 })]
                }),
                new Paragraph({
                    children: [new TextRun({ text: "2. Ankara - Başkent avantajı ve yüksek gelir düzeyi", size: 24 })]
                }),
                new Paragraph({
                    children: [new TextRun({ text: "3. İzmir - Ege Bölgesi merkezi, turizm potansiyeli", size: 24 })]
                }),
                new Paragraph({
                    children: [new TextRun({ text: "4. Bursa - Sanayi merkezi, otoyol erişimi", size: 24 })]
                }),
                new Paragraph({
                    children: [new TextRun({ text: "5. Antalya - Turizm potansiyeli, büyüyen EV pazarı", size: 24 })]
                }),
                new Paragraph({ text: "" }),
                new Paragraph({
                    text: "3.2 Senaryo Karşılaştırması",
                    heading: HeadingLevel.HEADING_2
                }),
                new Paragraph({
                    children: [new TextRun({ text: "Üç farklı yatırım stratejisi test edilmiştir:", size: 24 })]
                }),
                new Paragraph({
                    children: [new TextRun({ text: "• Agresif Strateji: ", bold: true, size: 24 }), new TextRun({ text: "EV sayısı ve nüfus yoğunluğuna öncelik verir, hızlı büyüme hedefler", size: 24 })]
                }),
                new Paragraph({
                    children: [new TextRun({ text: "• Dengeli Strateji: ", bold: true, size: 24 }), new TextRun({ text: "Tüm kriterleri eşit değerlendirir, ortalama risk", size: 24 })]
                }),
                new Paragraph({
                    children: [new TextRun({ text: "• Temkinli Strateji: ", bold: true, size: 24 }), new TextRun({ text: "Altyapı ve gelir güvenliğine öncelik verir, düşük risk", size: 24 })]
                }),
                new Paragraph({ text: "" }),
                new Paragraph({
                    text: "3.3 ROI Analizi Bulguları",
                    heading: HeadingLevel.HEADING_2
                }),
                new Paragraph({
                    children: [new TextRun({ text: "• Ortalama Geri Dönüş Süresi: 24-36 ay (parametrelere göre değişir)", size: 24 })]
                }),
                new Paragraph({
                    children: [new TextRun({ text: "• En Hızlı Geri Dönüş: Yüksek EV yoğunluklu metropolitan şehirler", size: 24 })]
                }),
                new Paragraph({
                    children: [new TextRun({ text: "• En Yüksek Karlılık: İstanbul, Ankara, İzmir", size: 24 })]
                }),
                new Paragraph({ text: "" }),
                new Paragraph({
                    text: "3.4 Yazılım Uygulamaları",
                    heading: HeadingLevel.HEADING_2
                }),
                new Paragraph({
                    children: [new TextRun({ text: "Geliştirilen karar destek sistemi aşağıdaki modüllerden oluşmaktadır:", size: 24 })]
                }),
                new Paragraph({
                    children: [new TextRun({ text: "• Dashboard (Gösterge Paneli): ", bold: true, size: 24 }), new TextRun({ text: "Genel bakış, top 5 şehir ve özet istatistikler", size: 24 })]
                }),
                new Paragraph({
                    children: [new TextRun({ text: "• TOPSIS Analizi Sayfası: ", bold: true, size: 24 }), new TextRun({ text: "Çok kriterli analiz çalıştırma ve sonuç görüntüleme", size: 24 })]
                }),
                new Paragraph({
                    children: [new TextRun({ text: "• Senaryolar Sayfası: ", bold: true, size: 24 }), new TextRun({ text: "Farklı strateji ağırlıkları ile analiz yapma", size: 24 })]
                }),
                new Paragraph({
                    children: [new TextRun({ text: "• ROI Analizi Sayfası: ", bold: true, size: 24 }), new TextRun({ text: "Yatırım maliyeti ve geri dönüş hesaplama", size: 24 })]
                }),
                new Paragraph({
                    children: [new TextRun({ text: "• Tahminleme Sayfası: ", bold: true, size: 24 }), new TextRun({ text: "EV sayısı ve talep projeksiyonu", size: 24 })]
                }),
                new Paragraph({
                    children: [new TextRun({ text: "• Harita Sayfası: ", bold: true, size: 24 }), new TextRun({ text: "Şehirlerin coğrafi dağılımı ve skorları", size: 24 })]
                }),
                new Paragraph({
                    children: [new TextRun({ text: "• Karşılaştırma Sayfası: ", bold: true, size: 24 }), new TextRun({ text: "Seçilen şehirleri yan yana kıyaslama", size: 24 })]
                }),

                // SONUÇ
                new Paragraph({ text: "", spacing: { after: 400 } }),
                new Paragraph({
                    text: "SONUÇ",
                    heading: HeadingLevel.HEADING_1,
                    alignment: AlignmentType.CENTER
                }),
                new Paragraph({ text: "" }),
                new Paragraph({
                    children: [new TextRun({
                        text: "Proje sonunda, BYD Türkiye için TOPSIS yöntemi kullanılarak şehirlerin yatırım öncelik sıralaması oluşturulmuştur. Bulgular:",
                        size: 24
                    })]
                }),
                new Paragraph({
                    children: [new TextRun({ text: "1. İstanbul, Ankara ve İzmir en yüksek yatırım önceliğine sahip şehirlerdir", size: 24 })]
                }),
                new Paragraph({
                    children: [new TextRun({ text: "2. Dengeli strateji ortalama risk-getiri dengesi sunar", size: 24 })]
                }),
                new Paragraph({
                    children: [new TextRun({ text: "3. ROI analizi ile yatırım geri dönüş süreleri 24-36 ay arasında hesaplanmıştır", size: 24 })]
                }),
                new Paragraph({
                    children: [new TextRun({ text: "4. Tahminleme modülü ile 2025 ve sonrası için EV talebi projeksiyonları sunulmuştur", size: 24 })]
                }),
                new Paragraph({ text: "" }),
                new Paragraph({
                    children: [new TextRun({
                        text: "Bu karar destek sistemi, BYD Türkiye'nin şarj istasyonu genişleme stratejisini veriye dayalı, ölçülebilir ve tekrar edilebilir hale getirmektedir. Yöneticiler, subjektif değerlendirmeler yerine objektif analizlere dayanarak daha hızlı ve doğru kararlar alabilir.",
                        size: 24
                    })]
                }),

                // REFERANSLAR
                new Paragraph({ text: "", spacing: { after: 400 } }),
                new Paragraph({
                    text: "REFERANSLAR",
                    heading: HeadingLevel.HEADING_1,
                    alignment: AlignmentType.CENTER
                }),
                new Paragraph({ text: "" }),
                new Paragraph({
                    children: [new TextRun({ text: "• https://data.tuik.gov.tr - TÜİK Veri Portalı", size: 24 })]
                }),
                new Paragraph({
                    children: [new TextRun({ text: "• https://www.epdk.gov.tr - EPDK Enerji Verileri", size: 24 })]
                }),
                new Paragraph({
                    children: [new TextRun({ text: "• https://www.teias.gov.tr - TEİAŞ Elektrik İletim Verileri", size: 24 })]
                }),
                new Paragraph({
                    children: [new TextRun({ text: "• https://www.uab.gov.tr - Ulaştırma Bakanlığı EV İstatistikleri", size: 24 })]
                }),
                new Paragraph({
                    children: [new TextRun({ text: "• https://www.byd.com - BYD Global", size: 24 })]
                }),
                new Paragraph({
                    children: [new TextRun({ text: "• Hwang, C.L.; Yoon, K. (1981). Multiple Attribute Decision Making: Methods and Applications. Springer-Verlag.", size: 24 })]
                }),

                // PROJE KODLARI
                new Paragraph({ text: "", spacing: { after: 400 } }),
                new Paragraph({
                    text: "PROJE KODLARI",
                    heading: HeadingLevel.HEADING_1,
                    alignment: AlignmentType.CENTER
                }),
                new Paragraph({ text: "" }),
                new Paragraph({
                    children: [new TextRun({ text: "Proje kaynak kodları GitHub üzerinde paylaşılmıştır:", size: 24 })]
                }),
                new Paragraph({
                    children: [new TextRun({ text: "https://github.com/abdullahalmacik/byd-kds", size: 24, color: "0000FF" })]
                }),
            ],
        }],
    });

    const buffer = await Packer.toBuffer(doc);
    const outputPath = '/Users/abdullahalmacik/Desktop/BYD_KDS_Rapor.docx';
    fs.writeFileSync(outputPath, buffer);
    console.log('✅ Word dosyası oluşturuldu:', outputPath);
}

createReport().catch(console.error);
