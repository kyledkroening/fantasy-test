import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useState } from "react";

interface HeadToHeadRecord {
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
    lastMeeting?: string;
    lastWinner?: string;
  };
}

interface HeadToHeadRecordsProps {
  records: HeadToHeadRecord[];
  teams: string[];
}

export function HeadToHeadRecords({ records, teams }: HeadToHeadRecordsProps) {
  const [selectedTeam, setSelectedTeam] = useState<string>("all");

  const filteredRecords = records.filter(record => 
    selectedTeam === "all" || record.teamA === selectedTeam || record.teamB === selectedTeam
  );

  const getWinPercentage = (wins: number, total: number) => {
    if (total === 0) return "0.0%";
    return ((wins / total) * 100).toFixed(1) + "%";
  };

  const getAverageScore = (totalPoints: number, games: number) => {
    if (games === 0) return "0.0";
    return (totalPoints / games).toFixed(1);
  };

  const getDominanceColor = (wins: number, total: number) => {
    if (total === 0) return "";
    const percentage = wins / total;
    if (percentage >= 0.7) return "text-green-600 font-medium";
    if (percentage >= 0.6) return "text-blue-600";
    if (percentage <= 0.3) return "text-red-600";
    return "";
  };

  const RecordTable = ({ isPlayoffs = false }: { isPlayoffs?: boolean }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Matchup</TableHead>
          <TableHead>Record</TableHead>
          <TableHead>Win %</TableHead>
          <TableHead>Avg Score</TableHead>
          <TableHead>Last Meeting</TableHead>
          <TableHead>Last Winner</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredRecords.map((record, index) => {
          const data = isPlayoffs ? record.playoffs : record.regularSeason;
          return (
            <TableRow key={index}>
              <TableCell className="font-medium">
                {record.teamA} vs {record.teamB}
              </TableCell>
              <TableCell>
                <div className="space-y-1 text-sm">
                  <div className={getDominanceColor(data.teamAWins, data.totalGames)}>
                    {record.teamA}: {data.teamAWins}-{data.teamBWins}
                  </div>
                  <div className={getDominanceColor(data.teamBWins, data.totalGames)}>
                    {record.teamB}: {data.teamBWins}-{data.teamAWins}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1 text-sm">
                  <div className={getDominanceColor(data.teamAWins, data.totalGames)}>
                    {getWinPercentage(data.teamAWins, data.totalGames)}
                  </div>
                  <div className={getDominanceColor(data.teamBWins, data.totalGames)}>
                    {getWinPercentage(data.teamBWins, data.totalGames)}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1 text-sm">
                  <div>{getAverageScore(data.teamAPointsFor, data.totalGames)}</div>
                  <div>{getAverageScore(data.teamBPointsFor, data.totalGames)}</div>
                </div>
              </TableCell>
              <TableCell>
                {data.lastMeeting || (isPlayoffs ? "Never" : "N/A")}
              </TableCell>
              <TableCell>
                {data.lastWinner ? (
                  <Badge variant="outline">{data.lastWinner}</Badge>
                ) : (
                  <span className="text-muted-foreground">
                    {isPlayoffs ? "N/A" : "N/A"}
                  </span>
                )}
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
          <CardTitle>Head-to-Head Records</CardTitle>
          <CardDescription>
            Historical matchup records between all teams
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by Team</label>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Teams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Matchups</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team} value={team}>
                      {team}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="regular-season" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="regular-season">Regular Season</TabsTrigger>
              <TabsTrigger value="playoffs">Playoffs (Winners Bracket)</TabsTrigger>
            </TabsList>
            
            <TabsContent value="regular-season" className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Regular season matchups across all years. Includes all head-to-head games during weeks 1-{" "}
                {/* Assuming 14 week regular season */}14.
              </div>
              <RecordTable />
            </TabsContent>
            
            <TabsContent value="playoffs" className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Winners bracket playoff matchups only. Excludes consolation bracket games.
              </div>
              <RecordTable isPlayoffs={true} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}