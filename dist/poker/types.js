export var HandRank;
(function (HandRank) {
    HandRank[HandRank["HighCard"] = 0] = "HighCard";
    HandRank[HandRank["Pair"] = 1] = "Pair";
    HandRank[HandRank["TwoPair"] = 2] = "TwoPair";
    HandRank[HandRank["ThreeOfKind"] = 3] = "ThreeOfKind";
    HandRank[HandRank["Straight"] = 4] = "Straight";
    HandRank[HandRank["Flush"] = 5] = "Flush";
    HandRank[HandRank["FullHouse"] = 6] = "FullHouse";
    HandRank[HandRank["FourOfKind"] = 7] = "FourOfKind";
    HandRank[HandRank["StraightFlush"] = 8] = "StraightFlush";
    HandRank[HandRank["RoyalFlush"] = 9] = "RoyalFlush";
})(HandRank || (HandRank = {}));
export var GamePhase;
(function (GamePhase) {
    GamePhase[GamePhase["PRE_DEAL"] = 0] = "PRE_DEAL";
    GamePhase[GamePhase["PRE_FLOP"] = 1] = "PRE_FLOP";
    GamePhase[GamePhase["FLOP"] = 2] = "FLOP";
    GamePhase[GamePhase["TURN"] = 3] = "TURN";
    GamePhase[GamePhase["RIVER"] = 4] = "RIVER";
    GamePhase[GamePhase["SHOWDOWN"] = 5] = "SHOWDOWN";
})(GamePhase || (GamePhase = {}));
//# sourceMappingURL=types.js.map