import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface ChampionshipData {
  manager: string;
  championships: number;
  runnerUps: number;
  color: string;
}

interface YearlyChampion {
  year: number;
  champion: string;
  platform: string;
}

interface ChampionshipHistoryProps {
  championshipData: ChampionshipData[];
  yearlyChampions: YearlyChampion[];
}

export function ChampionshipHistory({ championshipData, yearlyChampions }: ChampionshipHistoryProps) {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Championship Count</CardTitle>
          <CardDescription>
            Total championships and runner-up finishes by manager
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={championshipData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="manager" 
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="championships" fill="#FFD700" name="Championships" />
              <Bar dataKey="runnerUps" fill="#C0C0C0" name="Runner-ups" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Championship Distribution</CardTitle>
          <CardDescription>
            Percentage of championships won by each manager
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={championshipData.filter(d => d.championships > 0)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ manager, championships }) => `${manager}: ${championships}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="championships"
              >
                {championshipData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Championship Timeline</CardTitle>
          <CardDescription>
            Year-by-year championship winners across platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {yearlyChampions.map((champion) => (
              <div key={champion.year} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg">{champion.year}</span>
                  <span className="text-sm px-2 py-1 rounded bg-secondary">
                    {champion.platform}
                  </span>
                </div>
                <span className="font-medium">{champion.champion}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}