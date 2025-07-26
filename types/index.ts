// Type definitions for Fantasy Football League Central

export interface LeagueStats {
  totalSeasons: number;
  totalManagers: number;
  platformYears: Array<{
    platform: string;
    years: number;
  }>;
  currentChampion: string;
  mostChampionships: {
    manager: string;
    count: number;
  };
}

export interface SeasonRecord {
  manager: string;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  place: number;
}

export interface Season {
  year: number;
  platform: string;
  champion: string;
  runnerUp: string;
  thirdPlace: string;
  regularSeasonWinner: string;
  records: SeasonRecord[];
}

export interface ChampionshipData {
  manager: string;
  championships: number;
  runnerUps: number;
  color: string;
}

export interface YearlyChampion {
  year: number;
  champion: string;
  platform: string;
}

export interface YearlyPerformance {
  year: number;
  wins: number;
  losses: number;
  pointsFor: number;
  finish: number;
  playoffPointsFor?: number;
  playoffPointsAgainst?: number;
}

export interface PlayerStats {
  manager: string;
  totalSeasons: number;
  wins: number;
  losses: number;
  winPercentage: number;
  averagePointsFor: number;
  averagePointsAgainst: number;
  championships: number;
  playoffAppearances: number;
  bestFinish: number;
  worstFinish: number;
  yearlyPerformance: YearlyPerformance[];
}

export interface DraftPick {
  round: number;
  pick: number;
  overallPick: number;
  team: string;
  player: string;
  position: string;
  isKeeper: boolean;
  isFromTrade: boolean;
  tradeOrigin?: string;
  adp?: number;
}

export interface DraftData {
  year: number;
  platform: string;
  draftDate: string;
  draftType: string;
  picks: DraftPick[];
}

export interface TradeAsset {
  type: 'player' | 'pick';
  name: string;
  position?: string;
  details?: string;
}

export interface Trade {
  id: string;
  date: string;
  season: number;
  week: number;
  teams: {
    teamA: string;
    teamB: string;
  };
  assets: {
    teamA: TradeAsset[];
    teamB: TradeAsset[];
  };
  notes: string;
  status: 'completed' | 'pending' | 'vetoed';
}

export interface Amendment {
  date: string;
  season: number;
  description: string;
  proposedBy: string;
  votingResult: string;
}

export interface LeagueRule {
  id: string;
  category: string;
  title: string;
  description: string;
  currentValue: string;
  effectiveDate: string;
  amendments: Amendment[];
}

export interface OwnershipHistory {
  owner: string;
  startSeason: number;
  endSeason?: number;
  reason: string;
  teamName: string;
  achievements: {
    championships: number;
    playoffAppearances: number;
    regularSeasonTitles: number;
  };
}

export interface TeamLineage {
  teamId: string;
  currentTeamName: string;
  currentOwner: string;
  foundingSeason: number;
  ownershipHistory: OwnershipHistory[];
}

export interface WeeklyMatchup {
  week: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  winner: string;
  loser: string;
  marginOfVictory: number;
  isPlayoff: boolean;
  playoffRound?: string;
}

export interface MatchupData {
  season: number;
  platform: string;
  regularSeasonWeeks: number;
  playoffWeeks: number;
  matchups: WeeklyMatchup[];
}

export interface HeadToHeadRecord {
  teamA: string;
  teamB: string;
  regularSeason: {
    teamAWins: number;
    teamBWins: number;
    totalGames: number;
    teamAPointsFor: number;
    teamBPointsFor: number;
    lastMeeting: string;
    lastWinner: string;
  };
  playoffs: {
    teamAWins: number;
    teamBWins: number;
    totalGames: number;
    teamAPointsFor: number;
    teamBPointsFor: number;
    lastMeeting: string;
    lastWinner: string;
  };
}

export interface SeasonalPerformance {
  season: number;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  finish: number;
  playoffAppearance: boolean;
  championshipGame: boolean;
  championship: boolean;
  playoffPointsFor?: number;
  playoffPointsAgainst?: number;
}

export interface TeamPerformance {
  team: string;
  allTimeStats: {
    totalPointsFor: number;
    totalPointsAgainst: number;
    totalWins: number;
    totalLosses: number;
    championships: number;
    championshipGames: number;
    playoffAppearances: number;
    lastPlaceFinishes: number;
    totalTrades: number;
    avgPointsPerGame: number;
    playoffPointsPerGame: number;
    consolationPointsPerGame: number;
    bestSeasonRecord: { wins: number; losses: number; season: number };
    worstSeasonRecord: { wins: number; losses: number; season: number };
    highScoringGames: {
      range300to399: number;
      range400plus: number;
    };
    winnersPlayoffStats: {
      totalPointsFor: number;
      totalPointsAgainst: number;
      gamesPlayed: number;
      averagePointsFor: number;
      averagePointsAgainst: number;
    };
  };
  seasonalPerformance: SeasonalPerformance[];
  tradesByYear: Array<{
    season: number;
    trades: number;
  }>;
}

export interface DataSource {
  id: string;
  platform: string;
  leagueId: string;
  years: string;
  status: 'connected' | 'pending' | 'error';
  lastSync: string;
  isPrivate?: boolean;
  swid?: string;
  espn_s2?: string;
}