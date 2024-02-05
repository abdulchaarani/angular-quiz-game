const MINIMUM_CHOICES_NUMBER: number = 2;
const MAXIMUM_CHOICES_NUMBER: number = 4;
const MINIMUM_POINTS: number = 10;
const MAXIMUM_POINTS: number = 100;
const STEP_POINTS: number = 10;
const MINIMUM_DURATION: number = 10;
const MAXIMUM_DURATION: number = 60;
const MINIMUM_QUESTIONS_NUMBER: number = 1;

const CHOICES_NUMBER_ERROR_MESSAGE: string = `Il doit y avoir entre ${MINIMUM_CHOICES_NUMBER} et ${MAXIMUM_CHOICES_NUMBER} choix dans la question.`;
const POINTS_ERROR_MESSAGE: string = `Le nombre de points doit être entre ${MINIMUM_POINTS} et ${MAXIMUM_POINTS} tout en étant divisible par ${STEP_POINTS}`;
const QUESTION_EMPTY_TEXT_ERROR_MESSAGE: string = 'Le texte de la question ne doit pas être vide.';
const CHOICES_RATIO_ERROR_MESSAGE: string = 'Il doit y avoir au moins un choix valide et un choix invalide.';
const GAME_EMPTY_TITLE_ERROR_MESSAGE: string = 'Le titre du jeu est vide.';
const GAME_EMPTY_DESCRIPTION_ERROR_MESSAGE: string = 'La description du jeu est vide.';
const GAME_DURATION_ERROR_MESSAGE: string = 'La durée doit être entre 10 et 60 secondes.';
const GAME_QUESTIONS_NUMBER_ERROR_MESSAGE: string = 'Le jeu doit avoir au moins une question.';

export const constants = {
    MINIMUM_CHOICES_NUMBER,
    MAXIMUM_CHOICES_NUMBER,
    MINIMUM_POINTS,
    MAXIMUM_POINTS,
    STEP_POINTS,
    MINIMUM_DURATION,
    MAXIMUM_DURATION,
    MINIMUM_QUESTIONS_NUMBER,
    CHOICES_NUMBER_ERROR_MESSAGE,
    POINTS_ERROR_MESSAGE,
    QUESTION_EMPTY_TEXT_ERROR_MESSAGE,
    GAME_EMPTY_DESCRIPTION_ERROR_MESSAGE,
    GAME_DURATION_ERROR_MESSAGE,
    GAME_QUESTIONS_NUMBER_ERROR_MESSAGE,
    CHOICES_RATIO_ERROR_MESSAGE,
    GAME_EMPTY_TITLE_ERROR_MESSAGE,
};
