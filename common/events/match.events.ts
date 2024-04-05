export enum MatchEvents {
    JoinRoom = 'joinRoom',
    CreateRoom = 'createRoom',
    AddPlayer = 'addPlayer',
    ToggleLock = 'toggleLock',
    BanUsername = 'banUsername',
    KickPlayer = 'kickPlayer',
    SendPlayersData = 'sendPlayersData',
    FetchPlayersData = 'fetchPlayersData',
    StartMatch = 'startMatch',
    MatchStarting = 'matchStarting',
    BeginQuiz = 'beginQuiz',
    NextQuestion = 'nextQuestion',
    StartCooldown = 'startCooldown',
    CurrentAnswers = 'currentAnswers',
    GameOver = 'gameOver',
    Winner = 'winner',
    RouteToResultsPage = 'routeToResultsPage',
    HostQuitMatch = 'hostQuitMatch',
    Disconnect = 'disconnect',
    Error = 'error',
}
