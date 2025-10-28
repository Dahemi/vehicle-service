import { Resolver } from '@nestjs/graphql';
import { ExportService } from './export.service';

@Resolver()
export class ExportResolver {
  constructor(private readonly exportService: ExportService) {}
}
