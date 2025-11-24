import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule'; 
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);
  private readonly exportsDir = path.resolve('./exports');
  private readonly FILE_RETENTION_DAYS = 7;

  /**
   * Runs every day at 2:00 AM to clean old files
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async scheduledCleanup(): Promise<void> {
    this.logger.log('Running scheduled cleanup of old export files...');
    await this.cleanupOldExports();
  }

  /**
   * Delete export files older than 7 days
   */
  async cleanupOldExports(): Promise<void> {
    try {
      if (!fs.existsSync(this.exportsDir)) {
        this.logger.warn('Exports directory does not exist');
        return;
      }

      const files = fs.readdirSync(this.exportsDir);
      const now = Date.now();
      const maxAge = this.FILE_RETENTION_DAYS * 24 * 60 * 60 * 1000; // 7 days in ms

      let deletedCount = 0;

      for (const file of files) {
        const filePath = path.join(this.exportsDir, file);
        const stats = fs.statSync(filePath);

        // Check if file is older than retention period
        if (now - stats.mtimeMs > maxAge) {
          fs.unlinkSync(filePath);
          deletedCount++;
          this.logger.log(`Deleted old export file: ${file}`);
        }
      }

      if (deletedCount > 0) {
        this.logger.log(`Cleanup completed: ${deletedCount} file(s) deleted`);
      } else {
        this.logger.log('No old files to delete');
      }
    } catch (error) {
      this.logger.error('Cleanup failed:', error);
    }
  }

  /**
   * Get list of all export files with metadata
   */
  async getExportHistory(): Promise<Array<{
    filename: string;
    size: number;
    createdAt: Date;
  }>> {
    try {
      if (!fs.existsSync(this.exportsDir)) {
        return [];
      }

      const files = fs.readdirSync(this.exportsDir);
      
      return files.map(file => {
        const filePath = path.join(this.exportsDir, file);
        const stats = fs.statSync(filePath);
        
        return {
          filename: file,
          size: stats.size,
          createdAt: stats.birthtime,
        };
      }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Newest first
    } catch (error) {
      this.logger.error('Failed to get export history:', error);
      return [];
    }
  }
}