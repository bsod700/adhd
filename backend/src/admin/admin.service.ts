import { Injectable } from '@nestjs/common';
import { AdminDashboardStats } from '@adhd-dashboard/shared-types';

@Injectable()
export class AdminService {
  async getDashboardStats(): Promise<AdminDashboardStats> {
    // Mock admin dashboard stats
    return {
      users: {
        total: 1250,
        active: 980,
        newThisMonth: 125,
        growth: 12.5
      },
      organizations: {
        total: 45,
        active: 42,
        newThisMonth: 3,
        growth: 7.1
      },
      tasks: {
        total: 15680,
        completedThisMonth: 3250,
        averageCompletionTime: 2.5,
        completionRate: 78.5
      },
      ai: {
        suggestionsGenerated: 8920,
        acceptanceRate: 65.3,
        topSuggestionTypes: [
          { type: 'task_creation', count: 3456 },
          { type: 'task_prioritization', count: 2789 },
          { type: 'productivity_tip', count: 1892 }
        ]
      },
      system: {
        uptime: 99.9,
        responseTime: 125,
        errorRate: 0.2,
        storageUsed: 2.3 * 1024 * 1024 * 1024 // 2.3 GB
      }
    };
  }
} 