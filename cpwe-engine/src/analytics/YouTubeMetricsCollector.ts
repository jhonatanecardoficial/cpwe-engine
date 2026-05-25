import { YouTubeIntegrationService } from '../youtube/YouTubeIntegrationService';

export class YouTubeMetricsCollector {
  constructor(private ytService: YouTubeIntegrationService) {}

  /**
   * Ingests real metrics from YouTube to create the feedback loop.
   */
  public async fetchVideoMetrics(videoId: string, startDate: string, endDate: string) {
    const analytics = this.ytService.getYouTubeAnalyticsClient();
    
    // Ingests views, watch time, subscribers, and revenue metrics
    const response = await analytics.reports.query({
      ids: 'channel==MINE',
      startDate,
      endDate,
      metrics: 'views,estimatedMinutesWatched,averageViewDuration,subscribersGained,estimatedRevenue',
      filters: `video==${videoId}`,
    });

    return response.data;
  }
}
