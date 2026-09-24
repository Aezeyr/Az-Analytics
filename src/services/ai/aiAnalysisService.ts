import {
  AuditRecommendation,
  CompetitorComparisonItem,
  FacebookPageOverview,
  ContentQualityAudit,
  SeoAudit,
  EngagementMetrics,
  PerformanceReportResult
} from '../../types';

export interface GeneratedAiInsights {
  headline: string;
  keyStrengths: string[];
  priorityFixes: string[];
  strategicAdvice: string;
  provider: 'local_heuristic_ai' | 'gemini_proxy_ready';
}

class AiAnalysisService {
  /**
   * Evaluates structured Page Audit data and derives contextual audit insights and recommendations.
   * Does NOT fabricate metrics or claim live Meta scraping.
   */
  public generateAuditInsights(
    overview: FacebookPageOverview,
    content: ContentQualityAudit,
    seo: SeoAudit,
    _engagement: EngagementMetrics
  ): GeneratedAiInsights {
    const strengths: string[] = [];
    const fixes: string[] = [];

    // Heuristic assessment on overview
    if (overview.profileCompleteness >= 85) {
      strengths.push('Complete business profile with verified contact links and clear category categorization.');
    } else {
      fixes.push(`Profile completeness is at ${overview.profileCompleteness}%. Add official contact details and website to boost organic search presence.`);
    }

    // Heuristic assessment on content
    if (content.ctaUsageRate >= 70) {
      strengths.push(`High Call-To-Action (CTA) presence (${content.ctaUsageRate}%) encouraging audience interaction.`);
    } else {
      fixes.push('CTA usage is below optimal thresholds. Conclude key posts with explicit next steps (e.g., Learn More, Comment Below).');
    }

    if (content.contentVarietyBreakdown.videos > 20) {
      strengths.push('Healthy proportion of video content, maximizing Meta algorithm reach and dwell time.');
    } else {
      fixes.push('Video content constitutes a minority of post formats. Incorporating short-form reels/videos improves algorithmic distribution.');
    }

    // Heuristic assessment on SEO
    if (seo.pageNameOptimization === 'Good') {
      strengths.push('Page title contains clear niche keywords for discovery.');
    } else {
      fixes.push('Enhance page category and description with high-intent localized search terms.');
    }

    if (seo.relevantKeywordsIdentified.length > 0) {
      strengths.push(`Strong core keyword clusters identified: ${seo.relevantKeywordsIdentified.slice(0, 3).join(', ')}.`);
    } else {
      fixes.push('Insufficient data available for this metric. Add primary service keywords to the About section.');
    }

    const headline = fixes.length === 0
      ? 'Well-optimized profile showing solid foundational content and branding discipline.'
      : `Identified ${fixes.length} high-leverage opportunities to enhance reach and audience engagement.`;

    const strategicAdvice = `Prioritize video storytelling and explicit action hooks. Maintain a 3-4 post weekly rhythm to consolidate organic brand recall.`;

    return {
      headline,
      keyStrengths: strengths.length > 0 ? strengths : ['Standard baseline profile presence.'],
      priorityFixes: fixes.length > 0 ? fixes : ['Continue monitoring weekly engagement trends.'],
      strategicAdvice,
      provider: 'local_heuristic_ai',
    };
  }

  /**
   * Derives actionable competitor insights by comparing metrics without inventing data.
   */
  public generateCompetitorObservations(
    primary: CompetitorComparisonItem,
    competitors: CompetitorComparisonItem[]
  ): {
    headline: string;
    gapObservations: string[];
    actionableSuggestions: string[];
  } {
    const gapObservations: string[] = [];
    const actionableSuggestions: string[] = [];

    const avgCompetitorFreq = competitors.length > 0
      ? competitors.reduce((acc, c) => acc + c.postingFrequencyWeekly, 0) / competitors.length
      : 0;

    if (primary.postingFrequencyWeekly < avgCompetitorFreq) {
      gapObservations.push(
        `Competitors post an average of ${avgCompetitorFreq.toFixed(1)} times/week versus your ${primary.postingFrequencyWeekly} times/week.`
      );
      actionableSuggestions.push('Increase post frequency by 1-2 weekly slots focusing on community Q&As and behind-the-scenes clips.');
    } else {
      gapObservations.push(`Your posting rhythm (${primary.postingFrequencyWeekly}x/week) matches or exceeds competitor cadence.`);
    }

    // Video dominance check
    const videoDominantCompetitors = competitors.filter((c) => c.dominantContentType.toLowerCase().includes('video'));
    if (videoDominantCompetitors.length > 0 && !primary.dominantContentType.toLowerCase().includes('video')) {
      gapObservations.push('Leading competitors utilize short-form video as their primary driver for engagement spikes.');
      actionableSuggestions.push('Pilot 3 video formats: customer spotlight, tutorial snippets, and industry commentary.');
    }

    // Caption style comparison
    const storyTellers = competitors.filter((c) => c.captionStyle.includes('Story'));
    if (storyTellers.length > 0) {
      gapObservations.push('Competitors with higher comment counts leverage conversational storytelling rather than direct selling.');
      actionableSuggestions.push('Adopt open-ended conversation starters in top-funnel awareness posts.');
    }

    return {
      headline: 'Competitive Landscape Analysis: Content Cadence & Format Disparities',
      gapObservations,
      actionableSuggestions,
    };
  }

  /**
   * Generates performance summary based on date-range metrics
   */
  public generatePerformanceSummary(report: PerformanceReportResult): string[] {
    const summary: string[] = [];

    if (report.summary.totalPosts === 0) {
      return ['Insufficient post activity recorded during this time window to establish meaningful trends.'];
    }

    summary.push(`Published ${report.summary.totalPosts} posts during this ${report.dateRangeLabel.toLowerCase()} period.`);
    summary.push(`Achieved an average engagement rate of ${report.summary.avgEngagementRate}% across available content.`);

    const topContentType = [...report.contentTypeDistribution].sort((a, b) => b.avgEngagementRate - a.avgEngagementRate)[0];
    if (topContentType) {
      summary.push(
        `${topContentType.type} content generated the highest relative audience interest at ${topContentType.avgEngagementRate}% engagement rate.`
      );
    }

    return summary;
  }
}

export const aiAnalysisService = new AiAnalysisService();
