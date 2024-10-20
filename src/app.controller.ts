import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  Param,
  Query,
} from '@nestjs/common';
import { AppService } from './app.service';
import { pinyin } from 'pinyin-pro';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Controller()
export class AppController {
  constructor(private readonly httpService: HttpService) {}

  @Get('pinyin')
  pinyinConvert(@Query('text') text: string) {
    return pinyin(text, { toneType: 'none' });
  }

  @Get('weather/:city')
  async weather(@Param('city') city: string) {
    // 将城市名转换为拼音
    const cityPinyin = pinyin(city, { toneType: 'none' });

    // 使用城市名和拼音进行查询
    const { data } = await firstValueFrom(
      this.httpService.get(
        `https://geoapi.qweather.com/v2/city/lookup?location=${city},${cityPinyin}&key=224e51417b454865bc6a48b543be53c2`,
      ),
    );

    const location = data?.['location']?.[0];

    if (!location) {
      throw new BadRequestException('没有对应的城市信息');
    }

    // 使用匹配到的城市 ID 获取天气信息
    const { data: weatherData } = await firstValueFrom(
      this.httpService.get(
        `https://devapi.qweather.com/v7/weather/7d?location=${location.id}&key=224e51417b454865bc6a48b543be53c2&lang=zh`,
      ),
    );

    return weatherData;
  }
}
