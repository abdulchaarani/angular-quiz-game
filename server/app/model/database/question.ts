import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Choice, choiceSchema } from './choice';

export type QuestionDocument = Question & Document;

@Schema()
export class Question {
    @Prop({ required: true })
    id: number;

    @Prop({ required: true })
    type: string;

    @Prop({ required: true })
    text: string;

    @Prop({ required: true })
    points: number;

    @Prop({ type: [choiceSchema], default: [], required: true })
    choices: Choice[];

    @Prop({ required: true })
    _id?: string;
}

export const courseSchema = SchemaFactory.createForClass(Question);
