import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ArrowRightLeft, Users, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useState } from "react";

interface TradeAsset {
  type: 'player' | 'pick';
  name: string;
  position?: string;
  details?: string; // For picks: "2024 1st Round Pick"
}

interface Trade {
  id: string;
  date: string;
  season: number;
  week?: number;
  teams: {
    teamA: string;
    teamB: string;
  };
  assets: {
    teamA: TradeAsset[];
    teamB: TradeAsset[];
  };
  notes?: string;
  vetoVotes?: number;
  status: 'completed' | 'vetoed' | 'pending';
}

interface TradeHistoryProps {
  trades: Trade[];
}

export function TradeHistory({ trades }: TradeHistoryProps) {
  const [selectedSeason, setSelectedSeason] = useState<string>("all");
  const [selectedTeam, setSelectedTeam] = useState<string>("all");

  const seasons = Array.from(new Set(trades.map(trade => trade.season))).sort((a, b) => b - a);
  const teams = Array.from(new Set(trades.flatMap(trade => [trade.teams.teamA, trade.teams.teamB])));

  const filteredTrades = trades.filter(trade => {
    const seasonMatch = selectedSeason === "all" || trade.season.toString() === selectedSeason;
    const teamMatch = selectedTeam === "all" || 
      trade.teams.teamA === selectedTeam || 
      trade.teams.teamB === selectedTeam;
    return seasonMatch && teamMatch && trade.status === 'completed';
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getAssetDisplay = (asset: TradeAsset) => {
    if (asset.type === 'player') {
      return (
        <span className="flex items-center gap-1">
          <Badge variant="outline" className="text-xs">{asset.position}</Badge>
          {asset.name}
        </span>
      );
    } else {
      return (
        <span className="flex items-center gap-1">
          <Badge variant="secondary" className="text-xs">Pick</Badge>
          {asset.details}
        </span>
      );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Trade History</CardTitle>
          <CardDescription>
            Complete record of all completed trades in league history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Season</label>
              <Select value={selectedSeason} onValueChange={setSelectedSeason}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Seasons</SelectItem>
                  {seasons.map((season) => (
                    <SelectItem key={season} value={season.toString()}>
                      {season}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Team</label>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Teams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team} value={team}>
                      {team}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredTrades.map((trade) => (
              <Card key={trade.id} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ArrowRightLeft className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">
                          {trade.teams.teamA} ↔ {trade.teams.teamB}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {trade.date}
                        </span>
                        <Badge variant="outline">
                          {trade.season} Season
                          {trade.week && ` - Week ${trade.week}`}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">{trade.teams.teamA} Receives:</h4>
                        <div className="space-y-1 pl-4 border-l-2 border-green-200">
                          {trade.assets.teamA.map((asset, index) => (
                            <div key={index} className="text-sm">
                              {getAssetDisplay(asset)}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">{trade.teams.teamB} Receives:</h4>
                        <div className="space-y-1 pl-4 border-l-2 border-blue-200">
                          {trade.assets.teamB.map((asset, index) => (
                            <div key={index} className="text-sm">
                              {getAssetDisplay(asset)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {trade.notes && (
                      <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                        <strong>Notes:</strong> {trade.notes}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredTrades.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No trades found for the selected filters.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}