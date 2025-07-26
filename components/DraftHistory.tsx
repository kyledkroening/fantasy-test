import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useState } from "react";
import { Crown, ArrowRightLeft, Star } from "lucide-react";

interface DraftPick {
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

interface DraftData {
  year: number;
  platform: string;
  draftDate: string;
  draftType: string;
  picks: DraftPick[];
}

interface DraftHistoryProps {
  draftData: DraftData[];
}

export function DraftHistory({ draftData }: DraftHistoryProps) {
  const [selectedYear, setSelectedYear] = useState<string>(draftData[0]?.year.toString() || "");
  const [selectedTeam, setSelectedTeam] = useState<string>("all");

  const currentDraft = draftData.find(draft => draft.year.toString() === selectedYear);
  const teams = Array.from(new Set(currentDraft?.picks.map(pick => pick.team) || []));

  const filteredPicks = currentDraft?.picks.filter(pick => 
    selectedTeam === "all" || pick.team === selectedTeam
  ) || [];

  const getPickTypeIcon = (pick: DraftPick) => {
    if (pick.isKeeper) return <Star className="h-4 w-4 text-yellow-500" />;
    if (pick.isFromTrade) return <ArrowRightLeft className="h-4 w-4 text-blue-500" />;
    return null;
  };

  const getPickTypeBadge = (pick: DraftPick) => {
    if (pick.isKeeper) return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Keeper</Badge>;
    if (pick.isFromTrade) return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Trade</Badge>;
    return null;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Draft History</CardTitle>
          <CardDescription>
            Complete draft records with keeper designations and trade information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Season</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {draftData.map((draft) => (
                    <SelectItem key={draft.year} value={draft.year.toString()}>
                      {draft.year}
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

          {currentDraft && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p><strong>Draft Date:</strong> {currentDraft.draftDate}</p>
                  <p><strong>Draft Type:</strong> {currentDraft.draftType}</p>
                </div>
                <div>
                  <p><strong>Platform:</strong> {currentDraft.platform}</p>
                  <p><strong>Total Picks:</strong> {currentDraft.picks.length}</p>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Round</TableHead>
                    <TableHead className="w-16">Pick</TableHead>
                    <TableHead className="w-20">Overall</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>ADP</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPicks.map((pick, index) => (
                    <TableRow key={index}>
                      <TableCell>{pick.round}</TableCell>
                      <TableCell>{pick.pick}</TableCell>
                      <TableCell>{pick.overallPick}</TableCell>
                      <TableCell className="font-medium">{pick.team}</TableCell>
                      <TableCell className="flex items-center gap-2">
                        {getPickTypeIcon(pick)}
                        {pick.player}
                      </TableCell>
                      <TableCell>{pick.position}</TableCell>
                      <TableCell>{pick.adp || "-"}</TableCell>
                      <TableCell>{getPickTypeBadge(pick)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {pick.isFromTrade && pick.tradeOrigin && `From ${pick.tradeOrigin}`}
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