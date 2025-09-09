import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MenuService } from './menu.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Menu')
@Controller('api/menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Public()
  @Get()
  findAll() {
    return this.menuService.findAll();
  }

  @Post()
  create(@Body() createMenuDto: any) {
    return this.menuService.create(createMenuDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMenuDto: any) {
    return this.menuService.update(id, updateMenuDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.menuService.remove(id);
  }
}
