import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useState } from "react";
import { Trophy, Target } from "lucide-react";

interface WeeklyMatchup {
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

interface WeeklyMatchupData {
  season: number;
  platform: string;
  regularSeasonWeeks: number;
  playoffWeeks: number;
  matchups: WeeklyMatchup[];
}

interface WeeklyMatchupsProps {
  matchupData: WeeklyMatchupData[];
}

export function WeeklyMatchups({ matchupData }: WeeklyMatchupsProps) {
  const [selectedSeason, setSelectedSeason] = useState<string>(matchupData[0]?.season.toString() || "");
  const [selectedWeek, setSelectedWeek] = useState<string>("all");

  const currentSeasonData = matchupData.find(data => data.season.toString() === selectedSeason);
  const allWeeks = currentSeasonData ? 
    Array.from({ length: currentSeasonData.regularSeasonWeeks + currentSeasonData.playoffWeeks }, (_, i) => i + 1) : [];

  const filteredMatchups = currentSeasonData?.matchups.filter(matchup => 
    selectedWeek === "all" || matchup.week.toString() === selectedWeek
  ) || [];

  const getHighestScoringGame = (matchups: WeeklyMatchup[]) => {
    return matchups.reduce((highest, current) => {
      const currentTotal = current.homeScore + current.awayScore;
      const highestTotal = highest.homeScore + highest.awayScore;
      return currentTotal > highestTotal ? current : highest;
    }, matchups[0]);
  };

  const getClosestGame = (matchups: WeeklyMatchup[]) => {
    return matchups.reduce((closest, current) => {
      return current.marginOfVictory < closest.marginOfVictory ? current : closest;
    }, matchups[0]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Weekly Matchup Results</CardTitle>
          <CardDescription>
            Complete weekly results for all seasons
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Season</label>
              <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Season" />
                </SelectTrigger>
                <SelectContent>
                  {matchupData.map((data) => (
                    <SelectItem key={data.season} value={data.season.toString()}>
                      {data.season}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Week</label>
              <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All Weeks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Weeks</SelectItem>
                  {allWeeks.map((week) => (
                    <SelectItem key={week} value={week.toString()}>
                      Week {week}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {currentSeasonData && (
            <div className="space-y-4">
              {selectedWeek === "all" && filteredMatchups.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 mb-6">
                  <Card className="border-yellow-200">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium">Highest Scoring Game</span>
                      </div>
                      {(() => {
                        const game = getHighestScoringGame(filteredMatchups);
                        return (
                          <div className="text-sm">
                            <p>Week {game.week}: {game.homeTeam} vs {game.awayTeam}</p>
                            <p className="font-medium">
                              {game.homeScore.toFixed(1)} - {game.awayScore.toFixed(1)} 
                              ({(game.homeScore + game.awayScore).toFixed(1)} total)
                            </p>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Closest Game</span>
                      </div>
                      {(() => {
                        const game = getClosestGame(filteredMatchups);
                        return (
                          <div className="text-sm">
                            <p>Week {game.week}: {game.homeTeam} vs {game.awayTeam}</p>
                            <p className="font-medium">
                              {game.homeScore.toFixed(1)} - {game.awayScore.toFixed(1)} 
                              (Margin: {game.marginOfVictory.toFixed(1)})
                            </p>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </div>
              )}

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Week</TableHead>
                    <TableHead>Matchup</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Winner</TableHead>
                    <TableHead>Margin</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMatchups.map((matchup, index) => (
                    <TableRow key={index}>
                      <TableCell>{matchup.week}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>{matchup.homeTeam} (H)</div>
                          <div className="text-muted-foreground">vs</div>
                          <div>{matchup.awayTeam} (A)</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className={matchup.winner === matchup.homeTeam ? "font-medium" : "text-muted-foreground"}>
                            {matchup.homeScore.toFixed(1)}
                          </div>
                          <div className={matchup.winner === matchup.awayTeam ? "font-medium" : "text-muted-foreground"}>
                            {matchup.awayScore.toFixed(1)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{matchup.winner}</TableCell>
                      <TableCell>{matchup.marginOfVictory.toFixed(1)}</TableCell>
                      <TableCell>
                        {matchup.isPlayoff ? (
                          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                            {matchup.playoffRound}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Regular</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}