// 画像処理ユーティリティ

export interface ImageUploadResult {
  url: string;
  name: string;
  size: number;
  type: string;
}

export class ImageService {
  /**
   * ファイルをBase64データURLに変換
   */
  static async convertToDataUrl(file: File): Promise<ImageUploadResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve({
            url: event.target.result as string,
            name: file.name,
            size: file.size,
            type: file.type
          });
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  }

  /**
   * ファイル形式が有効かチェック
   */
  static isValidImageFile(file: File): boolean {
    const validTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf'
    ];
    
    return validTypes.includes(file.type);
  }

  /**
   * ファイルサイズが制限内かチェック（5MBまで）
   */
  static isValidFileSize(file: File): boolean {
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    return file.size <= maxSizeInBytes;
  }

  /**
   * ファイル検証
   */
  static validateFile(file: File): { isValid: boolean; error?: string } {
    if (!this.isValidImageFile(file)) {
      return {
        isValid: false,
        error: 'サポートされていないファイル形式です。PNG、JPEG、GIF、WebP、PDFのみアップロード可能です。'
      };
    }

    if (!this.isValidFileSize(file)) {
      return {
        isValid: false,
        error: 'ファイルサイズが大きすぎます。5MB以下のファイルをアップロードしてください。'
      };
    }

    return { isValid: true };
  }

  /**
   * 複数ファイルを一括処理
   */
  static async processFiles(files: FileList): Promise<ImageUploadResult[]> {
    const results: ImageUploadResult[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = this.validateFile(file);
      
      if (!validation.isValid) {
        throw new Error(`${file.name}: ${validation.error}`);
      }
      
      const result = await this.convertToDataUrl(file);
      results.push(result);
    }
    
    return results;
  }
}
