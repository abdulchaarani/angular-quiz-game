import { Prop } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateGameDto {
    @ApiProperty()
    @IsNumber()
    @Prop({ required: true })
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
    @Prop({ required: true })
    lastModification: Date;

    @ApiProperty()
    @IsOptional()
    @Prop({ required: true })
    isVisible: boolean;
}
