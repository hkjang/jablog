import { Controller, Get, Post, Param, Query, Res, ParseIntPipe } from '@nestjs/common';
import type { Response } from 'express';
import { ReportsService } from './reports.service';


@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /**
   * GET /reports
   * Get all reports with pagination
   */
  @Get()
  async getReports(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reportsService.getReports(
      page ? parseInt(page) : undefined,
      limit ? parseInt(limit) : undefined,
    );
  }

  /**
   * GET /reports/:id
   * Get single report
   */
  @Get(':id')
  async getReport(@Param('id', ParseIntPipe) id: number) {
    return this.reportsService.getReport(id);
  }

  /**
   * POST /reports/generate/weekly
   * Generate weekly report
   */
  @Post('generate/weekly')
  async generateWeeklyReport() {
    return this.reportsService.generateWeeklyReport();
  }

  /**
   * POST /reports/generate/monthly
   * Generate monthly report
   */
  @Post('generate/monthly')
  async generateMonthlyReport() {
    return this.reportsService.generateMonthlyReport();
  }

  /**
   * GET /reports/:id/download
   * Download report as CSV
   */
  @Get(':id/download')
  async downloadReport(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const report = await this.reportsService.getReport(id);
    if (!report || !report.data) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const csv = this.reportsService.exportToCsv(report.data);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="report-${id}.csv"`);
    return res.send(csv);
  }
}
