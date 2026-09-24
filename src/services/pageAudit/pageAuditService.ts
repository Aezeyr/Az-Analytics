import { PageAuditResult, AuditRecommendation } from '../../types';
import { aiAnalysisService } from '../ai/aiAnalysisService';

export interface UrlValidationResult {
  isValid: boolean;
  sanitizedUrl: string;
  pageHandle: string;
  errorMessage?: string;
}

export function validateFacebookUrl(inputUrl: string): UrlValidationResult {
  const trimmed = (inputUrl || '').trim();
  if (!trimmed) {
    return {
      isValid: false,
      sanitizedUrl: '',
      pageHandle: '',
      errorMessage: 'Please enter a valid Facebook Page URL.',
    };
  }

  // Handle formats like:
  // https://facebook.com/mybusiness
  // https://www.facebook.com/mybusiness/
  // https://facebook.com/pages/category/12345
  // facebook.com/mybusiness
  // @mybusiness
  const urlPattern = /^(https?:\/\/)?(www\.)?facebook\.com\/([a-zA-Z0-9.\-_/]+)\/?$/i;
  const handlePattern = /^@?([a-zA-Z0-9._-]{3,50})$/;

  let sanitized = trimmed;
  let pageHandle = '';

  if (trimmed.startsWith('@')) {
    pageHandle = trimmed.substring(1);
    sanitized = `https://www.facebook.com/${pageHandle}`;
    return { isValid: true, sanitizedUrl: sanitized, pageHandle };
  }

  const urlMatch = trimmed.match(urlPattern);
  if (urlMatch) {
    sanitized = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    pageHandle = urlMatch[3].split('/')[0] || 'page';
    return { isValid: true, sanitizedUrl: sanitized, pageHandle };
  }

  const simpleMatch = trimmed.match(handlePattern);
  if (simpleMatch && !trimmed.includes('/')) {
    pageHandle = simpleMatch[1];
    sanitized = `https://www.facebook.com/${pageHandle}`;
    return { isValid: true, sanitizedUrl: sanitized, pageHandle };
  }

  return {
    isValid: false,
    sanitizedUrl: '',
    pageHandle: '',
    errorMessage: 'Please enter a valid Facebook Page URL (e.g., https://www.facebook.com/yourpage).',
  };
}

class PageAuditService {
  /**
   * Performs an audit on a Facebook Page URL.
   * If real Graph API token is not connected, safely provides realistic demo data.
   */
  public async runPageAudit(url: string, isDemoUser: boolean = true): Promise<PageAuditResult> {
    const validation = validateFacebookUrl(url);
    if (!validation.isValid) {
      throw new Error(validation.errorMessage || 'Invalid Facebook Page URL.');
    }

    // Realistic delay simulating analysis pipeline
    await new Promise((resolve) => setTimeout(resolve, 1400));

    // Derive a readable name from the handle or URL
    const cleanHandle = validation.pageHandle.replace(/[^a-zA-Z0-9]/g, ' ').trim();
    const formattedName = cleanHandle
      ? cleanHandle.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' Official'
      : 'Demo Business Page';

    const overview = {
      pageName: formattedName,
      category: 'E-Commerce & Retail Brand',
      about: `${formattedName} is a customer-centric brand delivering premium quality everyday essentials with fast global shipping and 24/7 dedicated support.`,
      profileCompleteness: 88,
      contactInfo: {
        email: 'contact@example-brand.com',
        phone: '+1 (555) 234-8901',
        address: '742 Evergreen Terrace, Suite 300, Austin, TX',
      },
      website: 'https://example-brand.com',
      hasProfileImage: true,
      hasCoverImage: true,
      followersCount: 42850,
      likesCount: 39620,
      isVerified: true,
    };

    const contentQuality = {
      postingConsistency: 'Moderate' as const,
      postingConsistencyScore: 78,
      captionQualityScore: 82,
      captionQualityNotes: 'Strong narrative hooks and good readability. Paragraph spacing and bullet formatting are well-structured.',
      ctaUsageRate: 64,
      ctaUsageRating: 'Average' as const,
      contentVarietyScore: 84,
      contentVarietyBreakdown: {
        images: 42,
        videos: 28,
        carousels: 18,
        links: 8,
        textOnly: 4,
      },
      visualContentUsage: 'High image and short-form video ratio; carousel adoption shows solid upward momentum.',
      engagementSignals: [
        'High share ratio on educational tutorials',
        'Active community comment responses within 2 hours',
        'Reels outperform single-image posts by 2.3x',
      ],
    };

    const seo = {
      pageNameOptimization: 'Good' as const,
      pageNameNotes: 'Includes clear brand identity. Could benefit from secondary service keyword in title.',
      aboutSectionKeywords: ['sustainable retail', 'customer care', 'quality essentials', 'worldwide delivery'],
      descriptionClarityScore: 86,
      relevantKeywordsIdentified: ['premium essentials', 'eco-friendly products', 'sustainable lifestyle', 'direct-to-consumer'],
      missingKeywordOpportunities: ['free shipping deals', 'curated gift sets', 'new arrivals discounts'],
      callToActionQuality: 'High' as const,
      callToActionNotes: 'Clear "Shop Now" button configured pointing to verified website catalog.',
    };

    const engagement = {
      avgReactions: 485,
      avgComments: 64,
      avgShares: 29,
      engagementRate: 3.42,
      reactionsBreakdown: {
        like: 340,
        love: 110,
        wow: 18,
        haha: 12,
        sad: 2,
        angry: 3,
      },
    };

    const recommendations: AuditRecommendation[] = [
      {
        id: 'rec_1',
        category: 'Content',
        title: 'Increase short-form Reels and video cadence',
        description: 'Video formats account for only 28% of posts but generate over 55% of total reach and shares. Ramp up to at least 3 video posts per week.',
        priority: 'High',
        effort: 'Medium',
      },
      {
        id: 'rec_2',
        category: 'Engagement',
        title: 'Include explicit Call-to-Actions (CTAs) in caption conclusions',
        description: 'Currently 36% of posts lack an explicit next step. Ask direct conversation questions or prompt link clicks to lift engagement rate.',
        priority: 'High',
        effort: 'Quick Win',
      },
      {
        id: 'rec_3',
        category: 'SEO',
        title: 'Incorporate missing transactional keywords in About section',
        description: 'Add terms like "free worldwide shipping" and "curated lifestyle essentials" into the Page bio to improve Facebook Search visibility.',
        priority: 'Medium',
        effort: 'Quick Win',
      },
      {
        id: 'rec_4',
        category: 'Overview',
        title: 'Update Facebook Page cover banner with seasonal promotion',
        description: 'The current cover image has been unchanged for over 90 days. Use this prime real estate to showcase recent collections or testimonials.',
        priority: 'Low',
        effort: 'Quick Win',
      },
    ];

    const aiInsights = aiAnalysisService.generateAuditInsights(overview, contentQuality, seo, engagement);

    // Calculate realistic overall demo score out of 100
    const overallScore = 79;

    return {
      id: 'audit_' + Math.random().toString(36).substring(2, 9),
      userId: isDemoUser ? undefined : 'usr_current',
      pageUrl: validation.sanitizedUrl,
      pageName: overview.pageName,
      auditDate: new Date().toISOString(),
      overallScore,
      isDemoData: true, // Always labeled demo data until live Meta API with official token is connected
      overview,
      contentQuality,
      seo,
      engagement,
      recommendations,
      summary: {
        strengths: aiInsights.keyStrengths,
        weaknesses: aiInsights.priorityFixes,
        headlineInsight: aiInsights.headline,
      },
    };
  }

  /**
   * Returns a ready-to-use sample audit for initial demo mode
   */
  public getSampleDemoAudit(): PageAuditResult {
    return {
      id: 'audit_sample_01',
      pageUrl: 'https://www.facebook.com/demobusinesspage',
      pageName: 'Demo Business Page',
      auditDate: new Date().toISOString(),
      overallScore: 76,
      isDemoData: true,
      overview: {
        pageName: 'Demo Business Page',
        category: 'SaaS & Digital Tools',
        about: 'Demo Business Page provides modern workflow automation and business productivity software for teams worldwide.',
        profileCompleteness: 82,
        contactInfo: {
          email: 'hello@demobusiness.example',
          phone: '+1 (800) 555-0199',
          address: '100 Innovation Way, San Francisco, CA',
        },
        website: 'https://demobusiness.example',
        hasProfileImage: true,
        hasCoverImage: true,
        followersCount: 28450,
        likesCount: 25900,
        isVerified: false,
      },
      contentQuality: {
        postingConsistency: 'Moderate',
        postingConsistencyScore: 74,
        captionQualityScore: 80,
        captionQualityNotes: 'Clear structure with bullet points. Moderate hook strength in the first two lines.',
        ctaUsageRate: 58,
        ctaUsageRating: 'Average',
        contentVarietyScore: 76,
        contentVarietyBreakdown: {
          images: 45,
          videos: 25,
          carousels: 15,
          links: 10,
          textOnly: 5,
        },
        visualContentUsage: 'Clean product mockups; could expand customer case study video format.',
        engagementSignals: ['Strong reaction rate on feature announcements', 'Low comment volume on link-only posts'],
      },
      seo: {
        pageNameOptimization: 'Good',
        pageNameNotes: 'Name is distinct and clear.',
        aboutSectionKeywords: ['automation software', 'team productivity', 'workflow tools'],
        descriptionClarityScore: 80,
        relevantKeywordsIdentified: ['workflow automation', 'productivity tools', 'team collaboration'],
        missingKeywordOpportunities: ['free trial', 'integration guide', 'customer success'],
        callToActionQuality: 'Medium',
        callToActionNotes: 'Standard "Use App" CTA configured.',
      },
      engagement: {
        avgReactions: 310,
        avgComments: 42,
        avgShares: 19,
        engagementRate: 2.85,
        reactionsBreakdown: {
          like: 220,
          love: 68,
          wow: 12,
          haha: 6,
          sad: 2,
          angry: 2,
        },
      },
      recommendations: [
        {
          id: 'rec_s1',
          category: 'Content',
          title: 'Implement structured caption hooks',
          description: 'Front-load value in the first 90 characters before the Facebook "See More" cut-off.',
          priority: 'High',
          effort: 'Quick Win',
        },
        {
          id: 'rec_s2',
          category: 'Engagement',
          title: 'Shift link-heavy updates to carousel or short video formats',
          description: 'Link-only posts suffer an algorithmic reach penalty. Summarize the key takeaway in a carousel and place the link in the comments or top caption.',
          priority: 'High',
          effort: 'Medium',
        },
        {
          id: 'rec_s3',
          category: 'SEO',
          title: 'Add target keyword clusters to Page description',
          description: 'Expand the bio to include explicit industry terms like "team productivity suite" for Facebook graph discovery.',
          priority: 'Medium',
          effort: 'Quick Win',
        },
      ],
      summary: {
        strengths: [
          'Solid baseline branding and clean visual presentation.',
          'Consistently answered user inquiries in comments.',
        ],
        weaknesses: [
          'CTA usage rate is below 60%, leaving engagement opportunities untapped.',
          'Link posts reduce organic algorithmic reach.',
        ],
        headlineInsight: 'Stable operational foundation with significant growth potential through video-first content transitions.',
      },
    };
  }
}

export const pageAuditService = new PageAuditService();
