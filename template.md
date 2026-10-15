---
# ==========================================
# 1. KİMLİK VE GÖRÜNÜM BİLGİLERİ
# ==========================================
id: "x-fonu"                                # Dosya adı ile birebir aynı olmalı (örn: x-fonu.md -> "x-fonu")
title: "X Varlık Yönetim Fonu"              # Grafikte ve arayüzde görünecek tam başlık
type: "fund"                                # Serbest kategori (person, organization, event, paper vb.)
color: "#1e40af"                            # Düğüm HEX rengi (boşsa kategori varsayılanını alır)
image: "/assets/images/nodes/x-fonu.jpg"    # Öne çıkan görsel (Cytoscape düğüm içi ve sidebar kapak görseli)
size_mode: "auto"                           # "auto" (bağlantı sayısına göre dinamik) veya "fixed" (standart)

# ==========================================
# 2. İLİŞKİLER (RELATIONS)
# ==========================================
relations:
  # Örnek A: Tekil Hedef ve Özel Yönlendirme
  - target: "fatma-yilmaz"
    type: "kurucu_ortak"
    weight: 5                               # 1-5 arası çizgi kalınlığı
    evidence: "resmi_tutanak"               # iddia, belgeli, resmi_tutanak vb. (çizgi stilini belirler)
    direction: "directed"                  # "directed" (kaynaktan hedefe), "mutual" (çift yön), "none" (yönsüz)
    edge_color: "#ef4444"                   # İsteğe bağlı özel bağ rengi (HEX)
    start_date: "2021-03"                   # Opsiyonel zaman damgası (YYYY veya YYYY-MM)
    end_date: "2023-11"

  # Örnek B: Çoklu Hedef (Targets) ve Sıralı Yönlendirme
  # Tanımlanan nitelikler ve yön kuralı listedeki tüm hedeflere sırasıyla uygulanır
  - targets:
      - "mehmet-oz"
      - "ayse-kaya"
      - "z-bankasi"
    type: "yatirimci"
    weight: 3
    evidence: "belgeli"
    direction: "directed"                  # x-fonu -> mehmet-oz, x-fonu -> ayse-kaya, x-fonu -> z-bankasi
    edge_color: "#3b82f6"

  # Örnek C: Akıllı Varsayılan (Direction alanı boş)
  # Karşı dosya da bu bağı yazdıysa düz çizgi, sadece bu dosya yazdıysa tek yönlü ok olur
  - target: "denetim-kurulu"
    type: "inceleme"
    weight: 4
    evidence: "iddia"
---

Buradan itibaren aktöre ait detaylı metin başlar. 
Grafikte düğüme tıklandığında sağ tarafta ekranın %80'ini kaplayacak şekilde açılacak olan sidebar alanı doğrudan bu kısmı ekrana basar.

## Genel Bakış
X Fonu ile ilgili toplanan arşiv kayıtları, iddianame özetleri ve tarihsel arka plan bu alana serbestçe yazılabilir.

## Kaynaklar ve Belgeler
- 12.05.2023 Tarihli MASAK Raporu (Ek: 4)
- İlgili Ticaret Sicil Gazetesi İlanı