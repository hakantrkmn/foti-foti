# Google OAuth Consent Screen Sorunu Çözümü

## 🔴 Hata: "Erişim engellendi: foti-foti, Google doğrulama sürecini tamamlamadı"

Bu hata, Google Cloud Console'da OAuth consent screen ayarlarından kaynaklanıyor. Uygulamanız henüz Google tarafından doğrulanmamış.

## 🛠️ Çözüm Seçenekleri:

### Seçenek 1: Test Kullanıcısı Ekleme (Hızlı Çözüm)

1. [Google Cloud Console](https://console.cloud.google.com/) adresine gidin
2. Projenizi seçin
3. Sol menüden "APIs & Services" > "OAuth consent screen" seçin
4. "Test users" bölümüne gidin
5. "Add Users" butonuna tıklayın
6. `hakannturkmen@gmail.com` adresini ekleyin
7. "Save" butonuna tıklayın

### Seçenek 2: Uygulama Doğrulama (Uzun Süreli Çözüm)

1. [Google Cloud Console](https://console.cloud.google.com/) adresine gidin
2. Projenizi seçin
3. Sol menüden "APIs & Services" > "OAuth consent screen" seçin
4. "Publishing status" bölümünde "Submit for verification" seçin
5. Gerekli bilgileri doldurun:
   - App name: "Foti Foti"
   - User support email: `hakannturkmen@gmail.com`
   - Developer contact information: `hakannturkmen@gmail.com`
   - App description: "Fotoğraf çekme ve Google Drive'a yükleme uygulaması"
6. "Submit" butonuna tıklayın

### Seçenek 3: External Kullanıcılar İçin Geçici Çözüm

1. [Google Cloud Console](https://console.cloud.google.com/) adresine gidin
2. Projenizi seçin
3. Sol menüden "APIs & Services" > "OAuth consent screen" seçin
4. "Publishing status" bölümünde "External" seçin
5. "Save" butonuna tıklayın
6. Kullanıcılar artık "Advanced" > "Go to [App Name] (unsafe)" seçeneği ile erişebilir

## 📋 Detaylı Adımlar (Seçenek 1 - Önerilen):

### 1. Google Cloud Console'a Giriş
- [Google Cloud Console](https://console.cloud.google.com/) adresine gidin
- Google hesabınızla giriş yapın
- "Foti Foti" projenizi seçin

### 2. OAuth Consent Screen'e Erişim
- Sol menüden "APIs & Services" seçin
- "OAuth consent screen" tıklayın

### 3. Test Kullanıcısı Ekleme
- Sayfayı aşağı kaydırın
- "Test users" bölümünü bulun
- "Add Users" butonuna tıklayın
- Email adresini girin: `hakannturkmen@gmail.com`
- "Save" butonuna tıklayın

### 4. Test Etme
- Uygulamanızı yeniden açın
- "Google Drive'a Yükle" butonuna tıklayın
- Google hesabınızla giriş yapın
- Artık erişim sağlayabilmelisiniz

## ⚠️ Önemli Notlar:

- **Test kullanıcıları** sadece geliştirme aşamasında kullanılır
- **Production** için uygulama doğrulaması gerekir
- **External** seçeneği güvenlik riskleri taşır
- **Doğrulama süreci** 6-8 hafta sürebilir

## 🔧 Hızlı Test:

Test kullanıcısı ekledikten sonra:
1. Uygulamayı yenileyin
2. Fotoğraf çekin
3. "Google Drive'a Yükle" butonuna tıklayın
4. Google hesabınızla giriş yapın
5. İzin verin

Artık fotoğraflarınız Google Drive'a yüklenecektir! 