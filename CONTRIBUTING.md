# Katkı Rehberi

Bu proje araştırmacı gazetecilik ve açık kaynak veri arşivleme prensipleriyle çalışır. Yeni bir kişi, kurum, olay veya ilişki eklemek için aşağıdaki adımları izleyin:

## 1. Yeni Dosya Oluşturma
- Düğümlerinizi `_nodes/` klasörünün altında konuyla ilgili bir alt dizine ekleyin (örn: `_nodes/people/ad-soyad.md`).
- Dosya adı mutlaka küçük harf ve tire işaretinden (`-`) oluşmalıdır.

## 2. Zorunlu Alanlar
Her dosyanın başında YAML formatında şu blok yer almalıdır:

```yaml
---
id: "dosya-adiyla-ayni-id"
title: "Tam Görünecek İsim"
type: "person" # veya organization, fund, event
color: "#HEXKODU" # Opsiyonel
relations:
  - target: "hedef-id"
    type: "ortak"
    weight: 4 # 1-5 arası
    evidence: "resmi_tutanak" # iddia, belgeli, resmi_tutanak
---