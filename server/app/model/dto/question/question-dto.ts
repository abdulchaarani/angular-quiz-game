import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateQuestionDto {
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

    // @ApiProperty()
    // @IsString()
    // choices?: Choice[];

    @ApiProperty()
    @IsString()
    lastModification: string;
}
