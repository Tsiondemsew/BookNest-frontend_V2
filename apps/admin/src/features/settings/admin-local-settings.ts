export const ADMIN_LOCAL_SETTINGS_KEY = 'admin-console-local';

export type AdminLocalSettings = {
  compactTables: boolean;
  defaultSidebarCollapsed: boolean;
  showDashboardTips: boolean;
  confirmDestructiveActions: boolean;
};

export const DEFAULT_LOCAL_SETTINGS: AdminLocalSettings = {
  compactTables: false,
  defaultSidebarCollapsed: false,
  showDashboardTips: true,
  confirmDestructiveActions: true,
};

export function readLocalSettings(): AdminLocalSettings {
  if (typeof window === 'undefined') return DEFAULT_LOCAL_SETTINGS;
  try {
    const raw = localStorage.getItem(ADMIN_LOCAL_SETTINGS_KEY);
    if (!raw) return DEFAULT_LOCAL_SETTINGS;
    return { ...DEFAULT_LOCAL_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_LOCAL_SETTINGS;
  }
}

export function writeLocalSettings(patch: Partial<AdminLocalSettings>) {
  const next = { ...readLocalSettings(), ...patch };
  localStorage.setItem(ADMIN_LOCAL_SETTINGS_KEY, JSON.stringify(next));
  return next;
}
