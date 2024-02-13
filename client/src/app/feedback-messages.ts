export enum BankStatus {
    UNAVAILABLE = "👀 Aucune autre question valide de la banque n'est disponible! 👀",
    AVAILABLE = '🖐 Glissez et déposez une question de la banque dans le jeu! 🖐',
    SUCCESS = 'Question ajoutée à la banque avec succès! 😺',
    FAILURE = "La question n'a pas pu être ajoutée. 😿",
    DUPLICATE = 'Cette question fait déjà partie de la banque! 😾',
    MODIFIED = 'Question modifiée avec succès! 😺',
    UNMODIFIED = "La question n'a pas pu être modifiée. 😿",
    UNRETRIEVED = "Échec d'obtention des questions 😿",
    STILL = 'Échec de supression de la question 😿',
}

export enum QuestionStatus {
    VERIFIED = 'Question vérifiée avec succès! 😺',
    UNVERIFIED = 'Question non vérifiée 😿',
    DUPLICATE = 'Cette question fait déjà partie du jeu! 😾',
}

export enum GameStatus {
    VERIFIED = 'Question vérifiée avec succès! 😺',
    DUPLICATE = 'Cette question fait déjà partie de la liste des questions de ce jeu! 😾',
    FAILURE = "Échec d'obtention du jeu 😿",
}
