import type { MenuSelections, PriceCalculation, BusinessHours } from '../types/form';

export class MenuCalculationService {
  static calculateTotalPrice(selections: MenuSelections): PriceCalculation {
    const menuPrice = selections.selected_menus.reduce((sum, menu) => 
      sum + menu.price, 0);
    
    const optionsPrice = selections.selected_options.reduce((sum, option) => 
      sum + option.price, 0);
    
    const visitFee = selections.visit_option?.price || 0;
    
    return {
      menu_price: menuPrice,
      options_price: optionsPrice,
      visit_fee: visitFee,
      total_price: menuPrice + optionsPrice + visitFee,
      duration_minutes: this.calculateTotalDuration(selections)
    };
  }

  static calculateTotalDuration(selections: MenuSelections): number {
    const menuDuration = selections.selected_menus.reduce((sum, menu) => 
      sum + menu.duration, 0);
    
    const optionsDuration = selections.selected_options.reduce((sum, option) => 
      sum + option.duration, 0);
    
    const visitDuration = selections.visit_option?.duration || 0;
    
    return menuDuration + optionsDuration + visitDuration;
  }

  static validateBusinessHours(dateTime: Date, duration: number, businessHours: BusinessHours): boolean {
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dateTime.getDay()];
    const daySettings = businessHours[dayOfWeek];
    
    if (daySettings?.closed) return false;
    
    const startTime = new Date(dateTime);
    const endTime = new Date(dateTime.getTime() + duration * 60000);
    
    const businessStart = this.parseTime(daySettings?.open || '09:00');
    const businessEnd = this.parseTime(daySettings?.close || '18:00');
    
    return startTime >= businessStart && endTime <= businessEnd;
  }

  static formatPrice(price: number): string {
    return `¥${price.toLocaleString()}`;
  }

  static formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0 && mins > 0) {
      return `${hours}時間${mins}分`;
    } else if (hours > 0) {
      return `${hours}時間`;
    } else {
      return `${mins}分`;
    }
  }

  private static parseTime(timeString: string): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }
}
