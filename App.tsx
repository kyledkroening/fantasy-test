import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Dashboard } from "./components/Dashboard";
import { HistoricalStandings } from "./components/HistoricalStandings";
import { ChampionshipHistory } from "./components/ChampionshipHistory";
import { PlayerAnalytics } from "./components/PlayerAnalytics";
import { DataManagement } from "./components/DataManagement";
import { DraftHistory } from "./components/DraftHistory";
import { TradeHistory } from "./components/TradeHistory";
import { LeagueRules } from "./components/LeagueRules";
import { TeamOwnership } from "./components/TeamOwnership";
import { WeeklyMatchups } from "./components/WeeklyMatchups";
import { HeadToHeadRecords } from "./components/HeadToHeadRecords";
import { TeamPerformance } from "./components/TeamPerformance";
import type { DataSource } from "./types";

// Updated mock data with real participant names (2008-2024, 17 seasons)
const mockLeagueStats = {
  totalSeasons: 17,
  totalManagers: 22, // Total unique people who have been in the league
  platformYears: [
    { platform: "ESPN", years: 15 }, // 2008-2019 + 2021-2023
    { platform: "Sleeper", years: 1 }, // 2024
    { platform: "Missing", years: 1 } // 2020 (deleted league)
  ],
  currentChampion: "Joe Principe",
  mostChampionships: { manager: "Kyle Kroening", count: 4 }
};

// Current team owners for 2024 season
const currentTeams = [
  "Eric Nelson", // Team 1
  "Joe Principe", // Team 2  
  "Dan Benson", // Team 3
  "Greg Booth", // Team 4
  "Justin Nelson", // Team 5
  "Corey Hamsmith", // Team 6
  "Nick Plattos", // Team 7
  "Andrew Murphy", // Team 8
  "Kyle Kroening", // Team 9
  "John Borneman" // Team 10
];

const mockSeasons = [
  {
    year: 2024,
    platform: "Sleeper",
    champion: "Joe Principe",
    runnerUp: "Kyle Kroening",
    thirdPlace: "Dan Benson",
    regularSeasonWinner: "Eric Nelson",
    records: [
      { manager: "Joe Principe", wins: 11, losses: 3, pointsFor: 1245.6, pointsAgainst: 1134.2, place: 1 },
      { manager: "Kyle Kroening", wins: 10, losses: 4, pointsFor: 1198.4, pointsAgainst: 1156.8, place: 2 },
      { manager: "Dan Benson", wins: 9, losses: 5, pointsFor: 1223.7, pointsAgainst: 1178.9, place: 3 },
      { manager: "Eric Nelson", wins: 9, losses: 5, pointsFor: 1267.3, pointsAgainst: 1189.5, place: 4 },
      { manager: "Justin Nelson", wins: 8, losses: 6, pointsFor: 1156.8, pointsAgainst: 1201.3, place: 5 },
      { manager: "Greg Booth", wins: 7, losses: 7, pointsFor: 1143.2, pointsAgainst: 1234.7, place: 6 },
      { manager: "Corey Hamsmith", wins: 6, losses: 8, pointsFor: 1098.5, pointsAgainst: 1267.3, place: 7 },
      { manager: "Nick Plattos", wins: 5, losses: 9, pointsFor: 1067.8, pointsAgainst: 1298.6, place: 8 },
      { manager: "Andrew Murphy", wins: 4, losses: 10, pointsFor: 1034.9, pointsAgainst: 1324.1, place: 9 },
      { manager: "John Borneman", wins: 3, losses: 11, pointsFor: 989.7, pointsAgainst: 1356.4, place: 10 }
    ]
  },
  {
    year: 2023,
    platform: "ESPN",
    champion: "Kyle Kroening",
    runnerUp: "Dan Benson",
    thirdPlace: "Cody Scott",
    regularSeasonWinner: "Kyle Kroening",
    records: [
      { manager: "Kyle Kroening", wins: 12, losses: 2, pointsFor: 1334.5, pointsAgainst: 1098.7, place: 1 },
      { manager: "Dan Benson", wins: 10, losses: 4, pointsFor: 1278.9, pointsAgainst: 1145.3, place: 2 },
      { manager: "Cody Scott", wins: 9, losses: 5, pointsFor: 1189.6, pointsAgainst: 1167.8, place: 3 },
      { manager: "Eric Nelson", wins: 8, losses: 6, pointsFor: 1167.4, pointsAgainst: 1198.2, place: 4 },
      { manager: "Justin Nelson", wins: 7, losses: 7, pointsFor: 1134.2, pointsAgainst: 1223.1, place: 5 }
    ]
  }
];

// Updated championship data reflecting 17 seasons with real names
const mockChampionshipData = [
  { manager: "Kyle Kroening", championships: 4, runnerUps: 2, color: "#0088FE" },
  { manager: "Joel Richardson", championships: 3, runnerUps: 3, color: "#00C49F" },
  { manager: "Dan Benson", championships: 3, runnerUps: 1, color: "#FFBB28" },
  { manager: "Greg Booth", championships: 2, runnerUps: 2, color: "#FF8042" },
  { manager: "Cody Scott", championships: 2, runnerUps: 3, color: "#8884d8" },
  { manager: "Joe Principe", championships: 1, runnerUps: 0, color: "#82ca9d" },
  { manager: "Andrew Murphy", championships: 1, runnerUps: 1, color: "#ffc658" },
  { manager: "Paul Hudson", championships: 1, runnerUps: 2, color: "#ff7c7c" },
  { manager: "Eric Nelson", championships: 0, runnerUps: 1, color: "#8dd1e1" },
  { manager: "John Borneman", championships: 0, runnerUps: 2, color: "#d084d0" }
];

// Updated yearly champions for all 17 seasons with real names
const mockYearlyChampions = [
  { year: 2024, champion: "Joe Principe", platform: "Sleeper" },
  { year: 2023, champion: "Kyle Kroening", platform: "ESPN" },
  { year: 2022, champion: "Dan Benson", platform: "ESPN" },
  { year: 2021, champion: "Kyle Kroening", platform: "ESPN" },
  { year: 2020, champion: "Joel Richardson", platform: "ESPN*" }, // * indicates missing/reconstructed data
  { year: 2019, champion: "Greg Booth", platform: "ESPN" },
  { year: 2018, champion: "Kyle Kroening", platform: "ESPN" },
  { year: 2017, champion: "Dan Benson", platform: "ESPN" },
  { year: 2016, champion: "Paul Hudson", platform: "ESPN" },
  { year: 2015, champion: "Cody Scott", platform: "ESPN" },
  { year: 2014, champion: "Dan Benson", platform: "ESPN" },
  { year: 2013, champion: "Andrew Murphy", platform: "ESPN" },
  { year: 2012, champion: "Joel Richardson", platform: "ESPN" },
  { year: 2011, champion: "Greg Booth", platform: "ESPN" },
  { year: 2010, champion: "Cody Scott", platform: "ESPN" },
  { year: 2009, champion: "Kyle Kroening", platform: "ESPN" },
  { year: 2008, champion: "Joel Richardson", platform: "ESPN" }
];

// Updated player stats reflecting 17 seasons with real names
const mockPlayerStats = [
  {
    manager: "Kyle Kroening",
    totalSeasons: 17,
    wins: 156,
    losses: 82,
    winPercentage: 0.655,
    averagePointsFor: 1234.5,
    averagePointsAgainst: 1156.7,
    championships: 4,
    playoffAppearances: 13,
    bestFinish: 1,
    worstFinish: 9,
    yearlyPerformance: [
      { year: 2024, wins: 10, losses: 4, pointsFor: 1198.4, finish: 2 },
      { year: 2023, wins: 12, losses: 2, pointsFor: 1334.5, finish: 1 },
      { year: 2022, wins: 8, losses: 6, pointsFor: 1189.2, finish: 5 },
      { year: 2021, wins: 11, losses: 3, pointsFor: 1267.8, finish: 1 },
      { year: 2020, wins: 7, losses: 7, pointsFor: 1156.4, finish: 6 },
      { year: 2019, wins: 9, losses: 5, pointsFor: 1245.3, finish: 4 }
    ]
  },
  {
    manager: "Dan Benson",
    totalSeasons: 11, // 2014-2024
    wins: 108,
    losses: 65,
    winPercentage: 0.624,
    averagePointsFor: 1198.3,
    averagePointsAgainst: 1178.9,
    championships: 3,
    playoffAppearances: 8,
    bestFinish: 1,
    worstFinish: 8,
    yearlyPerformance: [
      { year: 2024, wins: 9, losses: 5, pointsFor: 1223.7, finish: 3 },
      { year: 2023, wins: 10, losses: 4, pointsFor: 1278.9, finish: 2 },
      { year: 2022, wins: 12, losses: 2, pointsFor: 1345.6, finish: 1 },
      { year: 2021, wins: 8, losses: 6, pointsFor: 1156.8, finish: 4 },
      { year: 2020, wins: 6, losses: 8, pointsFor: 1087.5, finish: 8 },
      { year: 2019, wins: 11, losses: 3, pointsFor: 1298.7, finish: 2 }
    ]
  }
];

// Mock data for new components with real names
const mockDraftData = [
  {
    year: 2025,
    platform: "Sleeper",
    draftDate: "August 28, 2025",
    draftType: "Snake Draft",
    picks: [
      { round: 1, pick: 1, overallPick: 1, team: "Eric Nelson", player: "TBD", position: "RB", isKeeper: false, isFromTrade: false },
      { round: 1, pick: 2, overallPick: 2, team: "Joe Principe", player: "TBD", position: "WR", isKeeper: true, isFromTrade: false },
      { round: 1, pick: 3, overallPick: 3, team: "Dan Benson", player: "TBD", position: "WR", isKeeper: false, isFromTrade: true, tradeOrigin: "Kyle Kroening" }
    ]
  },
  {
    year: 2024,
    platform: "Sleeper",
    draftDate: "August 15, 2024",
    draftType: "Snake Draft",
    picks: [
      { round: 1, pick: 1, overallPick: 1, team: "Eric Nelson", player: "Christian McCaffrey", position: "RB", isKeeper: false, isFromTrade: false, adp: 1.2 },
      { round: 1, pick: 2, overallPick: 2, team: "Joe Principe", player: "Tyreek Hill", position: "WR", isKeeper: true, isFromTrade: false },
      { round: 1, pick: 3, overallPick: 3, team: "Dan Benson", player: "Justin Jefferson", position: "WR", isKeeper: false, isFromTrade: true, tradeOrigin: "Kyle Kroening", adp: 2.1 },
      { round: 1, pick: 4, overallPick: 4, team: "Kyle Kroening", player: "Josh Allen", position: "QB", isKeeper: false, isFromTrade: false, adp: 4.8 },
      { round: 1, pick: 5, overallPick: 5, team: "Justin Nelson", player: "Stefon Diggs", position: "WR", isKeeper: true, isFromTrade: false },
    ]
  }
];

const mockTrades = [
  {
    id: "1",
    date: "2024-09-15",
    season: 2024,
    week: 2,
    teams: { teamA: "Eric Nelson", teamB: "Joe Principe" },
    assets: {
      teamA: [
        { type: "player" as const, name: "Derrick Henry", position: "RB" },
        { type: "pick" as const, name: "2025 3rd Round Pick", details: "2025 3rd Round Pick" }
      ],
      teamB: [
        { type: "player" as const, name: "Amari Cooper", position: "WR" },
        { type: "player" as const, name: "Tony Pollard", position: "RB" }
      ]
    },
    notes: "Eric needed WR depth for playoff push",
    status: "completed" as const
  }
];

// Updated league rules reflecting correct timeline and commissioners
const mockLeagueRules = [
  {
    id: "1",
    category: "Roster & Lineup",
    title: "Starting Lineup Format",
    description: "Required starting positions each week",
    currentValue: "1 QB, 2 RB, 2 WR, 1 TE, 1 FLEX, 1 K, 1 DEF",
    effectiveDate: "2008",
    amendments: [
      {
        date: "2015-03-15",
        season: 2015,
        description: "Added FLEX position to replace second RB",
        proposedBy: "Joel Richardson",
        votingResult: "8-2"
      },
      {
        date: "2018-03-20",
        season: 2018,
        description: "Modified FLEX to include TE eligibility",
        proposedBy: "Kyle Kroening",
        votingResult: "7-3"
      }
    ]
  },
  {
    id: "2",
    category: "Keeper Rules",
    title: "Keeper Selection Rules",
    description: "Rules governing keeper selections and draft round penalties",
    currentValue: "2 keepers max, lose draft pick 1 round earlier than previous season",
    effectiveDate: "2020",
    amendments: [
      {
        date: "2020-02-10",
        season: 2020,
        description: "Introduced keeper system after league restart",
        proposedBy: "Joel Richardson",
        votingResult: "10-0"
      },
      {
        date: "2022-03-01",
        season: 2022,
        description: "Limited to 2 keepers from unlimited",
        proposedBy: "Kyle Kroening",
        votingResult: "9-1"
      }
    ]
  },
  {
    id: "3",
    category: "League Operations",
    title: "Commissioner Succession",
    description: "Guidelines for commissioner changes and responsibilities",
    currentValue: "Kyle Kroening (2021-current), formerly Joel Richardson (2008-2020)",
    effectiveDate: "2021",
    amendments: [
      {
        date: "2021-02-01",
        season: 2021,
        description: "Kyle Kroening appointed commissioner after Joel Richardson's departure and 2020 data loss",
        proposedBy: "League Committee",
        votingResult: "10-0"
      },
      {
        date: "2023-12-15",
        season: 2024,
        description: "Added Sleeper platform migration policy",
        proposedBy: "Kyle Kroening",
        votingResult: "8-2"
      }
    ]
  }
];

// Complete team lineages with real ownership history
const mockTeamLineages = [
  {
    teamId: "1",
    currentTeamName: "Eric's Team",
    currentOwner: "Eric Nelson",
    foundingSeason: 2008,
    ownershipHistory: [
      {
        owner: "Joel Richardson",
        startSeason: 2008,
        endSeason: 2020,
        reason: "Founding Member & Original Commissioner",
        teamName: "Joel's Squad",
        achievements: { championships: 3, playoffAppearances: 10, regularSeasonTitles: 4 }
      },
      {
        owner: "Eric Nelson",
        startSeason: 2021,
        reason: "New Owner After Joel's Departure",
        teamName: "Eric's Team",
        achievements: { championships: 0, playoffAppearances: 3, regularSeasonTitles: 1 }
      }
    ]
  },
  {
    teamId: "2",
    currentTeamName: "Joe's Squad",
    currentOwner: "Joe Principe",
    foundingSeason: 2008,
    ownershipHistory: [
      {
        owner: "Cody Scott",
        startSeason: 2008,
        endSeason: 2023,
        reason: "Founding Member",
        teamName: "Cody's Crew",
        achievements: { championships: 2, playoffAppearances: 12, regularSeasonTitles: 3 }
      },
      {
        owner: "Joe Principe",
        startSeason: 2024,
        reason: "Trade/Acquisition",
        teamName: "Joe's Squad",
        achievements: { championships: 1, playoffAppearances: 1, regularSeasonTitles: 0 }
      }
    ]
  },
  {
    teamId: "3",
    currentTeamName: "Dan's Dynasty",
    currentOwner: "Dan Benson",
    foundingSeason: 2008,
    ownershipHistory: [
      {
        owner: "Jeff Richardson",
        startSeason: 2008,
        endSeason: 2013,
        reason: "Founding Member",
        teamName: "Jeff's Team",
        achievements: { championships: 1, playoffAppearances: 4, regularSeasonTitles: 1 }
      },
      {
        owner: "Dan Benson",
        startSeason: 2014,
        reason: "Ownership Transfer",
        teamName: "Dan's Dynasty",
        achievements: { championships: 3, playoffAppearances: 8, regularSeasonTitles: 3 }
      }
    ]
  },
  {
    teamId: "4",
    currentTeamName: "Booth's Brigade",
    currentOwner: "Greg Booth",
    foundingSeason: 2008,
    ownershipHistory: [
      {
        owner: "Greg Booth",
        startSeason: 2008,
        reason: "Founding Member",
        teamName: "Booth's Brigade",
        achievements: { championships: 2, playoffAppearances: 11, regularSeasonTitles: 2 }
      }
    ]
  },
  {
    teamId: "5",
    currentTeamName: "Justin's Giants",
    currentOwner: "Justin Nelson",
    foundingSeason: 2008,
    ownershipHistory: [
      {
        owner: "James Holt",
        startSeason: 2008,
        endSeason: 2008,
        reason: "Founding Member",
        teamName: "Holt's Heroes",
        achievements: { championships: 0, playoffAppearances: 0, regularSeasonTitles: 0 }
      },
      {
        owner: "Ed Scott",
        startSeason: 2009,
        endSeason: 2009,
        reason: "Replacement Owner",
        teamName: "Scott's Squad",
        achievements: { championships: 0, playoffAppearances: 0, regularSeasonTitles: 0 }
      },
      {
        owner: "Jace Richardson",
        startSeason: 2010,
        endSeason: 2014,
        reason: "Returning Member",
        teamName: "Jace's Team",
        achievements: { championships: 1, playoffAppearances: 3, regularSeasonTitles: 1 }
      },
      {
        owner: "Justin Nelson",
        startSeason: 2015,
        reason: "New Owner",
        teamName: "Justin's Giants",
        achievements: { championships: 0, playoffAppearances: 6, regularSeasonTitles: 2 }
      }
    ]
  },
  {
    teamId: "6",
    currentTeamName: "Hamsmith's Heroes",
    currentOwner: "Corey Hamsmith",
    foundingSeason: 2008,
    ownershipHistory: [
      {
        owner: "Corey Hamsmith",
        startSeason: 2008,
        reason: "Founding Member",
        teamName: "Hamsmith's Heroes",
        achievements: { championships: 1, playoffAppearances: 9, regularSeasonTitles: 1 }
      }
    ]
  },
  {
    teamId: "7",
    currentTeamName: "Nick's Squad",
    currentOwner: "Nick Plattos",
    foundingSeason: 2008,
    ownershipHistory: [
      {
        owner: "Louis Dewenter",
        startSeason: 2008,
        endSeason: 2008,
        reason: "Founding Member",
        teamName: "Louis's Team",
        achievements: { championships: 0, playoffAppearances: 0, regularSeasonTitles: 0 }
      },
      {
        owner: "Brandon S.",
        startSeason: 2009,
        endSeason: 2009,
        reason: "Replacement Owner",
        teamName: "Brandon's Brigade",
        achievements: { championships: 0, playoffAppearances: 0, regularSeasonTitles: 0 }
      },
      {
        owner: "Paul Hudson",
        startSeason: 2010,
        endSeason: 2020,
        reason: "Long-term Owner",
        teamName: "Hudson's Hawks",
        achievements: { championships: 1, playoffAppearances: 7, regularSeasonTitles: 2 }
      },
      {
        owner: "Sam Scott",
        startSeason: 2021,
        endSeason: 2023,
        reason: "New Owner",
        teamName: "Sam's Squad",
        achievements: { championships: 0, playoffAppearances: 1, regularSeasonTitles: 0 }
      },
      {
        owner: "Nick Plattos",
        startSeason: 2024,
        reason: "New Owner",
        teamName: "Nick's Squad",
        achievements: { championships: 0, playoffAppearances: 0, regularSeasonTitles: 0 }
      }
    ]
  },
  {
    teamId: "8",
    currentTeamName: "Murphy's Maulers",
    currentOwner: "Andrew Murphy",
    foundingSeason: 2008,
    ownershipHistory: [
      {
        owner: "Justin Hames",
        startSeason: 2008,
        endSeason: 2010,
        reason: "Founding Member",
        teamName: "Hames's Team",
        achievements: { championships: 0, playoffAppearances: 1, regularSeasonTitles: 0 }
      },
      {
        owner: "Ben Lamb",
        startSeason: 2011,
        endSeason: 2012,
        reason: "Replacement Owner",
        teamName: "Lamb's Legion",
        achievements: { championships: 0, playoffAppearances: 1, regularSeasonTitles: 0 }
      },
      {
        owner: "Andrew Murphy",
        startSeason: 2013,
        reason: "New Owner",
        teamName: "Murphy's Maulers",
        achievements: { championships: 1, playoffAppearances: 7, regularSeasonTitles: 1 }
      }
    ]
  },
  {
    teamId: "9",
    currentTeamName: "Kroening's Crushers",
    currentOwner: "Kyle Kroening",
    foundingSeason: 2008,
    ownershipHistory: [
      {
        owner: "Kyle Kroening",
        startSeason: 2008,
        reason: "Founding Member & Current Commissioner (2021-present)",
        teamName: "Kroening's Crushers",
        achievements: { championships: 4, playoffAppearances: 13, regularSeasonTitles: 5 }
      }
    ]
  },
  {
    teamId: "10",
    currentTeamName: "Borneman's Best",
    currentOwner: "John Borneman",
    foundingSeason: 2008,
    ownershipHistory: [
      {
        owner: "Jace Richardson",
        startSeason: 2008,
        endSeason: 2008,
        reason: "Founding Member (left after 2008)",
        teamName: "Jace's Original Team",
        achievements: { championships: 0, playoffAppearances: 0, regularSeasonTitles: 0 }
      },
      {
        owner: "John Borneman",
        startSeason: 2009,
        reason: "Replacement Owner",
        teamName: "Borneman's Best",
        achievements: { championships: 0, playoffAppearances: 8, regularSeasonTitles: 1 }
      }
    ]
  }
];

const mockWeeklyMatchups = [
  {
    season: 2024,
    platform: "Sleeper",
    regularSeasonWeeks: 14,
    playoffWeeks: 3,
    matchups: [
      {
        week: 1,
        homeTeam: "Eric Nelson",
        awayTeam: "Joe Principe",
        homeScore: 127.5,
        awayScore: 119.3,
        winner: "Eric Nelson",
        loser: "Joe Principe",
        marginOfVictory: 8.2,
        isPlayoff: false
      },
      {
        week: 15,
        homeTeam: "Kyle Kroening",
        awayTeam: "Dan Benson",
        homeScore: 134.7,
        awayScore: 142.1,
        winner: "Dan Benson",
        loser: "Kyle Kroening",
        marginOfVictory: 7.4,
        isPlayoff: true,
        playoffRound: "Semifinals"
      }
    ]
  }
];

const mockHeadToHeadRecords = [
  {
    teamA: "Kyle Kroening",
    teamB: "Dan Benson",
    regularSeason: {
      teamAWins: 12,
      teamBWins: 8,
      totalGames: 20,
      teamAPointsFor: 2456.7,
      teamBPointsFor: 2298.2,
      lastMeeting: "2024 Week 12",
      lastWinner: "Kyle Kroening"
    },
    playoffs: {
      teamAWins: 3,
      teamBWins: 2,
      totalGames: 5,
      teamAPointsFor: 589.4,
      teamBPointsFor: 567.8,
      lastMeeting: "2023 Championship",
      lastWinner: "Kyle Kroening"
    }
  }
];

// Updated team performance data with real names
const mockTeamPerformance = [
  {
    team: "Kyle Kroening",
    allTimeStats: {
      totalPointsFor: 20987.3,
      totalPointsAgainst: 19654.2,
      totalWins: 156,
      totalLosses: 82,
      championships: 4,
      championshipGames: 6,
      playoffAppearances: 13,
      lastPlaceFinishes: 0,
      totalTrades: 34,
      avgPointsPerGame: 118.9,
      playoffPointsPerGame: 125.4,
      consolationPointsPerGame: 0,
      bestSeasonRecord: { wins: 13, losses: 1, season: 2018 },
      worstSeasonRecord: { wins: 5, losses: 9, season: 2015 },
      highScoringGames: {
        range300to399: 12,
        range400plus: 3
      },
      winnersPlayoffStats: {
        totalPointsFor: 1628.5,
        totalPointsAgainst: 1434.7,
        gamesPlayed: 13,
        averagePointsFor: 125.3,
        averagePointsAgainst: 110.4
      }
    },
    seasonalPerformance: [
      { 
        season: 2024, 
        wins: 10, 
        losses: 4, 
        pointsFor: 1198.4, 
        pointsAgainst: 1156.8, 
        finish: 2, 
        playoffAppearance: true, 
        championshipGame: true, 
        championship: false,
        playoffPointsFor: 298.5,
        playoffPointsAgainst: 356.8
      },
      { 
        season: 2023, 
        wins: 12, 
        losses: 2, 
        pointsFor: 1334.5, 
        pointsAgainst: 1098.7, 
        finish: 1, 
        playoffAppearance: true, 
        championshipGame: true, 
        championship: true,
        playoffPointsFor: 387.2,
        playoffPointsAgainst: 321.8
      },
      { 
        season: 2022, 
        wins: 8, 
        losses: 6, 
        pointsFor: 1189.2, 
        pointsAgainst: 1205.3, 
        finish: 5, 
        playoffAppearance: true, 
        championshipGame: false, 
        championship: false,
        playoffPointsFor: 156.4,
        playoffPointsAgainst: 167.2
      }
    ],
    tradesByYear: [
      { season: 2024, trades: 3 },
      { season: 2023, trades: 2 },
      { season: 2022, trades: 4 },
      { season: 2021, trades: 1 },
      { season: 2020, trades: 2 }
    ]
  },
  {
    team: "Dan Benson",
    allTimeStats: {
      totalPointsFor: 18356.8, // 11 seasons (2014-2024)
      totalPointsAgainst: 18089.4,
      totalWins: 108,
      totalLosses: 65,
      championships: 3,
      championshipGames: 4,
      playoffAppearances: 8,
      lastPlaceFinishes: 1,
      totalTrades: 28,
      avgPointsPerGame: 119.2,
      playoffPointsPerGame: 124.8,
      consolationPointsPerGame: 108.3,
      bestSeasonRecord: { wins: 12, losses: 2, season: 2022 },
      worstSeasonRecord: { wins: 4, losses: 10, season: 2020 },
      highScoringGames: {
        range300to399: 9,
        range400plus: 2
      },
      winnersPlayoffStats: {
        totalPointsFor: 999.4,
        totalPointsAgainst: 901.6,
        gamesPlayed: 8,
        averagePointsFor: 124.9,
        averagePointsAgainst: 112.7
      }
    },
    seasonalPerformance: [
      { 
        season: 2024, 
        wins: 9, 
        losses: 5, 
        pointsFor: 1223.7, 
        pointsAgainst: 1178.9, 
        finish: 3, 
        playoffAppearance: true, 
        championshipGame: false, 
        championship: false,
        playoffPointsFor: 142.1,
        playoffPointsAgainst: 134.7
      },
      { 
        season: 2023, 
        wins: 10, 
        losses: 4, 
        pointsFor: 1278.9, 
        pointsAgainst: 1145.3, 
        finish: 2, 
        playoffAppearance: true, 
        championshipGame: true, 
        championship: false,
        playoffPointsFor: 267.8,
        playoffPointsAgainst: 287.2
      }
    ],
    tradesByYear: [
      { season: 2024, trades: 2 },
      { season: 2023, trades: 1 },
      { season: 2022, trades: 3 },
      { season: 2021, trades: 2 },
      { season: 2020, trades: 1 }
    ]
  }
];

// Updated data sources with ESPN authentication fields
const mockDataSources = [
  {
    id: "1",
    platform: "ESPN",
    leagueId: "123456",
    years: "2008-2019",
    status: "pending" as const,
    lastSync: "Never",
    isPrivate: true,
    swid: "{12345678-1234-1234-1234-123456789012}",
    espn_s2: "AEBxxx...encrypted_cookie_string"
  },
  {
    id: "2",
    platform: "ESPN",
    leagueId: "789012",
    years: "2021-2023",
    status: "pending" as const,
    lastSync: "Never",
    isPrivate: false
  },
  {
    id: "3",
    platform: "Sleeper",
    leagueId: "345678",
    years: "2024",
    status: "connected" as const,
    lastSync: "2025-01-26 14:35"
  },
  {
    id: "4",
    platform: "Manual Upload",
    leagueId: "N/A",
    years: "2020",
    status: "pending" as const,
    lastSync: "Never (Excel data pending upload)"
  }
];

// Data source type imported from types

export default function App() {
  const [dataSources, setDataSources] = useState<DataSource[]>(mockDataSources);
  const [selectedPlayer, setSelectedPlayer] = useState<string>();

  const handleAddDataSource = (newSource: Omit<DataSource, 'id' | 'status' | 'lastSync'>) => {
    const source = {
      ...newSource,
      id: Date.now().toString(),
      status: 'pending' as const,
      lastSync: 'Never'
    };
    setDataSources([...dataSources, source]);
  };

  const handleSyncData = (sourceId: string) => {
    setDataSources(sources => 
      sources.map(source => 
        source.id === sourceId 
          ? { ...source, lastSync: new Date().toLocaleString() }
          : source
      )
    );
  };

  const handleRemoveDataSource = (sourceId: string) => {
    setDataSources(sources => sources.filter(source => source.id !== sourceId));
  };

  const handleUpdateDataSource = (sourceId: string, updates: Partial<DataSource>) => {
    setDataSources(sources => 
      sources.map(source => 
        source.id === sourceId 
          ? { ...source, ...updates }
          : source
      )
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Fantasy Football League Central</h1>
          <p className="text-muted-foreground">
            Complete history and analytics for your 10-team fantasy football league (2008-2024) • 2025 Draft: August 28th • Commissioner: Kyle Kroening
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="standings">Standings</TabsTrigger>
            <TabsTrigger value="championships">Championships</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
            <TabsTrigger value="trades">Trades</TabsTrigger>
            <TabsTrigger value="matchups">Matchups</TabsTrigger>
            <TabsTrigger value="head-to-head">H2H Records</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="management">Management</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <Dashboard leagueStats={mockLeagueStats} />
          </TabsContent>

          <TabsContent value="standings" className="space-y-6">
            <HistoricalStandings seasons={mockSeasons} />
          </TabsContent>

          <TabsContent value="championships" className="space-y-6">
            <ChampionshipHistory 
              championshipData={mockChampionshipData}
              yearlyChampions={mockYearlyChampions}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <PlayerAnalytics 
              playerStats={mockPlayerStats}
              selectedPlayer={selectedPlayer}
            />
          </TabsContent>

          <TabsContent value="drafts" className="space-y-6">
            <DraftHistory draftData={mockDraftData} />
          </TabsContent>

          <TabsContent value="trades" className="space-y-6">
            <TradeHistory trades={mockTrades} />
          </TabsContent>

          <TabsContent value="matchups" className="space-y-6">
            <WeeklyMatchups matchupData={mockWeeklyMatchups} />
          </TabsContent>

          <TabsContent value="head-to-head" className="space-y-6">
            <HeadToHeadRecords records={mockHeadToHeadRecords} teams={currentTeams} />
          </TabsContent>

          <TabsContent value="teams" className="space-y-6">
            <Tabs defaultValue="performance" className="space-y-6">
              <TabsList>
                <TabsTrigger value="performance">Team Performance</TabsTrigger>
                <TabsTrigger value="ownership">Ownership History</TabsTrigger>
                <TabsTrigger value="rules">League Rules</TabsTrigger>
              </TabsList>
              
              <TabsContent value="performance">
                <TeamPerformance teamStats={mockTeamPerformance} />
              </TabsContent>
              
              <TabsContent value="ownership">
                <TeamOwnership teamLineages={mockTeamLineages} />
              </TabsContent>
              
              <TabsContent value="rules">
                <LeagueRules rules={mockLeagueRules} />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="management" className="space-y-6">
            <DataManagement 
              dataSources={dataSources}
              onAddDataSource={handleAddDataSource}
              onSyncData={handleSyncData}
              onRemoveDataSource={handleRemoveDataSource}
              onUpdateDataSource={handleUpdateDataSource}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}