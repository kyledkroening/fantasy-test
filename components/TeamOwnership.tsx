import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Users, Calendar, Crown, ArrowDown } from "lucide-react";

interface OwnershipPeriod {
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

interface TeamLineage {
  teamId: string;
  currentTeamName: string;
  currentOwner: string;
  foundingSeason: number;
  ownershipHistory: OwnershipPeriod[];
}

interface TeamOwnershipProps {
  teamLineages: TeamLineage[];
}

export function TeamOwnership({ teamLineages }: TeamOwnershipProps) {
  const getOwnershipDuration = (period: OwnershipPeriod) => {
    const end = period.endSeason || new Date().getFullYear();
    return end - period.startSeason + 1;
  };

  const getReasonBadgeColor = (reason: string) => {
    switch (reason.toLowerCase()) {
      case 'founding member':
        return 'bg-green-100 text-green-800';
      case 'expansion':
        return 'bg-blue-100 text-blue-800';
      case 'trade':
        return 'bg-yellow-100 text-yellow-800';
      case 'inheritance':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Ownership Lineage</CardTitle>
          <CardDescription>
            Complete ownership history for all 10 league teams
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {teamLineages.map((team) => (
              <Card key={team.teamId} className="border-l-4 border-l-primary">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{team.currentTeamName}</h3>
                        <p className="text-sm text-muted-foreground">
                          Current Owner: <span className="font-medium">{team.currentOwner}</span>
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-medium">Est. {team.foundingSeason}</p>
                        <p className="text-muted-foreground">
                          {team.ownershipHistory.length} owner{team.ownershipHistory.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-medium flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        Ownership Timeline
                      </h4>
                      
                      <div className="space-y-2">
                        {team.ownershipHistory.map((period, index) => (
                          <div key={index} className="relative">
                            {index < team.ownershipHistory.length - 1 && (
                              <div className="absolute left-4 top-8 w-0.5 h-6 bg-border"></div>
                            )}
                            
                            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                {index === 0 ? (
                                  <Crown className="h-4 w-4 text-primary" />
                                ) : (
                                  <ArrowDown className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                              
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium">{period.owner}</p>
                                    <p className="text-sm text-muted-foreground">
                                      Team: {period.teamName}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-sm">
                                        {period.startSeason}
                                        {period.endSeason ? ` - ${period.endSeason}` : ' - Present'}
                                      </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      {getOwnershipDuration(period)} season{getOwnershipDuration(period) !== 1 ? 's' : ''}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <Badge className={getReasonBadgeColor(period.reason)}>
                                    {period.reason}
                                  </Badge>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                  <div className="text-center p-2 bg-background rounded">
                                    <p className="font-medium text-yellow-600">
                                      {period.achievements.championships}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Championships</p>
                                  </div>
                                  <div className="text-center p-2 bg-background rounded">
                                    <p className="font-medium text-blue-600">
                                      {period.achievements.playoffAppearances}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Playoffs</p>
                                  </div>
                                  <div className="text-center p-2 bg-background rounded">
                                    <p className="font-medium text-green-600">
                                      {period.achievements.regularSeasonTitles}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Reg. Season</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}