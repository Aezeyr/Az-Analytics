import { PerformanceReportResult, PostPerformanceItem } from '../../types';

class PerformanceReportService {
  /**
   * Generates a date-range performance report for a page.
   */
  public async generateReport(
    pageUrl: string,
    rangePreset: '7 Days' | '30 Days' | '90 Days' | 'Custom',
    customStart?: string,
    customEnd?: string,
    isDemoUser: boolean = true
  ): Promise<PerformanceReportResult> {
    // Simulate generation delay
    await new Promise((resolve) => setTimeout(resolve, 1300));

    const today = new Date();
    let days = 30;
    if (rangePreset === '7 Days') days = 7;
    else if (rangePreset === '90 Days') days = 90;
    else if (rangePreset === 'Custom' && customStart && customEnd) {
      const diffMs = Math.abs(new Date(customEnd).getTime() - new Date(customStart).getTime());
      days = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    }

    const startDate = customStart || new Date(today.getTime() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = customEnd || today.toISOString().split('T')[0];

    // Calculate realistic post counts and metrics
    const postsPerWeek = 3.4;
    const estimatedTotalPosts = Math.max(2, Math.round((days / 7) * postsPerWeek));

    // Generate trend data points
    const pointsCount = Math.min(days, 14);
    const step = Math.max(1, Math.floor(days / pointsCount));
    const trendData = [];
    const postsOverTimeData = [];

    let totalReactionsAccum = 0;
    let totalCommentsAccum = 0;
    let totalSharesAccum = 0;

    for (let i = pointsCount - 1; i >= 0; i--) {
      const d = new Date(today.getTime() - i * step * 24 * 60 * 60 * 1000);
      const dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Daily simulated engagement
      const rx = Math.floor(180 + Math.sin(i * 0.8) * 120 + Math.random() * 80);
      const cm = Math.floor(25 + Math.cos(i * 0.7) * 20 + Math.random() * 15);
      const sh = Math.floor(12 + Math.sin(i * 0.5) * 10 + Math.random() * 8);
      const rate = Number(((rx + cm + sh) / 10000 * 100).toFixed(2));

      totalReactionsAccum += rx;
      totalCommentsAccum += cm;
      totalSharesAccum += sh;

      trendData.push({
        date: dateLabel,
        reactions: rx,
        comments: cm,
        shares: sh,
        rate,
      });

      const dayPosts = (i % 2 === 0 || i % 3 === 0) ? Math.floor(1 + Math.random() * 2) : 0;
      postsOverTimeData.push({
        date: dateLabel,
        posts: dayPosts,
      });
    }

    const avgRx = Math.round(totalReactionsAccum / pointsCount);
    const avgCm = Math.round(totalCommentsAccum / pointsCount);
    const avgSh = Math.round(totalSharesAccum / pointsCount);
    const avgRate = Number(((avgRx + avgCm + avgSh) / 10000 * 100).toFixed(2));

    const sampleBestPosts: PostPerformanceItem[] = [
      {
        id: 'post_01',
        publishedAt: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'Video',
        captionSnippet: '5 Quick Automation Hacks that save 10+ hours every week. Which one will you implement first?',
        reactions: 680,
        comments: 114,
        shares: 62,
        engagementRate: 4.82,
        ctaPresent: true,
      },
      {
        id: 'post_02',
        publishedAt: new Date(today.getTime() - 11 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'Carousel',
        captionSnippet: 'Before vs After: How team efficiency transformed in 30 days. Swipe through the exact playbook.',
        reactions: 495,
        comments: 72,
        shares: 38,
        engagementRate: 3.56,
        ctaPresent: true,
      },
      {
        id: 'post_03',
        publishedAt: new Date(today.getTime() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'Image',
        captionSnippet: 'Behind the scenes at our product lab building our most requested feature update.',
        reactions: 390,
        comments: 54,
        shares: 18,
        engagementRate: 2.84,
        ctaPresent: false,
      },
      {
        id: 'post_04',
        publishedAt: new Date(today.getTime() - 24 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'Link',
        captionSnippet: 'Read our comprehensive 2026 industry benchmark analysis on the company blog.',
        reactions: 210,
        comments: 26,
        shares: 9,
        engagementRate: 1.52,
        ctaPresent: true,
      },
    ];

    const distribution = [
      { type: 'Video' as const, count: Math.round(estimatedTotalPosts * 0.35), percentage: 35, avgEngagementRate: 4.45 },
      { type: 'Carousel' as const, count: Math.round(estimatedTotalPosts * 0.25), percentage: 25, avgEngagementRate: 3.48 },
      { type: 'Image' as const, count: Math.round(estimatedTotalPosts * 0.25), percentage: 25, avgEngagementRate: 2.76 },
      { type: 'Link' as const, count: Math.round(estimatedTotalPosts * 0.10), percentage: 10, avgEngagementRate: 1.48 },
      { type: 'Text' as const, count: Math.round(estimatedTotalPosts * 0.05), percentage: 5, avgEngagementRate: 1.95 },
    ];

    return {
      id: 'rep_' + Math.random().toString(36).substring(2, 9),
      userId: isDemoUser ? undefined : 'usr_current',
      reportName: `Performance Report: ${rangePreset} (${startDate} to ${endDate})`,
      pageName: 'Demo Business Page',
      pageUrl: pageUrl || 'https://www.facebook.com/demobusinesspage',
      dateRangeLabel: rangePreset,
      startDate,
      endDate,
      createdAt: new Date().toISOString(),
      isDemoData: true,
      summary: {
        totalPosts: estimatedTotalPosts,
        avgEngagementRate: avgRate,
        avgReactions: avgRx,
        avgComments: avgCm,
        avgShares: avgSh,
        postingFrequency: `${postsPerWeek} posts / week`,
      },
      engagementTrend: trendData,
      postsOverTime: postsOverTimeData,
      contentTypeDistribution: distribution,
      bestPerformingPosts: sampleBestPosts,
      recommendations: [
        'Short-form videos generated a 4.45% average engagement rate, outperforming static images by 1.6x. Double video post volume.',
        'Carousel formats drive the strongest save and share retention. Allocate at least 1 carousel per week for in-depth educational breakdowns.',
        'Link posts recorded the lowest engagement (1.48%). Instead of direct outbound links in the post body, deliver key insights visually and provide the link in top pinned comment.',
        'Posts published between 1:00 PM and 3:00 PM EST exhibited 22% higher 2-hour reaction velocity.',
      ],
    };
  }

  /**
   * Sample performance report for initial demo preview
   */
  public getSampleDemoReport(): PerformanceReportResult {
    const today = new Date();
    const startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];

    return {
      id: 'perf_sample_01',
      reportName: 'Performance Report: 30 Days (Demo Business Page)',
      pageName: 'Demo Business Page',
      pageUrl: 'https://www.facebook.com/demobusinesspage',
      dateRangeLabel: '30 Days',
      startDate,
      endDate,
      createdAt: new Date().toISOString(),
      isDemoData: true,
      summary: {
        totalPosts: 15,
        avgEngagementRate: 3.18,
        avgReactions: 342,
        avgComments: 48,
        avgShares: 22,
        postingFrequency: '3.5 posts / week',
      },
      engagementTrend: [
        { date: 'Day 1', reactions: 210, comments: 28, shares: 14, rate: 2.2 },
        { date: 'Day 4', reactions: 290, comments: 41, shares: 18, rate: 2.8 },
        { date: 'Day 7', reactions: 410, comments: 65, shares: 32, rate: 3.9 },
        { date: 'Day 10', reactions: 310, comments: 44, shares: 19, rate: 2.9 },
        { date: 'Day 14', reactions: 480, comments: 72, shares: 38, rate: 4.2 },
        { date: 'Day 18', reactions: 340, comments: 49, shares: 21, rate: 3.1 },
        { date: 'Day 22', reactions: 520, comments: 84, shares: 45, rate: 4.6 },
        { date: 'Day 26', reactions: 390, comments: 55, shares: 24, rate: 3.4 },
        { date: 'Day 30', reactions: 460, comments: 68, shares: 30, rate: 3.8 },
      ],
      postsOverTime: [
        { date: 'Week 1', posts: 4 },
        { date: 'Week 2', posts: 3 },
        { date: 'Week 3', posts: 4 },
        { date: 'Week 4', posts: 4 },
      ],
      contentTypeDistribution: [
        { type: 'Video', count: 6, percentage: 40, avgEngagementRate: 4.25 },
        { type: 'Carousel', count: 4, percentage: 27, avgEngagementRate: 3.4 },
        { type: 'Image', count: 3, percentage: 20, avgEngagementRate: 2.65 },
        { type: 'Link', count: 2, percentage: 13, avgEngagementRate: 1.4 },
      ],
      bestPerformingPosts: [
        {
          id: 'post_s1',
          publishedAt: '2026-09-18T14:30:00Z',
          type: 'Video',
          captionSnippet: '3 Simple Workflow Triggers that streamline customer onboarding. Watch how our team configured this in under 2 minutes.',
          reactions: 580,
          comments: 92,
          shares: 48,
          engagementRate: 4.6,
          ctaPresent: true,
        },
        {
          id: 'post_s2',
          publishedAt: '2026-09-12T10:15:00Z',
          type: 'Carousel',
          captionSnippet: 'Step-by-step checklist: The 5 critical metrics every marketing manager should monitor weekly.',
          reactions: 420,
          comments: 64,
          shares: 31,
          engagementRate: 3.75,
          ctaPresent: true,
        },
      ],
      recommendations: [
        'Shift posting budget towards video formats: Reels and tutorials drove 40% of posts and over 55% of total engagement.',
        'Boost comments by ending educational carousel posts with an interactive poll or opinion question.',
        'Repurpose low-engagement links into visual summary infographics with download instructions in the comments.',
      ],
    };
  }
}

export const performanceReportService = new PerformanceReportService();
