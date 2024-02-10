import { constants } from './game-validation-constants';

const noRepeatChoice = 'Il ne doit pas y avoir deux choix identiques dans une question.';
const choicesNumber = `Il doit y avoir entre ${constants.minimumChoicesNumber} et ${constants.maximumChoicesNumber} choix.`;
const points = `Les points doivent être entre ${constants.minimumPoints} et ${constants.maximumPoints} et divisibles par ${constants.stepPoints}`;
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
