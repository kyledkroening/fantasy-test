import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Trophy, Medal, Award } from "lucide-react";

interface SeasonRecord {
  year: number;
  platform: string;
  champion: string;
  runnerUp: string;
  thirdPlace: string;
  regularSeasonWinner: string;
  records: {
    manager: string;
    wins: number;
    losses: number;
    pointsFor: number;
    pointsAgainst: number;
    place: number;
  }[];
}

interface HistoricalStandingsProps {
  seasons: SeasonRecord[];
}

export function HistoricalStandings({ seasons }: HistoricalStandingsProps) {
  const getPositionIcon = (place: number) => {
    switch (place) {
      case 1:
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 2:
        return <Medal className="h-4 w-4 text-gray-400" />;
      case 3:
        return <Award className="h-4 w-4 text-amber-600" />;
      default:
        return null;
    }
  };

  const getPlatformColor = (platform: string) => {
    return platform.toLowerCase() === 'espn' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historical Standings</CardTitle>
        <CardDescription>
          Season-by-season results and championship history
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {seasons.map((season) => (
            <div key={season.year} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">{season.year} Season</h3>
                  <Badge className={getPlatformColor(season.platform)}>
                    {season.platform}
                  </Badge>
                </div>
                <div className="flex gap-4 text-sm">
                  <span><strong>Champion:</strong> {season.champion}</span>
                  <span><strong>Regular Season:</strong> {season.regularSeasonWinner}</span>
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Rank</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Record</TableHead>
                    <TableHead>Points For</TableHead>
                    <TableHead>Points Against</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {season.records.map((record) => (
                    <TableRow key={record.manager}>
                      <TableCell className="flex items-center gap-2">
                        {getPositionIcon(record.place)}
                        {record.place}
                      </TableCell>
                      <TableCell className="font-medium">{record.manager}</TableCell>
                      <TableCell>{record.wins}-{record.losses}</TableCell>
                      <TableCell>{record.pointsFor.toFixed(1)}</TableCell>
                      <TableCell>{record.pointsAgainst.toFixed(1)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}