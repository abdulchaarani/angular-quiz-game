import { ApiProperty } from '@nestjs/swagger';

export class Message {
    @ApiProperty()
    author: string;
    @ApiProperty()
    text: string;
    @ApiProperty()
    date: Date;
}
