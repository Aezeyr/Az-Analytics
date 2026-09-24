import { CompetitorAnalysisResult, CompetitorComparisonItem } from '../../types';
import { validateFacebookUrl } from '../pageAudit/pageAuditService';

class CompetitorService {
  /**
   * Runs comparative benchmark analysis across primary page and up to 3 competitors.
   * Clearly flags all estimated metrics as DEMO DATA.
   */
  public async analyzeCompetitors(
    primaryUrl: string,
    competitorUrls: string[],
    isDemoUser: boolean = true
  ): Promise<CompetitorAnalysisResult> {
    const primaryValidation = validateFacebookUrl(primaryUrl);
    if (!primaryValidation.isValid) {
      throw new Error(`Primary Page: ${primaryValidation.errorMessage}`);
    }

    const validCompetitorUrls = competitorUrls.filter((u) => u && u.trim().length > 0);
    if (validCompetitorUrls.length === 0) {
      throw new Error('Please provide at least one competitor Facebook Page URL to compare.');
    }

    if (validCompetitorUrls.length > 3) {
      throw new Error('You can compare a maximum of 3 competitors at a time.');
    }

    // Realistic processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const primaryName = primaryValidation.pageHandle
      ? primaryValidation.pageHandle.replace(/[^a-zA-Z0-9]/g, ' ').replace(/^./, (s) => s.toUpperCase()) + ' (Your Page)'
      : 'Demo Business Page (Your Page)';

    const primaryItem: CompetitorComparisonItem = {
      name: primaryName,
      url: primaryValidation.sanitizedUrl,
      isPrimary: true,
      category: 'Software & Technology',
      followers: 28450,
      postingFrequencyWeekly: 3.2,
      avgEngagementRate: 2.85,
      avgReactions: 310,
      avgComments: 42,
      avgShares: 19,
      dominantContentType: 'Images & Infographics',
      captionStyle: 'Short & Punchy',
      ctaUsage: 'Sporadic',
      hashtagStrategy: '1-2 Brand Hashtags',
      audienceSentiment: 'Positive',
      consistencyScore: 74,
    };

    // Synthesize realistic competitor comparison items
    const competitorItems: CompetitorComparisonItem[] = validCompetitorUrls.map((url, idx) => {
      const v = validateFacebookUrl(url);
      const name = v.pageHandle
        ? v.pageHandle.replace(/[^a-zA-Z0-9]/g, ' ').replace(/^./, (s) => s.toUpperCase())
        : `Competitor ${idx + 1}`;

      const profiles = [
        {
          category: 'Software & Cloud Services',
          followers: 64200,
          postingFrequencyWeekly: 5.4,
          avgEngagementRate: 3.65,
          avgReactions: 590,
          avgComments: 88,
          avgShares: 47,
          dominantContentType: 'Short-Form Reels',
          captionStyle: 'Benefit-Driven' as const,
          ctaUsage: 'Always' as const,
          hashtagStrategy: '3-5 Niche Topic Tags',
          audienceSentiment: 'Positive' as const,
          consistencyScore: 91,
        },
        {
          category: 'Digital Productivity',
          followers: 41800,
          postingFrequencyWeekly: 4.1,
          avgEngagementRate: 3.12,
          avgReactions: 420,
          avgComments: 63,
          avgShares: 31,
          dominantContentType: 'Carousels & Guides',
          captionStyle: 'Long-Form Story' as const,
          ctaUsage: 'Frequent' as const,
          hashtagStrategy: 'Industry Community Tags',
          audienceSentiment: 'Mixed' as const,
          consistencyScore: 82,
        },
        {
          category: 'SaaS Solutions',
          followers: 19500,
          postingFrequencyWeekly: 2.5,
          avgEngagementRate: 2.15,
          avgReactions: 180,
          avgComments: 24,
          avgShares: 9,
          dominantContentType: 'Blog Link Previews',
          captionStyle: 'Informative' as const,
          ctaUsage: 'Rare' as const,
          hashtagStrategy: 'None / Minimal',
          audienceSentiment: 'Neutral' as const,
          consistencyScore: 63,
        },
      ];

      const p = profiles[idx % profiles.length];

      return {
        name,
        url: v.sanitizedUrl || url,
        isPrimary: false,
        ...p,
      };
    });

    const allItems = [primaryItem, ...competitorItems];

    return {
      id: 'comp_' + Math.random().toString(36).substring(2, 9),
      userId: isDemoUser ? undefined : 'usr_current',
      primaryPageUrl: primaryValidation.sanitizedUrl,
      createdAt: new Date().toISOString(),
      isDemoData: true,
      competitors: allItems,
      keyInsights: {
        frequentThemes: [
          'Practical step-by-step workflow tutorials and productivity tips',
          'Customer win stories and before-and-after case metrics',
          'Interactive question polls and Friday industry discussions',
          'Feature releases paired with behind-the-scenes engineering videos',
        ],
        ctaPatterns: [
          'Direct invitation to comment thoughts or tag a teammate',
          'Link-in-bio prompt paired with a free download incentive',
          'Question-based close to elicit comments for algorithmic boost',
        ],
        postingConsistencyComparison:
          'Top-performing competitors maintain a steady cadence of 4-5 weekly posts. Your current frequency is 3.2 weekly posts, leaving weekend engagement gaps.',
        commonHashtags: ['#WorkSmarter', '#ProductivityHacks', '#SaaSTools', '#DigitalTransformation', '#TechNews'],
        contentGapsToExplore: [
          'Carousel swipe-decks breaking down industry trends (heavily used by Competitor 2 with 3.12% engagement).',
          'Short video tutorials answering customer FAQ (consistently yields the highest share count across peers).',
          'Dedicated weekly discussion post pinned to the top of the feed to gather community responses.',
        ],
      },
    };
  }

  /**
   * Sample competitor analysis result for instant demonstration
   */
  public getSampleDemoAnalysis(): CompetitorAnalysisResult {
    return {
      id: 'comp_sample_01',
      primaryPageUrl: 'https://www.facebook.com/demobusinesspage',
      createdAt: new Date().toISOString(),
      isDemoData: true,
      competitors: [
        {
          name: 'Demo Business Page (Your Page)',
          url: 'https://www.facebook.com/demobusinesspage',
          isPrimary: true,
          category: 'SaaS & Digital Tools',
          followers: 28450,
          postingFrequencyWeekly: 3.2,
          avgEngagementRate: 2.85,
          avgReactions: 310,
          avgComments: 42,
          avgShares: 19,
          dominantContentType: 'Images & Infographics',
          captionStyle: 'Short & Punchy',
          ctaUsage: 'Sporadic',
          hashtagStrategy: '1-2 Brand Hashtags',
          audienceSentiment: 'Positive',
          consistencyScore: 74,
        },
        {
          name: 'ApexTech Cloud (Competitor 1)',
          url: 'https://www.facebook.com/apextechcloud',
          isPrimary: false,
          category: 'Cloud Services & Dev Tools',
          followers: 64200,
          postingFrequencyWeekly: 5.4,
          avgEngagementRate: 3.65,
          avgReactions: 590,
          avgComments: 88,
          avgShares: 47,
          dominantContentType: 'Short-Form Reels',
          captionStyle: 'Benefit-Driven',
          ctaUsage: 'Always',
          hashtagStrategy: '3-5 Niche Topic Tags',
          audienceSentiment: 'Positive',
          consistencyScore: 91,
        },
        {
          name: 'FlowMatrix Systems (Competitor 2)',
          url: 'https://www.facebook.com/flowmatrix',
          isPrimary: false,
          category: 'Productivity Workflows',
          followers: 41800,
          postingFrequencyWeekly: 4.1,
          avgEngagementRate: 3.12,
          avgReactions: 420,
          avgComments: 63,
          avgShares: 31,
          dominantContentType: 'Carousels & Guides',
          captionStyle: 'Long-Form Story',
          ctaUsage: 'Frequent',
          hashtagStrategy: 'Industry Community Tags',
          audienceSentiment: 'Mixed',
          consistencyScore: 82,
        },
      ],
      keyInsights: {
        frequentThemes: [
          'Actionable productivity cheat sheets and workflow comparisons',
          'Video clips demonstrating time-saving automation triggers',
          'Community spotlights celebrating customer milestones',
        ],
        ctaPatterns: [
          'High-performing competitors always provide an explicit prompt ("Save this guide for later", "What automation do you need most?")',
          'Minimizing outbound link penalties by placing download links in first comments',
        ],
        postingConsistencyComparison:
          'ApexTech Cloud posts 5.4 times weekly (including Tuesday and Thursday afternoon slots) which captures 40% higher share volume.',
        commonHashtags: ['#ProductivityTips', '#WorkflowAutomation', '#TechLeadership', '#FutureOfWork'],
        contentGapsToExplore: [
          'Short video reels showcasing 30-second workflow hacks',
          'Educational swipe carousels on Monday mornings',
          'Open debate questions on Friday afternoons to spur organic commenting',
        ],
      },
    };
  }
}

export const competitorService = new CompetitorService();
