export class ImageQualityManager {
  // Görsel kalitesini kontrol et
  static checkImageQuality(file) {
    const qualityInfo = {
      size: file.size,
      type: file.type,
      quality: 'unknown',
      compression: 'unknown',
      recommendations: []
    };

    // Dosya boyutuna göre kalite tahmini
    if (file.size > 5000000) { // 5MB+
      qualityInfo.quality = 'high';
      qualityInfo.compression = 'minimal';
    } else if (file.size > 1000000) { // 1MB+
      qualityInfo.quality = 'medium';
      qualityInfo.compression = 'moderate';
    } else {
      qualityInfo.quality = 'low';
      qualityInfo.compression = 'high';
      qualityInfo.recommendations.push('Daha yüksek kalitede fotoğraf çekmeyi deneyin');
    }

    // Dosya tipine göre kalite kontrolü
    if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
      qualityInfo.recommendations.push('JPEG formatı kullanılıyor - kalite korunuyor');
    } else if (file.type === 'image/png') {
      qualityInfo.recommendations.push('PNG formatı kullanılıyor - kayıpsız sıkıştırma');
    } else if (file.type === 'image/heic' || file.type === 'image/heif') {
      qualityInfo.recommendations.push('HEIC formatı kullanılıyor - yüksek kalite');
    } else {
      qualityInfo.recommendations.push('Bilinmeyen format - kalite kontrol edilemiyor');
    }

    return qualityInfo;
  }

  // Görsel boyutunu kontrol et
  static checkImageDimensions(file) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const dimensions = {
          width: img.width,
          height: img.height,
          aspectRatio: img.width / img.height,
          megapixels: (img.width * img.height) / 1000000
        };

        // Çözünürlük kalitesi
        if (dimensions.megapixels > 12) {
          dimensions.quality = 'ultra_high';
        } else if (dimensions.megapixels > 8) {
          dimensions.quality = 'high';
        } else if (dimensions.megapixels > 4) {
          dimensions.quality = 'medium';
        } else {
          dimensions.quality = 'low';
        }

        resolve(dimensions);
      };
      img.onerror = () => {
        resolve({
          width: 0,
          height: 0,
          aspectRatio: 0,
          megapixels: 0,
          quality: 'unknown'
        });
      };
      img.src = URL.createObjectURL(file);
    });
  }

  // NOT: optimizeImage fonksiyonu kaldırıldı - orijinal kalite korunması için

  // Görsel formatını kontrol et
  static getImageFormat(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    const mimeType = file.type;

    const formatMap = {
      'jpg': 'JPEG',
      'jpeg': 'JPEG',
      'png': 'PNG',
      'heic': 'HEIC',
      'heif': 'HEIF',
      'webp': 'WebP',
      'gif': 'GIF'
    };

    return {
      extension,
      mimeType,
      format: formatMap[extension] || 'Unknown',
      isLossless: ['png', 'heic', 'heif'].includes(extension),
      isCompressed: ['jpg', 'jpeg', 'webp'].includes(extension)
    };
  }

  // Görsel kalitesi raporu oluştur
  static async generateQualityReport(file) {
    const qualityInfo = this.checkImageQuality(file);
    const dimensions = await this.checkImageDimensions(file);
    const format = this.getImageFormat(file);

    return {
      file: {
        name: file.name,
        size: file.size,
        type: file.type
      },
      quality: qualityInfo,
      dimensions,
      format,
      timestamp: new Date().toISOString()
    };
  }
} 