declare namespace Repobot {
  interface RepobotConfig {
    get: (key: string) => any;
    [key: string]: any;
  }

  type ReportTemplate = 'daily' | 'weekly' | 'monthly' | 'custom';

  interface ReportOptions {
    template?: string;
    [key: string]: any;
  }

  type ReportGenerator = (context: import('../ai/index.js').RepobotContext, options?: ReportOptions) => Promise<string>;

  interface ReportTemplates extends Record<ReportTemplate | string, ReportGenerator> {}
} 