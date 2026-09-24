export type ReportType = 'audit' | 'competitor' | 'performance';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  createdAt: string;
  role?: string;
  isDemoUser?: boolean;
}

export interface FacebookPageOverview {
  pageName: string;
  category: string;
  about: string;
  profileCompleteness: number; // 0 - 100
  contactInfo: {
    email?: string;
    phone?: string;
    address?: string;
  };
  website?: string;
  hasProfileImage: boolean;
  hasCoverImage: boolean;
  followersCount: number;
  likesCount: number;
  isVerified: boolean;
}

export interface ContentQualityAudit {
  postingConsistency: 'High' | 'Moderate' | 'Low' | 'Inconsistent';
  postingConsistencyScore: number; // 0 - 100
  captionQualityScore: number; // 0 - 100
  captionQualityNotes: string;
  ctaUsageRate: number; // e.g. 75%
  ctaUsageRating: 'Strong' | 'Average' | 'Needs Improvement';
  contentVarietyScore: number; // 0 - 100
  contentVarietyBreakdown: {
    images: number;
    videos: number;
    carousels: number;
    links: number;
    textOnly: number;
  };
  visualContentUsage: string;
  engagementSignals: string[];
}

export interface SeoAudit {
  pageNameOptimization: 'Good' | 'Average' | 'Needs Improvement';
  pageNameNotes: string;
  aboutSectionKeywords: string[];
  descriptionClarityScore: number; // 0 - 100
  relevantKeywordsIdentified: string[];
  missingKeywordOpportunities: string[];
  callToActionQuality: 'High' | 'Medium' | 'Low';
  callToActionNotes: string;
}

export interface EngagementMetrics {
  avgReactions: number;
  avgComments: number;
  avgShares: number;
  engagementRate: number; // percentage
  reactionsBreakdown: {
    like: number;
    love: number;
    wow: number;
    haha: number;
    sad: number;
    angry: number;
  };
}

export interface AuditRecommendation {
  id: string;
  category: 'Overview' | 'Content' | 'SEO' | 'Engagement';
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  effort: 'Quick Win' | 'Medium' | 'Strategic';
}

export interface PageAuditResult {
  id: string;
  userId?: string;
  pageUrl: string;
  pageName: string;
  auditDate: string;
  overallScore: number;
  isDemoData: boolean;
  overview: FacebookPageOverview;
  contentQuality: ContentQualityAudit;
  seo: SeoAudit;
  engagement: EngagementMetrics;
  recommendations: AuditRecommendation[];
  summary: {
    strengths: string[];
    weaknesses: string[];
    headlineInsight: string;
  };
}

export interface CompetitorComparisonItem {
  name: string;
  url: string;
  isPrimary: boolean;
  category: string;
  followers: number;
  postingFrequencyWeekly: number;
  avgEngagementRate: number;
  avgReactions: number;
  avgComments: number;
  avgShares: number;
  dominantContentType: string;
  captionStyle: 'Short & Punchy' | 'Long-Form Story' | 'Benefit-Driven' | 'Informative';
  ctaUsage: 'Always' | 'Frequent' | 'Sporadic' | 'Rare';
  hashtagStrategy: string;
  audienceSentiment: 'Positive' | 'Neutral' | 'Mixed';
  consistencyScore: number;
}

export interface CompetitorAnalysisResult {
  id: string;
  userId?: string;
  primaryPageUrl: string;
  createdAt: string;
  isDemoData: boolean;
  competitors: CompetitorComparisonItem[];
  keyInsights: {
    frequentThemes: string[];
    ctaPatterns: string[];
    postingConsistencyComparison: string;
    commonHashtags: string[];
    contentGapsToExplore: string[];
  };
}

export interface PostPerformanceItem {
  id: string;
  publishedAt: string;
  type: 'Video' | 'Image' | 'Carousel' | 'Link' | 'Text';
  captionSnippet: string;
  reactions: number;
  comments: number;
  shares: number;
  engagementRate: number;
  ctaPresent: boolean;
}

export interface PerformanceReportResult {
  id: string;
  userId?: string;
  reportName: string;
  pageName: string;
  pageUrl: string;
  dateRangeLabel: '7 Days' | '30 Days' | '90 Days' | 'Custom';
  startDate: string;
  endDate: string;
  createdAt: string;
  isDemoData: boolean;
  summary: {
    totalPosts: number;
    avgEngagementRate: number;
    avgReactions: number;
    avgComments: number;
    avgShares: number;
    postingFrequency: string;
  };
  engagementTrend: {
    date: string;
    reactions: number;
    comments: number;
    shares: number;
    rate: number;
  }[];
  postsOverTime: {
    date: string;
    posts: number;
  }[];
  contentTypeDistribution: {
    type: 'Video' | 'Image' | 'Carousel' | 'Link' | 'Text';
    count: number;
    percentage: number;
    avgEngagementRate: number;
  }[];
  bestPerformingPosts: PostPerformanceItem[];
  recommendations: string[];
}

export interface SavedReportRecord {
  id: string;
  userId: string;
  reportName: string;
  reportType: ReportType;
  dateCreated: string;
  dateRange?: string;
  pageName: string;
  pageUrl: string;
  status: 'Ready' | 'Archived';
  data: PageAuditResult | CompetitorAnalysisResult | PerformanceReportResult;
  isDemoData: boolean;
}

export interface UserSettings {
  emailNotifications: boolean;
  weeklyDigest: boolean;
  reportExportFormat: 'PDF' | 'CSV';
  preferredTheme: 'light' | 'dark' | 'system';
}
