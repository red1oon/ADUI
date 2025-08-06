export class QRService {
  static parseQRData(data: string): any {
    try {
      // Try to parse as JSON first
      return JSON.parse(data);
    } catch {
      // If not JSON, return as simple string
      return { value: data, scannedAt: new Date().toISOString() };
    }
  }

  static formatQRData(data: any): string {
    if (typeof data === 'string') {
      return data;
    }
    return data.value || JSON.stringify(data);
  }

  static validateQRCode(data: string, pattern?: string): boolean {
    if (!pattern) return true;
    
    try {
      const regex = new RegExp(pattern);
      return regex.test(data);
    } catch {
      return true; // If pattern is invalid, accept all
    }
  }
}
