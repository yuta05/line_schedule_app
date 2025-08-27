// Config loader for frontend
export type MenuConfig = {
  visitAdjustMinutes: { first: number; repeat: number };
  menus: Array<{ name: string; minutes: number }>;
  options: Array<{ name: string; minutes: number }>;
};

export type RulesConfig = {
  businessHours: Record<string, string[]>;
  lastAcceptableEnd: string;
  maxParallel: number;
  maxFutureDays: number;
  cancelLimitHours: number;
};

export type UIConfig = {
  notice: string;
  consent: string;
  messages: {
    submitSuccess: string;
  };
};

// Static imports for dev config (in production, these would be fetched)
import menuConfigDev from '../../../packages/config/dev/menu.json';
import rulesConfigDev from '../../../packages/config/dev/rules.json';
import uiConfigDev from '../../../packages/config/dev/ui.json';

export const getMenuConfig = (): MenuConfig => menuConfigDev as MenuConfig;
export const getRulesConfig = (): RulesConfig => rulesConfigDev as RulesConfig;
export const getUIConfig = (): UIConfig => uiConfigDev as UIConfig;

export function calculateTotalMinutes(
  visitCount: '1回目〈30分〉' | '2回目以降〈0分〉' | '',
  selectedMenus: string[],
  selectedOptions: string[]
): number {
  const menuConfig = getMenuConfig();
  
  const visitMinutes = visitCount === '1回目〈30分〉' 
    ? menuConfig.visitAdjustMinutes.first 
    : menuConfig.visitAdjustMinutes.repeat;
  
  const menuMinutes = selectedMenus.reduce((sum, menuName) => {
    const menu = menuConfig.menus.find(m => m.name === menuName);
    return sum + (menu?.minutes || 0);
  }, 0);
  
  const optionMinutes = selectedOptions.reduce((sum, optionName) => {
    const option = menuConfig.options.find(o => o.name === optionName);
    return sum + (option?.minutes || 0);
  }, 0);
  
  return visitMinutes + menuMinutes + optionMinutes;
}

export function parseLastAcceptableEnd(): { hours: number; minutes: number } {
  const rules = getRulesConfig();
  const [h, m] = rules.lastAcceptableEnd.split(':').map(Number);
  return { hours: h, minutes: m };
}
