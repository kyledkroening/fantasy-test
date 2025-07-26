import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Upload, Download, Database, RefreshCw, AlertTriangle, Calendar, Trash2, Lock, Globe, CheckCircle, XCircle, Loader2, Info } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Progress } from "./ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import ESPNFantasyAPI, { ESPNAPIError } from "../services/espnApi";

interface DataSource {
  id: string;
  platform: string;
  leagueId: string;
  years: string;
  status: 'connected' | 'pending' | 'error' | 'syncing';
  lastSync: string;
  isPrivate?: boolean;
  swid?: string;
  espn_s2?: string;
  errorMessage?: string;
  syncProgress?: number;
  lastUsedEndpoint?: string;
  availableEndpoints?: string[];
}

interface DataManagementProps {
  dataSources: DataSource[];
  onAddDataSource: (source: Omit<DataSource, 'id' | 'status' | 'lastSync'>) => void;
  onSyncData: (sourceId: string) => void;
  onRemoveDataSource: (sourceId: string) => void;
  onUpdateDataSource: (sourceId: string, updates: Partial<DataSource>) => void;
}

export function DataManagement({ 
  dataSources, 
  onAddDataSource, 
  onSyncData, 
  onRemoveDataSource,
  onUpdateDataSource 
}: DataManagementProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [isPrivateLeague, setIsPrivateLeague] = useState<boolean>(false);
  const [isTestingConnection, setIsTestingConnection] = useState<string | null>(null);
  const [endpointStatus, setEndpointStatus] = useState<{[key: string]: any}>({});

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const platform = formData.get('platform') as string;
    const leagueId = formData.get('leagueId') as string;
    const years = formData.get('years') as string;
    const leagueType = formData.get('leagueType') as string;
    const swid = formData.get('swid') as string;
    const espn_s2 = formData.get('espn_s2') as string;
    
    const newSource: Omit<DataSource, 'id' | 'status' | 'lastSync'> = {
      platform,
      leagueId,
      years
    };

    // Add ESPN private league authentication if applicable
    if (platform === 'ESPN' && leagueType === 'private') {
      newSource.isPrivate = true;
      newSource.swid = swid;
      newSource.espn_s2 = espn_s2;
    } else if (platform === 'ESPN') {
      newSource.isPrivate = false;
    }
    
    onAddDataSource(newSource);
    e.currentTarget.reset();
    setSelectedPlatform("");
    setIsPrivateLeague(false);
  };

  const handlePlatformChange = (value: string) => {
    setSelectedPlatform(value);
    setIsPrivateLeague(false);
  };

  const handleDeleteConfirm = (sourceId: string) => {
    onRemoveDataSource(sourceId);
  };

  const handleTestConnection = async (source: DataSource) => {
    if (source.platform !== 'ESPN') return;
    
    setIsTestingConnection(source.id);
    
    try {
      // Parse years to get a test year
      const yearsArray = source.years.includes('-') 
        ? source.years.split('-').map(y => parseInt(y.trim()))
        : [parseInt(source.years.trim())];
      
      const testYear = yearsArray[0];
      
      const cookies = source.isPrivate ? {
        swid: source.swid || '',
        espn_s2: source.espn_s2 || ''
      } : undefined;

      const result = await ESPNFantasyAPI.testConnection(source.leagueId, testYear, cookies);
      
      if (result.success) {
        onUpdateDataSource(source.id, {
          status: 'connected',
          errorMessage: undefined,
          lastSync: new Date().toLocaleString(),
          lastUsedEndpoint: result.endpoint,
          availableEndpoints: result.availableEndpoints
        });

        // Get detailed endpoint status for diagnostics
        const endpointStatuses = await ESPNFantasyAPI.getEndpointStatus(source.leagueId, testYear, cookies);
        setEndpointStatus(prev => ({
          ...prev,
          [source.id]: endpointStatuses
        }));
      } else {
        onUpdateDataSource(source.id, {
          status: 'error',
          errorMessage: result.error,
          availableEndpoints: result.availableEndpoints
        });
      }
    } catch (error) {
      const errorMessage = error instanceof ESPNAPIError 
        ? `ESPN API Error: ${error.message}` 
        : `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      
      onUpdateDataSource(source.id, {
        status: 'error',
        errorMessage
      });
    } finally {
      setIsTestingConnection(null);
    }
  };

  const handleSyncESPNData = async (source: DataSource) => {
    if (source.platform !== 'ESPN') {
      onSyncData(source.id);
      return;
    }

    onUpdateDataSource(source.id, { status: 'syncing', syncProgress: 0 });

    try {
      // Parse years range
      const yearsArray = source.years.includes('-') 
        ? (() => {
            const [start, end] = source.years.split('-').map(y => parseInt(y.trim()));
            return Array.from({ length: end - start + 1 }, (_, i) => start + i);
          })()
        : [parseInt(source.years.trim())];

      const cookies = source.isPrivate ? {
        swid: source.swid || '',
        espn_s2: source.espn_s2 || ''
      } : undefined;

      const totalYears = yearsArray.length;
      let completedYears = 0;
      const endpointUsage: {[key: string]: number} = {};

      // Fetch data for each year with enhanced logging
      const results = await ESPNFantasyAPI.fetchMultipleYears(
        source.leagueId,
        yearsArray[0],
        yearsArray[yearsArray.length - 1],
        cookies
      );

      // Track endpoint usage
      results.forEach(result => {
        endpointUsage[result.endpoint] = (endpointUsage[result.endpoint] || 0) + 1;
      });

      // Update progress
      for (const result of results) {
        completedYears++;
        const progress = (completedYears / totalYears) * 100;
        
        onUpdateDataSource(source.id, { 
          syncProgress: progress 
        });

        // Small delay for UI feedback
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Mark as completed with endpoint usage info
      const primaryEndpoint = Object.keys(endpointUsage).reduce((a, b) => 
        endpointUsage[a] > endpointUsage[b] ? a : b
      );

      onUpdateDataSource(source.id, {
        status: 'connected',
        lastSync: new Date().toLocaleString(),
        syncProgress: undefined,
        errorMessage: undefined,
        lastUsedEndpoint: primaryEndpoint
      });

      console.log(`Sync completed. Endpoint usage:`, endpointUsage);

    } catch (error) {
      const errorMessage = error instanceof ESPNAPIError 
        ? `Sync failed: ${error.message}` 
        : `Sync error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      
      onUpdateDataSource(source.id, {
        status: 'error',
        errorMessage,
        syncProgress: undefined
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'syncing': return 'text-blue-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (source: DataSource) => {
    switch (source.status) {
      case 'connected': 
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': 
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'syncing': 
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      default: 
        return null;
    }
  };

  const getPlatformBadgeColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'espn': return 'bg-red-100 text-red-800';
      case 'sleeper': return 'bg-blue-100 text-blue-800';
      case 'manual upload': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeleteWarning = (source: DataSource) => {
    if (source.years === "2008-2019") {
      return "This will remove 12 seasons of historical ESPN data (2008-2019). This data may be difficult to re-import.";
    }
    if (source.years === "2021-2023") {
      return "This will remove 3 seasons of ESPN data (2021-2023) from the new league ID.";
    }
    if (source.years === "2024") {
      return "This will remove the current Sleeper season data (2024).";
    }
    if (source.years === "2020") {
      return "This will remove the manually reconstructed 2020 season data. This data cannot be recovered from APIs.";
    }
    return "This will permanently remove this data source and all associated data.";
  };

  const isDeletionCritical = (source: DataSource) => {
    return source.years === "2008-2019" || source.years === "2020";
  };

  return (
    <div className="space-y-6">
      {/* Upcoming 2025 Draft Alert */}
      <Alert>
        <Calendar className="h-4 w-4" />
        <AlertDescription>
          <strong>2025 Draft Scheduled:</strong> August 28, 2025 • Configure your Sleeper league settings and keeper selections before the draft date.
        </AlertDescription>
      </Alert>

      {/* Enhanced Data Coverage Overview */}
      <Card>
        <CardHeader>
          <CardTitle>League Data Coverage</CardTitle>
          <CardDescription>
            Overview of available data across 17 seasons (2008-2024) with multiple ESPN API endpoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-2xl font-bold text-green-600">12</p>
              <p className="text-sm text-green-700">ESPN API Available</p>
              <p className="text-xs text-muted-foreground">2008-2019</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-2xl font-bold text-red-600">1</p>
              <p className="text-sm text-red-700">Missing Data</p>
              <p className="text-xs text-muted-foreground">2020 (Excel files)</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-2xl font-bold text-blue-600">3</p>
              <p className="text-sm text-blue-700">ESPN New League</p>
              <p className="text-xs text-muted-foreground">2021-2023</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-2xl font-bold text-purple-600">1</p>
              <p className="text-sm text-purple-700">Sleeper Era</p>
              <p className="text-xs text-muted-foreground">2024+</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Data Source</CardTitle>
          <CardDescription>
            Connect additional fantasy football league data or upload manual files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <Select name="platform" value={selectedPlatform} onValueChange={handlePlatformChange} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ESPN">ESPN Fantasy Football</SelectItem>
                    <SelectItem value="Sleeper">Sleeper Fantasy Football</SelectItem>
                    <SelectItem value="Yahoo">Yahoo Fantasy Football</SelectItem>
                    <SelectItem value="Manual Upload">Manual Upload (CSV/Excel)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="leagueId">League ID</Label>
                <Input
                  name="leagueId"
                  placeholder="Enter league ID or 'N/A' for manual"
                  required
                />
              </div>
            </div>

            {/* Enhanced ESPN League Type Selection */}
            {selectedPlatform === 'ESPN' && (
              <div className="space-y-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <Label>ESPN League Type</Label>
                <RadioGroup 
                  name="leagueType" 
                  value={isPrivateLeague ? 'private' : 'public'} 
                  onValueChange={(value) => setIsPrivateLeague(value === 'private')}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="public" id="public" />
                    <Label htmlFor="public" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Public League
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="private" id="private" />
                    <Label htmlFor="private" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Private League
                    </Label>
                  </div>
                </RadioGroup>
                
                {/* ESPN Private League Authentication */}
                {isPrivateLeague && (
                  <div className="mt-4 space-y-4 p-4 bg-white border border-red-300 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Lock className="h-4 w-4 text-red-600 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-medium text-red-800">Private League Authentication</h4>
                        <p className="text-sm text-red-700 mt-1">
                          Private ESPN leagues require authentication cookies. You can find these in your browser's developer tools after logging into ESPN Fantasy.
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="swid">SWID Cookie</Label>
                        <Input
                          name="swid"
                          placeholder="e.g., {12345678-1234-1234-1234-123456789012}"
                          required={isPrivateLeague}
                          className="font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                          Format: {"{"}XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX{"}"}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="espn_s2">ESPN_S2 Cookie</Label>
                        <Input
                          name="espn_s2"
                          placeholder="Long alphanumeric string..."
                          required={isPrivateLeague}
                          className="font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                          Long string of letters and numbers
                        </p>
                      </div>
                    </div>
                    
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Security Note:</strong> These cookies provide access to your ESPN account. Keep them secure and never share them with others.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {/* Enhanced ESPN API Endpoint Information */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Enhanced ESPN API Integration</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>• <strong>Multiple Endpoints:</strong> LM-API-Reads, Fantasy-ESPN, Historical-ESPN</p>
                    <p>• <strong>Automatic Fallback:</strong> If one API fails, automatically tries others</p>
                    <p>• <strong>2008-2017:</strong> Historical API with fallback support</p>
                    <p>• <strong>2018-2024:</strong> Current APIs with enhanced views (mMatchup, mStandings, mRoster)</p>
                    <p>• <strong>Smart Routing:</strong> Automatically selects best endpoint for each year</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="years">Years (e.g., 2025 or 2021-2023)</Label>
              <Input
                name="years"
                placeholder="Enter year range"
                required
              />
            </div>
            
            <Button type="submit" className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              Add Data Source
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connected Data Sources</CardTitle>
          <CardDescription>
            Manage your fantasy football league data connections with enhanced endpoint monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dataSources.length === 0 ? (
            <Alert>
              <Database className="h-4 w-4" />
              <AlertDescription>
                No data sources connected. Add your first league above to get started.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {dataSources.map((source) => (
                <div key={source.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge className={getPlatformBadgeColor(source.platform)}>
                        {source.platform}
                      </Badge>
                      {source.platform === 'ESPN' && (
                        <Badge variant="outline" className={source.isPrivate ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}>
                          {source.isPrivate ? (
                            <>
                              <Lock className="h-3 w-3 mr-1" />
                              Private
                            </>
                          ) : (
                            <>
                              <Globe className="h-3 w-3 mr-1" />
                              Public
                            </>
                          )}
                        </Badge>
                      )}
                      <div className="flex items-center gap-1">
                        {getStatusIcon(source)}
                        <span className={`text-sm font-medium ${getStatusColor(source.status)}`}>
                          {source.status}
                        </span>
                      </div>
                      {source.status === 'pending' && source.platform === 'Manual Upload' && (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                          Excel Upload Required
                        </Badge>
                      )}
                      {source.lastUsedEndpoint && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                <Info className="h-3 w-3 mr-1" />
                                {source.lastUsedEndpoint}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Last successful endpoint: {source.lastUsedEndpoint}</p>
                              {source.availableEndpoints && (
                                <p>Available: {source.availableEndpoints.join(', ')}</p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <div>League ID: {source.leagueId} | Years: {source.years}</div>
                      {source.isPrivate && (
                        <div className="text-xs text-red-600 mt-1">
                          🔒 Authenticated with SWID and ESPN_S2 cookies
                        </div>
                      )}
                      {source.years === "2008-2019" && (
                        <div className="text-xs text-green-600 mt-1">
                          ✓ Historical API with fallback support
                        </div>
                      )}
                      {source.years === "2020" && (
                        <div className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          League deletion data loss - manual reconstruction needed
                        </div>
                      )}
                      {source.years === "2021-2023" && (
                        <div className="text-xs text-blue-600 mt-1">
                          ✓ Current API with enhanced views and fallback
                        </div>
                      )}
                      {source.errorMessage && (
                        <div className="text-xs text-red-600 mt-1">
                          Error: {source.errorMessage}
                        </div>
                      )}
                    </div>
                    
                    {source.status === 'syncing' && source.syncProgress !== undefined && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>Syncing with multi-endpoint fallback...</span>
                          <span>{Math.round(source.syncProgress)}%</span>
                        </div>
                        <Progress value={source.syncProgress} className="h-2" />
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground">
                      Last synced: {source.lastSync}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {source.platform === 'ESPN' && source.status === 'pending' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleTestConnection(source)}
                        disabled={isTestingConnection === source.id}
                      >
                        {isTestingConnection === source.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Test'
                        )}
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => source.platform === 'ESPN' ? handleSyncESPNData(source) : onSyncData(source.id)}
                      disabled={source.status === 'syncing' || isTestingConnection === source.id}
                    >
                      {source.status === 'syncing' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            {isDeletionCritical(source) && (
                              <AlertTriangle className="h-5 w-5 text-destructive" />
                            )}
                            Delete Data Source
                          </AlertDialogTitle>
                          <AlertDialogDescription asChild>
                            <div className="space-y-3">
                              <span className="block">
                                You are about to delete the <strong>{source.platform}</strong> data source covering <strong>{source.years}</strong>.
                              </span>
                              <span className={`block ${isDeletionCritical(source) ? "text-destructive font-medium" : ""}`}>
                                {getDeleteWarning(source)}
                              </span>
                              {isDeletionCritical(source) && (
                                <span className="block text-sm text-muted-foreground">
                                  ⚠️ This action cannot be undone and may result in permanent data loss.
                                </span>
                              )}
                            </div>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteConfirm(source.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {isDeletionCritical(source) ? "Delete Permanently" : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}

              {/* Special section for 2020 data */}
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-yellow-800">2020 Season Data Recovery</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      The 2020 season data was lost when the previous commissioner deleted the ESPN league. 
                      Some records have been reconstructed from Excel files but may be incomplete.
                    </p>
                    <Button variant="outline" size="sm" className="mt-3 text-yellow-700 border-yellow-300">
                      Upload Additional 2020 Data
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}