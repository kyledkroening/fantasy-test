import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { ScrollArea } from "./ui/scroll-area";
import { Calendar, Edit, Plus } from "lucide-react";

interface RuleAmendment {
  date: string;
  season: number;
  description: string;
  votingResult?: string;
  proposedBy: string;
}

interface LeagueRule {
  id: string;
  category: string;
  title: string;
  description: string;
  currentValue: string;
  effectiveDate: string;
  amendments: RuleAmendment[];
}

interface LeagueRulesProps {
  rules: LeagueRule[];
}

export function LeagueRules({ rules }: LeagueRulesProps) {
  const categories = Array.from(new Set(rules.map(rule => rule.category)));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>League Rules & Constitution</CardTitle>
          <CardDescription>
            Official league rules and historical amendments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {categories.map((category) => {
              const categoryRules = rules.filter(rule => rule.category === category);
              return (
                <AccordionItem key={category} value={category}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center justify-between w-full pr-4">
                      <span>{category}</span>
                      <Badge variant="secondary">
                        {categoryRules.length} rule{categoryRules.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      {categoryRules.map((rule) => (
                        <Card key={rule.id} className="border-l-4 border-l-primary">
                          <CardContent className="pt-4">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <h4 className="font-medium">{rule.title}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {rule.description}
                                  </p>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  Since {rule.effectiveDate}
                                </Badge>
                              </div>
                              
                              <div className="bg-muted p-3 rounded">
                                <p className="text-sm">
                                  <strong>Current Setting:</strong> {rule.currentValue}
                                </p>
                              </div>

                              {rule.amendments.length > 0 && (
                                <div className="space-y-2">
                                  <h5 className="text-sm font-medium flex items-center gap-1">
                                    <Edit className="h-3 w-3" />
                                    Amendment History ({rule.amendments.length})
                                  </h5>
                                  <ScrollArea className="h-32">
                                    <div className="space-y-2 pr-4">
                                      {rule.amendments.map((amendment, index) => (
                                        <div key={index} className="border-l-2 border-muted-foreground/20 pl-3 text-xs">
                                          <div className="flex items-center gap-2 mb-1">
                                            <Calendar className="h-3 w-3" />
                                            <span className="font-medium">{amendment.date}</span>
                                            <Badge variant="outline" size="sm">
                                              {amendment.season} Season
                                            </Badge>
                                          </div>
                                          <p className="text-muted-foreground mb-1">
                                            {amendment.description}
                                          </p>
                                          <p className="text-xs">
                                            Proposed by: <span className="font-medium">{amendment.proposedBy}</span>
                                            {amendment.votingResult && (
                                              <span className="ml-2 text-muted-foreground">
                                                | Vote: {amendment.votingResult}
                                              </span>
                                            )}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  </ScrollArea>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}