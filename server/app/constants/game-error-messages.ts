import { MAX_CHOICES_NUMBER, MAX_POINTS, MIN_CHOICES_NUMBER, MIN_POINTS, STEP_POINTS } from './game-validation-constants';

const noRepeatChoice = 'Il ne doit pas y avoir deux choix identiques dans une question.';
const choicesNumber = `Il doit y avoir entre ${MIN_CHOICES_NUMBER} et ${MAX_CHOICES_NUMBER} choix.`;
const points = `Les points doivent être entre ${MIN_POINTS} et ${MAX_POINTS} et divisibles par ${STEP_POINTS}`;
const questionEmptyText = 'Le texte de la question ne doit pas être vide.';
const choicesRatio = 'Il doit y avoir au moins un choix valide et un choix invalide.';
const gameEmptyTitle = 'Le titre du jeu est vide.';
const gameEmptyDescription = 'La description du jeu est vide.';
const gameDuration = 'La durée doit être entre 10 et 60 secondes.';
const gameQuestionsNumber = 'Le jeu doit avoir au moins une question.';

export const errorMessage = {
    noRepeatChoice,
    choicesNumber,
    points,
    questionEmptyText,
    choicesRatio,
    gameEmptyTitle,
    gameEmptyDescription,
    gameDuration,
    gameQuestionsNumber,
};
