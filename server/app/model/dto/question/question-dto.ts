import { Choice } from '@app/model/database/choice';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateQuestionDto {
    @ApiProperty()
    @IsString()
    @IsOptional()
    id: string;

    @ApiProperty()
    @IsString()
    type: string;

    @ApiProperty()
    @IsString()
    description: string;

    @ApiProperty()
    @IsString()
    question: string;

    @ApiProperty()
    @IsNumber()
    points: number;

    @ApiProperty()
    @IsOptional()
    choices?: Choice[];

    lastModification: Date;
}
