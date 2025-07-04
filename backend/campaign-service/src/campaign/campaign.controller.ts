import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { CampaignService, Campaign } from './campaign.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@Controller('campaigns')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post()
  create(@Body() dto: CreateCampaignDto): Promise<Campaign> {
    return this.campaignService.create(dto);
  }

  @Get()
  findAll(@Query('is_archived') isArchived?: boolean): Promise<Campaign[]> {
    return this.campaignService.findAll(isArchived);
  }
  @Get('favourite')
  findAllFavourite(): Promise<Campaign[]> {
    return this.campaignService.findAllFavourite();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Campaign> {
    return this.campaignService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCampaignDto,
  ): Promise<Campaign> {
    return this.campaignService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.campaignService.remove(id);
  }
}
