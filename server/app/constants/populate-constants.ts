import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { CreateQuestionDto } from '@app/model/dto/question/create-question-dto';

const GAMES_TO_POPULATE: CreateGameDto[] = [
    {
        id: '0',
        title: 'Hoot Hoot',
        description: 'HOOT HOOT',
        duration: 60,
        isVisible: true,
        lastModification: new Date(),
        questions: [
            {
                id: '2',
                type: 'QCM',
                text: "Savez-vous de quel auteur Leblanc s'est inspiré ?",
                points: 60,
                choices: [
                    {
                        text: 'Gaston Leroux',
                        isCorrect: false,
                    },
                    {
                        text: 'Arthur Conan Doyle',
                        isCorrect: true,
                    },
                    {
                        text: 'Edgar Wallace',
                        isCorrect: false,
                    },
                    {
                        text: 'Agatha Christie',
                        isCorrect: false,
                    },
                ],
                lastModification: new Date(),
            },
        ],
    },
    {
        id: '1',
        title: 'Lune quantique',
        description: 'OOOOOH',
        duration: 60,
        isVisible: true,
        lastModification: new Date(),
        questions: [
            {
                id: '1',
                type: 'QCM',
                text: 'Parmi les choix suivants, lesquels sont des noms de planètes dans Outer Wilds ?',
                points: 20,
                choices: [
                    {
                        text: 'Sombronces',
                        isCorrect: true,
                    },
                    {
                        text: 'Léviathe',
                        isCorrect: true,
                    },
                    {
                        text: 'Cravité',
                        isCorrect: true,
                    },
                    {
                        text: 'La Lanterne',
                        isCorrect: false,
                    },
                ],
                lastModification: new Date(),
            },
        ],
    },
    {
        id: '2',
        title: 'Pokemon Quiz',
        description: 'WHO IS THAT POKEMON',
        duration: 30,
        isVisible: false,
        lastModification: new Date(),
        questions: [
            {
                id: '123',
                type: 'QCM',
                text: 'Quelles sont les principales caractéristiques de Psykokwak ?',
                points: 50,
                choices: [
                    {
                        text: 'Il dit "coin coin"',
                        isCorrect: false,
                    },
                    {
                        text: 'Il est le Pokémon préféré de Junichi Masuda, directeur et compositeur des jeux Pokémon.',
                        isCorrect: true,
                    },
                    {
                        text: 'Il est jaune.',
                        isCorrect: false,
                    },
                    {
                        text: 'Il a toujours mal à la tête.',
                        isCorrect: true,
                    },
                ],
                lastModification: new Date(),
            },
            {
                id: '343wepfisajd',
                type: 'QCM',
                text: 'Quelles sont les principales caractéristiques de Shroomish ?',
                points: 50,
                choices: [
                    {
                        text: 'Il dit "wawa"',
                        isCorrect: false,
                    },
                    {
                        text: 'Il est de type plante.',
                        isCorrect: true,
                    },
                    {
                        text: 'Il se montre docile.',
                        isCorrect: false,
                    },
                    {
                        text: 'Il semble un peu grognon..',
                        isCorrect: true,
                    },
                ],
                lastModification: new Date(),
            },
        ],
    },
];

const QUESTIONS_TO_POPULATE: CreateQuestionDto[] = [
    {
        id: '1',
        type: 'QCM',
        text: 'Combien de motifs blancs et noirs y a-t-il respectivement sur un ballon de soccer?',
        points: 20,
        choices: [
            {
                text: '30 blancs, 5 noirs',
                isCorrect: false,
            },
            {
                text: '20 blancs, 12 noirs',
                isCorrect: true,
            },
            {
                text: 'Cela varie',
                isCorrect: false,
            },
        ],
        lastModification: new Date(),
    },
    {
        id: '2',
        type: 'QCM',
        text: "Savez-vous de quel auteur Leblanc s'est inspiré ?",
        points: 60,
        choices: [
            {
                text: 'Gaston Leroux',
                isCorrect: false,
            },
            {
                text: 'Arthur Conan Doyle',
                isCorrect: true,
            },
            {
                text: 'Edgar Wallace',
                isCorrect: false,
            },
            {
                text: 'Agatha Christie',
                isCorrect: false,
            },
        ],
        lastModification: new Date(),
    },
    {
        id: '3',
        type: 'QCM',
        text: 'Parmi les choix suivants, lesquels sont des noms de planètes dans Outer Wilds ?',
        points: 20,
        choices: [
            {
                text: 'Sombronces',
                isCorrect: true,
            },
            {
                text: 'Léviathe',
                isCorrect: true,
            },
            {
                text: 'Cravité',
                isCorrect: true,
            },
            {
                text: 'La Lanterne',
                isCorrect: false,
            },
        ],
        lastModification: new Date(),
    },
];
export { GAMES_TO_POPULATE, QUESTIONS_TO_POPULATE };
