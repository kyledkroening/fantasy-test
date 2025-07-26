import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Trophy, Users, Calendar, TrendingUp } from "lucide-react";

interface LeagueStats {
  totalSeasons: number;
  totalManagers: number;
  platformYears: { platform: string; years: number }[];
  currentChampion: string;
  mostChampionships: { manager: string; count: number };
}

interface DashboardProps {
  leagueStats: LeagueStats;
}

export function Dashboard({ leagueStats }: DashboardProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Seasons</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{leagueStats.totalSeasons}</div>
          <div className="flex gap-2 mt-2">
            {leagueStats.platformYears.map((platform) => (
              <Badge key={platform.platform} variant="secondary">
                {platform.platform}: {platform.years}yr
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">League Members</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{leagueStats.totalManagers}</div>
          <p className="text-xs text-muted-foreground">
            Active managers across all seasons
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Champion</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{leagueStats.currentChampion}</div>
          <p className="text-xs text-muted-foreground">
            2024 Season Winner
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Most Titles</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{leagueStats.mostChampionships.manager}</div>
          <p className="text-xs text-muted-foreground">
            {leagueStats.mostChampionships.count} championships
          </p>
        </CardContent>
      </Card>
    </div>
  );
}