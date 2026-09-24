import { SavedReportRecord, UserSettings } from '../../types';

const REPORTS_STORAGE_PREFIX = 'az_reports_';
const SETTINGS_STORAGE_PREFIX = 'az_settings_';

export interface DashboardStats {
  totalAudits: number;
  savedReports: number;
  competitorsTracked: number;
  lastAnalysisDate: string | null;
}

export interface ActivityItem {
  id: string;
  type: 'audit' | 'competitor' | 'performance';
  title: string;
  description: string;
  timestamp: string;
  pageName: string;
  isDemo: boolean;
}

class DatabaseService {
  private getUserReportsKey(userId: string): string {
    return `${REPORTS_STORAGE_PREFIX}${userId}`;
  }

  private getUserSettingsKey(userId: string): string {
    return `${SETTINGS_STORAGE_PREFIX}${userId}`;
  }

  /**
   * Retrieves all saved reports belonging strictly to this user.
   * Maps to: SELECT * FROM performance_reports / page_audits WHERE user_id = auth.uid()
   */
  public async getSavedReports(userId: string): Promise<SavedReportRecord[]> {
    if (!userId) return [];
    try {
      const data = localStorage.getItem(this.getUserReportsKey(userId));
      if (!data) return [];
      const parsed: SavedReportRecord[] = JSON.parse(data);
      // Ensure records strictly match current user
      return parsed.filter((r) => r.userId === userId).sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());
    } catch {
      return [];
    }
  }

  /**
   * Saves a new report for the authenticated user.
   * Maps to: INSERT INTO page_audits / performance_reports (user_id, ...) VALUES (auth.uid(), ...)
   */
  public async saveReport(
    report: Omit<SavedReportRecord, 'id' | 'dateCreated'>
  ): Promise<SavedReportRecord> {
    const newRecord: SavedReportRecord = {
      ...report,
      id: 'rep_' + Math.random().toString(36).substring(2, 10),
      dateCreated: new Date().toISOString(),
    };

    const currentReports = await this.getSavedReports(report.userId);
    const updated = [newRecord, ...currentReports];
    localStorage.setItem(this.getUserReportsKey(report.userId), JSON.stringify(updated));

    return newRecord;
  }

  /**
   * Deletes a report for the current user.
   * Maps to: DELETE FROM reports WHERE id = reportId AND user_id = auth.uid()
   */
  public async deleteReport(userId: string, reportId: string): Promise<boolean> {
    const currentReports = await this.getSavedReports(userId);
    const filtered = currentReports.filter((r) => r.id !== reportId && r.userId === userId);
    localStorage.setItem(this.getUserReportsKey(userId), JSON.stringify(filtered));
    return true;
  }

  /**
   * Retrieves aggregate dashboard metrics for the user
   */
  public async getDashboardStats(userId: string): Promise<DashboardStats> {
    const reports = await this.getSavedReports(userId);

    const audits = reports.filter((r) => r.reportType === 'audit');
    const competitors = reports.filter((r) => r.reportType === 'competitor');

    let lastDate: string | null = null;
    if (reports.length > 0) {
      lastDate = reports[0].dateCreated;
    }

    return {
      totalAudits: audits.length,
      savedReports: reports.length,
      competitorsTracked: competitors.length > 0 ? competitors.length * 3 : 0,
      lastAnalysisDate: lastDate,
    };
  }

  /**
   * Retrieves user activity items
   */
  public async getRecentActivities(userId: string): Promise<ActivityItem[]> {
    const reports = await this.getSavedReports(userId);
    return reports.slice(0, 5).map((r) => ({
      id: r.id,
      type: r.reportType,
      title: r.reportName,
      description: `Analysis completed for ${r.pageName} (${r.reportType.toUpperCase()})`,
      timestamp: r.dateCreated,
      pageName: r.pageName,
      isDemo: r.isDemoData,
    }));
  }

  /**
   * Retrieves user settings
   */
  public async getUserSettings(userId: string): Promise<UserSettings> {
    const defaultSettings: UserSettings = {
      emailNotifications: true,
      weeklyDigest: true,
      reportExportFormat: 'PDF',
      preferredTheme: 'light',
    };

    if (!userId) return defaultSettings;
    try {
      const data = localStorage.getItem(this.getUserSettingsKey(userId));
      return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  }

  /**
   * Updates user settings
   */
  public async updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettings> {
    const current = await this.getUserSettings(userId);
    const updated = { ...current, ...settings };
    localStorage.setItem(this.getUserSettingsKey(userId), JSON.stringify(updated));
    return updated;
  }
}

export const databaseService = new DatabaseService();
