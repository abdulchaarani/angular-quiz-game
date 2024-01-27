import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateGameDto {
    @ApiProperty()
    @IsNumber()
    @IsOptional()
    id: number;

    @ApiProperty()
    @IsOptional()
    @IsString()
    title: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    description: string;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    duration: number;

    @ApiProperty()
    @IsOptional()
    // @IsDate()
    lastModification: Date;

    @ApiProperty()
    @IsOptional()
    isVisible: boolean;

    // TODO: Add Questions
}
