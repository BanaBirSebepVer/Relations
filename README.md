# Araştırmacı İlişki Ağı (Relationship Graph)

Bu depo, karmaşık kişi, kurum ve olay ilişkilerini Markdown dosyaları üzerinden haritalandıran, Jekyll ve Cytoscape.js tabanlı açık kaynaklı bir arşiv ve görselleştirme projesidir.

## Özellikler
- **Markdown & Front-Matter ile Yönetim:** Veri tabanı gerektirmez; her düğüm bağımsız bir `.md` dosyasıdır.
- **Dinamik Ağ Analizi:** Derece merkeziliğine göre düğüm boyutlandırma, yön okları ve kanıt düzeyine göre çizgi stilleri.
- **%80 Detay Sidebar'ı:** Aktöre tıklandığında ilişkili diğer tüm aktörler soluklaşır ve derinlemesine dosya dökümü açılır.
- **Hayalet Düğüm Desteği:** Henüz dosyası oluşturulmamış aktörler grafiği bozmaz; taslak olarak listelenir.
- **Sıfır Sunucu Maliyeti:** GitHub Pages üzerinde statik olarak çalışır.

## Yerel Kurulum (Local Development)

```bash
# Depoyu klonlayın
git clone [https://github.com/BanaBirSebepVer/Relations.git](https://github.com/BanaBirSebepVer/Relations.git)
cd REPO_ADI

# Bağımlılıkları yükleyin
bundle install

# Yerel sunucuyu başlatın
bundle exec jekyll serve
```

Tarayıcınızdan http://localhost:4000 adresine giderek grafiği görüntüleyebilirsiniz.