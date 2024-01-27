import { Prop } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateGameDto {
    @ApiProperty()
    @IsNumber()
    @IsOptional()
    id: number;

    @ApiProperty()
    @IsString()
    @Prop({ required: true })
    title: string;

    @ApiProperty()
    @IsString()
    @Prop({ required: true })
    description: string;

    @ApiProperty()
    @IsNumber()
    @Prop({ required: true })
    duration: number;

    @ApiProperty()
    // @IsDate()
    @IsOptional()
    lastModification: Date;

    @ApiProperty()
    @IsOptional()
    @Prop({ required: false })
    isVisible: boolean;

    // TODO: Add Questions
}
