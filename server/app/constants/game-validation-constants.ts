export const MINIMUM_CHOICES_NUMBER: number = 2;
export const MAXIMUM_CHOICES_NUMBER: number = 4;
export const MINIMUM_POINTS: number = 10;
export const MAXIMUM_POINTS: number = 100;
export const STEP_POINTS: number = 10;
export const MINIMUM_DURATION: number = 10;
export const MAXIMUM_DURATION: number = 60;
export const MINIMUM_QUESTIONS_NUMBER: number = 1;

export const CHOICES_NUMBER_ERROR_MESSAGE: string = `Il doit y avoir entre ${MINIMUM_CHOICES_NUMBER} et ${MAXIMUM_CHOICES_NUMBER} choix dans la question.`;
export const POINTS_ERROR_MESSAGE: string = `Le nombre de points doit être entre ${MINIMUM_POINTS} et ${MAXIMUM_POINTS} tout en étant divisible par ${STEP_POINTS}`;
export const QUESTION_EMPTY_TEXT_ERROR_MESSAGE: string = 'Le texte de la question ne doit pas être vide.';
export const CHOICES_RATIO_ERROR_MESSAGE: string = 'Il doit y avoir au moins un choix valide et un choix invalide.';
export const GAME_EMPTY_TITLE_ERROR_MESSAGE: string = 'Le titre du jeu est vide.';
export const GAME_EMPTY_DESCRIPTION_ERROR_MESSAGE: string = 'La description du jeu est vide.';
export const GAME_DURATION_ERROR_MESSAGE: string = 'La durée doit être entre 10 et 60 secondes.';
export const GAME_QUESTIONS_NUMBER_ERROR_MESSAGE: string = 'Le jeu doit avoir au moins une question.';
