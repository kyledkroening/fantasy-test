import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useState } from "react";
import { Trophy, TrendingUp, TrendingDown, Target, Zap, Crown, Shield } from "lucide-react";

interface SeasonPerformance {
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

interface HighScoringGames {
  range300to399: number;
  range400plus: number;
}

interface PlayoffStats {
  totalPointsFor: number;
  totalPointsAgainst: number;
  gamesPlayed: number;
  averagePointsFor: number;
  averagePointsAgainst: number;
}

interface TeamStats {
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
    highScoringGames: HighScoringGames;
    winnersPlayoffStats: PlayoffStats;
  };
  seasonalPerformance: SeasonPerformance[];
  tradesByYear: { season: number; trades: number }[];
}

interface TeamPerformanceProps {
  teamStats: TeamStats[];
}

export function TeamPerformance({ teamStats }: TeamPerformanceProps) {
  const [selectedTeam, setSelectedTeam] = useState<string>(teamStats[0]?.team || "");

  const currentTeamData = teamStats.find(team => team.team === selectedTeam);

  const getPerformanceGrade = (winPercentage: number) => {
    if (winPercentage >= 0.7) return { grade: "A", color: "text-green-600" };
    if (winPercentage >= 0.6) return { grade: "B", color: "text-blue-600" };
    if (winPercentage >= 0.5) return { grade: "C", color: "text-yellow-600" };
    if (winPercentage >= 0.4) return { grade: "D", color: "text-orange-600" };
    return { grade: "F", color: "text-red-600" };
  };

  const getHighScoringBadge = (games: number) => {
    if (games >= 10) return { color: "bg-red-100 text-red-800", label: "Elite Scorer" };
    if (games >= 5) return { color: "bg-orange-100 text-orange-800", label: "High Scorer" };
    if (games >= 2) return { color: "bg-yellow-100 text-yellow-800", label: "Explosive" };
    return { color: "bg-gray-100 text-gray-800", label: "Standard" };
  };

  const OverviewTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Team</TableHead>
          <TableHead>Record</TableHead>
          <TableHead>Win %</TableHead>
          <TableHead>Total PF</TableHead>
          <TableHead>Total PA</TableHead>
          <TableHead>PPG</TableHead>
          <TableHead>Championships</TableHead>
          <TableHead>300-399 Games</TableHead>
          <TableHead>400+ Games</TableHead>
          <TableHead>Grade</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {teamStats.map((team) => {
          const winPercentage = team.allTimeStats.totalWins / (team.allTimeStats.totalWins + team.allTimeStats.totalLosses);
          const grade = getPerformanceGrade(winPercentage);
          const highScoringBadge = getHighScoringBadge(team.allTimeStats.highScoringGames.range300to399 + team.allTimeStats.highScoringGames.range400plus);
          
          return (
            <TableRow key={team.team}>
              <TableCell className="font-medium">{team.team}</TableCell>
              <TableCell>
                {team.allTimeStats.totalWins}-{team.allTimeStats.totalLosses}
              </TableCell>
              <TableCell>{(winPercentage * 100).toFixed(1)}%</TableCell>
              <TableCell>{team.allTimeStats.totalPointsFor.toLocaleString()}</TableCell>
              <TableCell>{team.allTimeStats.totalPointsAgainst.toLocaleString()}</TableCell>
              <TableCell>{team.allTimeStats.avgPointsPerGame.toFixed(1)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Trophy className="h-3 w-3 text-yellow-500" />
                  {team.allTimeStats.championships}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-orange-50 text-orange-700">
                  {team.allTimeStats.highScoringGames.range300to399}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-red-50 text-red-700">
                  {team.allTimeStats.highScoringGames.range400plus}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <Badge className={`${grade.color} font-bold`}>
                    {grade.grade}
                  </Badge>
                  <Badge className={highScoringBadge.color} variant="outline">
                    {highScoringBadge.label}
                  </Badge>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Performance Analytics</CardTitle>
          <CardDescription>
            Comprehensive performance statistics and historical analysis for all teams
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Team for Detailed View</label>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Team" />
                </SelectTrigger>
                <SelectContent>
                  {teamStats.map((team) => (
                    <SelectItem key={team.team} value={team.team}>
                      {team.team}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">All Teams Overview</h3>
              <OverviewTable />
            </div>

            {currentTeamData && (
              <>
                <div>
                  <h3 className="text-lg font-medium mb-4">{currentTeamData.team} - Detailed Historical Analysis</h3>
                  
                  {/* Core Statistics Cards */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                    <Card className="border-blue-200">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">All-Time Points For</span>
                        </div>
                        <p className="text-lg font-bold">
                          {currentTeamData.allTimeStats.totalPointsFor.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {currentTeamData.allTimeStats.avgPointsPerGame.toFixed(1)} PPG avg
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-red-200">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="h-4 w-4 text-red-600" />
                          <span className="text-sm font-medium">All-Time Points Against</span>
                        </div>
                        <p className="text-lg font-bold">
                          {currentTeamData.allTimeStats.totalPointsAgainst.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(currentTeamData.allTimeStats.totalPointsAgainst / (currentTeamData.allTimeStats.totalWins + currentTeamData.allTimeStats.totalLosses)).toFixed(1)} PPG against
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-orange-200">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="h-4 w-4 text-orange-600" />
                          <span className="text-sm font-medium">High-Scoring Games</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm">
                            <span className="font-bold text-orange-600">{currentTeamData.allTimeStats.highScoringGames.range300to399}</span> × 300-399 pts
                          </p>
                          <p className="text-sm">
                            <span className="font-bold text-red-600">{currentTeamData.allTimeStats.highScoringGames.range400plus}</span> × 400+ pts
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-purple-200">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Crown className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium">Playoffs (Winners)</span>
                        </div>
                        <p className="text-lg font-bold">
                          {currentTeamData.allTimeStats.winnersPlayoffStats.totalPointsFor.toFixed(1)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {currentTeamData.allTimeStats.winnersPlayoffStats.averagePointsFor.toFixed(1)} PPG | {currentTeamData.allTimeStats.winnersPlayoffStats.gamesPlayed} games
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Playoff Winners Bracket Detailed Stats */}
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="text-base">Winners Bracket Playoff Performance</CardTitle>
                      <CardDescription>
                        Historical performance in playoff winners bracket games only
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                              <p className="text-2xl font-bold text-green-600">
                                {currentTeamData.allTimeStats.winnersPlayoffStats.totalPointsFor.toFixed(1)}
                              </p>
                              <p className="text-sm text-muted-foreground">Total Points For</p>
                            </div>
                            <div className="text-center p-4 bg-red-50 rounded-lg">
                              <p className="text-2xl font-bold text-red-600">
                                {currentTeamData.allTimeStats.winnersPlayoffStats.totalPointsAgainst.toFixed(1)}
                              </p>
                              <p className="text-sm text-muted-foreground">Total Points Against</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                              <p className="text-2xl font-bold text-blue-600">
                                {currentTeamData.allTimeStats.winnersPlayoffStats.averagePointsFor.toFixed(1)}
                              </p>
                              <p className="text-sm text-muted-foreground">Avg Points For</p>
                            </div>
                            <div className="text-center p-4 bg-orange-50 rounded-lg">
                              <p className="text-2xl font-bold text-orange-600">
                                {currentTeamData.allTimeStats.winnersPlayoffStats.averagePointsAgainst.toFixed(1)}
                              </p>
                              <p className="text-sm text-muted-foreground">Avg Points Against</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Point Differential:</span>
                          <span className={`font-bold ${
                            (currentTeamData.allTimeStats.winnersPlayoffStats.totalPointsFor - currentTeamData.allTimeStats.winnersPlayoffStats.totalPointsAgainst) > 0 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {(currentTeamData.allTimeStats.winnersPlayoffStats.totalPointsFor - currentTeamData.allTimeStats.winnersPlayoffStats.totalPointsAgainst) > 0 ? '+' : ''}
                            {(currentTeamData.allTimeStats.winnersPlayoffStats.totalPointsFor - currentTeamData.allTimeStats.winnersPlayoffStats.totalPointsAgainst).toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Additional Performance Metrics */}
                  <div className="grid gap-4 md:grid-cols-3 mb-6">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">Best Season</span>
                        </div>
                        <p className="text-lg font-bold">
                          {currentTeamData.allTimeStats.bestSeasonRecord.wins}-{currentTeamData.allTimeStats.bestSeasonRecord.losses}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {currentTeamData.allTimeStats.bestSeasonRecord.season} Season
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingDown className="h-4 w-4 text-red-600" />
                          <span className="text-sm font-medium">Worst Season</span>
                        </div>
                        <p className="text-lg font-bold">
                          {currentTeamData.allTimeStats.worstSeasonRecord.wins}-{currentTeamData.allTimeStats.worstSeasonRecord.losses}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {currentTeamData.allTimeStats.worstSeasonRecord.season} Season
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Trophy className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm font-medium">Success Rate</span>
                        </div>
                        <p className="text-lg font-bold">
                          {((currentTeamData.allTimeStats.playoffAppearances / currentTeamData.seasonalPerformance.length) * 100).toFixed(0)}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Playoff Appearances
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 mb-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Points Scored by Season</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={currentTeamData.seasonalPerformance}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="season" />
                            <YAxis />
                            <Tooltip />
                            <Line 
                              type="monotone" 
                              dataKey="pointsFor" 
                              stroke="#8884d8" 
                              strokeWidth={2}
                              name="Points For"
                            />
                            <Line 
                              type="monotone" 
                              dataKey="pointsAgainst" 
                              stroke="#ff7c7c" 
                              strokeWidth={2}
                              name="Points Against"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Trades by Season</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={currentTeamData.tradesByYear}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="season" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="trades" fill="#82ca9d" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Season-by-Season Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Season</TableHead>
                            <TableHead>Record</TableHead>
                            <TableHead>Points For</TableHead>
                            <TableHead>Points Against</TableHead>
                            <TableHead>Playoff PF</TableHead>
                            <TableHead>Playoff PA</TableHead>
                            <TableHead>Finish</TableHead>
                            <TableHead>Achievements</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentTeamData.seasonalPerformance.map((season) => (
                            <TableRow key={season.season}>
                              <TableCell>{season.season}</TableCell>
                              <TableCell>{season.wins}-{season.losses}</TableCell>
                              <TableCell>{season.pointsFor.toFixed(1)}</TableCell>
                              <TableCell>{season.pointsAgainst.toFixed(1)}</TableCell>
                              <TableCell>
                                {season.playoffPointsFor ? season.playoffPointsFor.toFixed(1) : "-"}
                              </TableCell>
                              <TableCell>
                                {season.playoffPointsAgainst ? season.playoffPointsAgainst.toFixed(1) : "-"}
                              </TableCell>
                              <TableCell>{season.finish}</TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  {season.championship && (
                                    <Badge className="bg-yellow-100 text-yellow-800">Champion</Badge>
                                  )}
                                  {season.championshipGame && !season.championship && (
                                    <Badge className="bg-gray-100 text-gray-800">Runner-up</Badge>
                                  )}
                                  {season.playoffAppearance && !season.championshipGame && (
                                    <Badge variant="outline">Playoffs</Badge>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}