# Android Kurulum Rehberi

Bu rehber, Foti Foti uygulamasının Android platformunda çalıştırılması için gerekli adımları açıklar.

## Gereksinimler

1. **Android Studio** (önerilen) veya **Android SDK**
2. **Java Development Kit (JDK)** 11 veya üzeri
3. **Android SDK** API Level 22 veya üzeri

## Kurulum Adımları

### 1. Android Studio Kurulumu

1. [Android Studio'yu indirin](https://developer.android.com/studio)
2. Kurulum sırasında "Android SDK" seçeneğini işaretleyin
3. Kurulum tamamlandıktan sonra Android Studio'yu açın

### 2. Android SDK Kurulumu

Android Studio'da:
1. **Tools** > **SDK Manager** açın
2. **SDK Platforms** sekmesinde:
   - Android 13 (API Level 33) veya üzerini seçin
   - **Show Package Details** işaretleyin
   - **Android SDK Platform 33** seçin
3. **SDK Tools** sekmesinde:
   - **Android SDK Build-Tools** seçin
   - **Android SDK Command-line Tools** seçin
4. **Apply** butonuna tıklayın

### 3. Environment Variables

Terminal'de aşağıdaki değişkenleri ayarlayın:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### 4. Android Emulator Oluşturma

1. Android Studio'da **Tools** > **AVD Manager** açın
2. **Create Virtual Device** butonuna tıklayın
3. Bir cihaz seçin (örn: Pixel 7)
4. Android 13 (API 33) sistem imajını seçin
5. **Finish** butonuna tıklayın

## Uygulamayı Çalıştırma

### 1. Projeyi Sync Edin

```bash
npm run build
npx cap sync android
```

### 2. Android Studio'da Açın

```bash
npx cap open android
```

### 3. Emülatörde Çalıştırın

1. Android Studio'da **Run** butonuna tıklayın
2. Emülatörü seçin ve **OK** butonuna tıklayın
3. Uygulama emülatörde açılacaktır

### 4. Gerçek Cihazda Test

1. Android cihazınızı USB ile bağlayın
2. **Developer Options** > **USB Debugging** etkinleştirin
3. Android Studio'da cihazınızı seçin ve çalıştırın

## Kamera İzinleri

Uygulama ilk açıldığında:
1. Kamera izni isteği gelecektir
2. **İzin Ver** butonuna tıklayın
3. Artık native Android kamera uygulaması açılacaktır

## Özellikler

- ✅ **Native Android Kamera**: Gerçek Android kamera uygulaması
- ✅ **Tüm Kamera Özellikleri**: Zoom, ışık, filtreler, vb.
- ✅ **Google Drive Upload**: Asenkron yükleme sistemi
- ✅ **İzin Yönetimi**: Otomatik kamera izni kontrolü

## Sorun Giderme

### Android Studio Açılmıyor
```bash
# Environment variable ayarlayın
export CAPACITOR_ANDROID_STUDIO_PATH="/Applications/Android Studio.app"
```

### Emülatör Çalışmıyor
1. **AVD Manager**'da emülatörü silin
2. Yeni bir emülatör oluşturun
3. **Cold Boot** seçeneği ile başlatın

### Kamera Çalışmıyor
1. Emülatörde **Camera** uygulamasını açın
2. Kamera izinlerini kontrol edin
3. **Settings** > **Apps** > **Foti Foti** > **Permissions**

## Geliştirme İpuçları

1. **Hot Reload**: Android Studio'da değişiklikler otomatik yansır
2. **Logs**: **Logcat** panelinde hata mesajlarını görün
3. **Debug**: Breakpoint'ler koyarak debug yapabilirsiniz

## Build APK

Release APK oluşturmak için:

```bash
# Android Studio'da
Build > Build Bundle(s) / APK(s) > Build APK(s)
```

APK dosyası `android/app/build/outputs/apk/debug/` klasöründe oluşacaktır. 