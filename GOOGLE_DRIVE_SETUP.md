# Google Drive API Kurulum Rehberi

Bu rehber, uygulamanızın Google Drive'a fotoğraf yükleme özelliğini kullanabilmesi için gerekli ayarları açıklar.

## 1. Google Cloud Console'da Proje Oluşturma

1. [Google Cloud Console](https://console.cloud.google.com/) adresine gidin
2. Google hesabınızla giriş yapın
3. Üst menüden yeni bir proje oluşturun veya mevcut projeyi seçin

## 2. Google Drive API'yi Etkinleştirme

1. Sol menüden "APIs & Services" > "Library" seçin
2. Arama kutusuna "Google Drive API" yazın
3. Google Drive API'yi seçin ve "Enable" butonuna tıklayın

## 3. OAuth 2.0 Kimlik Bilgileri Oluşturma

1. Sol menüden "APIs & Services" > "Credentials" seçin
2. "Create Credentials" > "OAuth client ID" seçin
3. Uygulama türü olarak "Web application" seçin
4. Uygulama adını girin (örn: "Foti Foti Camera App")
5. Authorized JavaScript origins kısmına şunları ekleyin:
   - `http://localhost:5173` (development için)
   - `https://yourdomain.com` (production için)
6. "Create" butonuna tıklayın
7. Client ID'yi kopyalayın

## 4. API Key Oluşturma

1. "Create Credentials" > "API key" seçin
2. Oluşturulan API key'i kopyalayın
3. API key'i kısıtlamak için "Restrict key" seçeneğini kullanabilirsiniz

## 5. Google Drive Klasörü Oluşturma

1. [Google Drive](https://drive.google.com/) adresine gidin
2. Yeni bir klasör oluşturun (örn: "Foti Foti Photos")
3. Klasöre sağ tıklayın ve "Share" seçin
4. "Anyone with the link" seçin ve "Viewer" izni verin
5. Klasör URL'sinden folder ID'yi kopyalayın:
   - URL: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
   - Folder ID: `FOLDER_ID_HERE` kısmı

## 6. Environment Variables Ayarlama

Proje ana dizininde `.env` dosyası oluşturun:

```env
VITE_GOOGLE_CLIENT_ID=your_client_id_here
VITE_GOOGLE_API_KEY=your_api_key_here
VITE_GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here
```

## 7. Bağımlılıkları Yükleme

```bash
npm install
```

## 8. Uygulamayı Çalıştırma

```bash
npm run dev
```

## Kullanım

1. Uygulamayı açın
2. "Fotoğraf Çek" butonuna tıklayın
3. Telefonunuzun kamerası ile fotoğraf çekin
4. Fotoğraf önizlemesinde "Google Drive'a Yükle" butonuna tıklayın
5. Google hesabınızla giriş yapın ve izin verin
6. Fotoğraf Google Drive klasörünüze yüklenecek

## Güvenlik Notları

- `.env` dosyasını asla GitHub'a push etmeyin
- API key'lerinizi güvenli tutun
- Production'da HTTPS kullanın
- OAuth consent screen'de uygulamanızı doğrulayın

## Sorun Giderme

### "Google Drive not initialized" hatası
- Environment variables'ların doğru ayarlandığından emin olun
- Sayfayı yenileyin

### "Upload failed" hatası
- Google Drive API'nin etkin olduğundan emin olun
- OAuth client ID'nin doğru olduğunu kontrol edin
- Klasör ID'sinin doğru olduğunu kontrol edin

### CORS hatası
- Authorized JavaScript origins'e doğru domain'i eklediğinizden emin olun
- HTTPS kullanıyorsanız `https://` ile başladığından emin olun 