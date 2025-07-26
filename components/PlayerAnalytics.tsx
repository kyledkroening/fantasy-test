import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "./ui/badge";

interface PlayerStats {
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
  yearlyPerformance: {
    year: number;
    wins: number;
    losses: number;
    pointsFor: number;
    finish: number;
  }[];
}

interface PlayerAnalyticsProps {
  playerStats: PlayerStats[];
  selectedPlayer?: string;
}

export function PlayerAnalytics({ playerStats, selectedPlayer }: PlayerAnalyticsProps) {
  const selectedPlayerData = selectedPlayer 
    ? playerStats.find(p => p.manager === selectedPlayer)
    : null;

  const getPerformanceBadge = (winPercentage: number) => {
    if (winPercentage >= 0.7) return <Badge className="bg-green-100 text-green-800">Elite</Badge>;
    if (winPercentage >= 0.6) return <Badge className="bg-blue-100 text-blue-800">Strong</Badge>;
    if (winPercentage >= 0.5) return <Badge className="bg-yellow-100 text-yellow-800">Average</Badge>;
    return <Badge className="bg-red-100 text-red-800">Below Average</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manager Performance Overview</CardTitle>
          <CardDescription>
            Career statistics for all league members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Manager</TableHead>
                <TableHead>Seasons</TableHead>
                <TableHead>Record</TableHead>
                <TableHead>Win %</TableHead>
                <TableHead>Avg PF</TableHead>
                <TableHead>Championships</TableHead>
                <TableHead>Best Finish</TableHead>
                <TableHead>Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {playerStats.map((player) => (
                <TableRow key={player.manager}>
                  <TableCell className="font-medium">{player.manager}</TableCell>
                  <TableCell>{player.totalSeasons}</TableCell>
                  <TableCell>{player.wins}-{player.losses}</TableCell>
                  <TableCell>{(player.winPercentage * 100).toFixed(1)}%</TableCell>
                  <TableCell>{player.averagePointsFor.toFixed(1)}</TableCell>
                  <TableCell>{player.championships}</TableCell>
                  <TableCell>{player.bestFinish}</TableCell>
                  <TableCell>{getPerformanceBadge(player.winPercentage)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedPlayerData && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedPlayerData.manager} - Career Performance</CardTitle>
            <CardDescription>
              Year-by-year performance trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="mb-4">Career Highlights</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Championships:</span>
                    <span>{selectedPlayerData.championships}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Playoff Appearances:</span>
                    <span>{selectedPlayerData.playoffAppearances}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Best Finish:</span>
                    <span>{selectedPlayerData.bestFinish}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Points:</span>
                    <span>{selectedPlayerData.averagePointsFor.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="mb-4">Points Scored by Year</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={selectedPlayerData.yearlyPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="pointsFor" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}