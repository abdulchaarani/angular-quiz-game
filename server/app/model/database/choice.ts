import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChoiceDocument = Choice & Document;

@Schema()
export class Choice {
    @Prop({ required: true })
    text: string;

    isCorrect?: boolean;
}

export const choiceSchema = SchemaFactory.createForClass(Choice);
