// Enhanced ESPN Fantasy Football API Service with Multiple Endpoints and Fallback Logic
// Supports multiple API endpoints with automatic fallback and view parameters

export interface ESPNAuthCookies {
  swid: string;
  espn_s2: string;
}

export interface ESPNLeagueInfo {
  id: string;
  name: string;
  size: number;
  scoringPeriodId: number;
  seasonId: number;
  status: {
    currentMatchupPeriod: number;
    finalScoringPeriod: number;
    firstScoringPeriod: number;
    isActive: boolean;
    latestScoringPeriod: number;
  };
}

export interface ESPNTeam {
  id: number;
  location: string;
  nickname: string;
  owners: string[];
  record: {
    overall: {
      wins: number;
      losses: number;
      ties: number;
      pointsFor: number;
      pointsAgainst: number;
    };
  };
  rankCalculatedFinal: number;
  playoffSeed: number;
}

export interface ESPNMatchup {
  id: number;
  matchupPeriodId: number;
  home: {
    teamId: number;
    totalPoints: number;
  };
  away: {
    teamId: number;
    totalPoints: number;
  };
  winner: 'home' | 'away' | 'tie';
}

export interface ESPNAPIResponse {
  teams: ESPNTeam[];
  schedule?: ESPNMatchup[];
  members?: Array<{
    id: string;
    displayName: string;
    firstName: string;
    lastName: string;
  }>;
  settings?: {
    name: string;
    size: number;
    playoffTeamCount: number;
    regularSeasonMatchupPeriodCount: number;
  };
}

// ESPN API endpoint configurations
interface ESPNEndpoint {
  name: string;
  baseUrl: string;
  supportedYears: {
    min: number;
    max: number;
  };
  getUrl: (leagueId: string, year: number, view?: string) => string;
  isHistorical: boolean;
}

class ESPNFantasyAPI {
  // Multiple ESPN API endpoints with fallback support
  private static readonly ENDPOINTS: ESPNEndpoint[] = [
    // Primary current API (lm-api-reads)
    {
      name: 'LM-API-Reads',
      baseUrl: 'https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons',
      supportedYears: { min: 2018, max: 2030 },
      getUrl: (leagueId: string, year: number, view?: string) => {
        const baseUrl = `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${year}/segments/0/leagues/${leagueId}`;
        return view ? `${baseUrl}?view=${view}` : baseUrl;
      },
      isHistorical: false
    },
    // Secondary current API (fantasy.espn.com)
    {
      name: 'Fantasy-ESPN',
      baseUrl: 'https://fantasy.espn.com/apis/v3/games/ffl/seasons',
      supportedYears: { min: 2018, max: 2030 },
      getUrl: (leagueId: string, year: number, view?: string) => {
        const baseUrl = `https://fantasy.espn.com/apis/v3/games/ffl/seasons/${year}/segments/0/leagues/${leagueId}`;
        return view ? `${baseUrl}?view=${view}` : baseUrl;
      },
      isHistorical: false
    },
    // Historical API
    {
      name: 'Historical-ESPN',
      baseUrl: 'https://fantasy.espn.com/apis/v3/games/ffl/leagueHistory',
      supportedYears: { min: 2008, max: 2017 },
      getUrl: (leagueId: string, year: number, view?: string) => {
        const baseUrl = `https://fantasy.espn.com/apis/v3/games/ffl/leagueHistory/${leagueId}?seasonId=${year}`;
        return view ? `${baseUrl}&view=${view}` : baseUrl;
      },
      isHistorical: true
    }
  ];

  // Get appropriate endpoints for a given year
  private static getEndpointsForYear(year: number): ESPNEndpoint[] {
    return this.ENDPOINTS.filter(endpoint => 
      year >= endpoint.supportedYears.min && year <= endpoint.supportedYears.max
    );
  }

  // Build headers for API request
  private static buildHeaders(cookies?: ESPNAuthCookies): Headers {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });

    // Add authentication cookies for private leagues
    if (cookies?.swid && cookies?.espn_s2) {
      const cookieString = `swid=${cookies.swid}; espn_s2=${cookies.espn_s2}`;
      headers.set('Cookie', cookieString);
    }

    return headers;
  }

  // Validate API response quality
  private static validateResponseData(data: any, expectedDataTypes: string[] = []): boolean {
    if (!data || typeof data !== 'object') return false;

    // Check for basic league data
    if (expectedDataTypes.length === 0) {
      return !!(data.teams || data.settings || data.members);
    }

    // Check for specific data types
    for (const dataType of expectedDataTypes) {
      switch (dataType) {
        case 'teams':
          if (!data.teams || !Array.isArray(data.teams) || data.teams.length === 0) return false;
          break;
        case 'schedule':
          if (!data.schedule || !Array.isArray(data.schedule)) return false;
          break;
        case 'members':
          if (!data.members || !Array.isArray(data.members)) return false;
          break;
        case 'settings':
          if (!data.settings || typeof data.settings !== 'object') return false;
          break;
      }
    }

    return true;
  }

  // Enhanced fetch with multiple endpoint fallback
  private static async fetchWithFallback(
    leagueId: string,
    year: number,
    cookies?: ESPNAuthCookies,
    view?: string,
    expectedDataTypes: string[] = []
  ): Promise<{ data: ESPNAPIResponse; endpoint: string }> {
    const endpoints = this.getEndpointsForYear(year);
    const headers = this.buildHeaders(cookies);
    const errors: Array<{ endpoint: string; error: string }> = [];

    if (endpoints.length === 0) {
      throw new ESPNAPIError(
        `No available endpoints for year ${year}`,
        0,
        'No endpoints available'
      );
    }

    // Try each endpoint in order
    for (const endpoint of endpoints) {
      try {
        const url = endpoint.getUrl(leagueId, year, view);
        
        console.log(`Trying ${endpoint.name} for ${year}: ${url}`);

        const response = await fetch(url, {
          method: 'GET',
          headers,
          credentials: cookies ? 'include' : 'omit',
        });

        if (!response.ok) {
          const errorMsg = `HTTP ${response.status}: ${response.statusText}`;
          errors.push({ endpoint: endpoint.name, error: errorMsg });
          console.warn(`${endpoint.name} failed: ${errorMsg}`);
          continue;
        }

        const rawData = await response.json();
        
        // Handle historical API response format (returns array)
        const data = endpoint.isHistorical && Array.isArray(rawData) && rawData.length > 0 
          ? rawData[0] 
          : rawData;

        // Validate data quality
        if (!this.validateResponseData(data, expectedDataTypes)) {
          const errorMsg = 'Invalid or insufficient data returned';
          errors.push({ endpoint: endpoint.name, error: errorMsg });
          console.warn(`${endpoint.name} returned invalid data`);
          continue;
        }

        console.log(`✓ ${endpoint.name} succeeded for ${year}`);
        return { data: data as ESPNAPIResponse, endpoint: endpoint.name };

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        errors.push({ endpoint: endpoint.name, error: errorMsg });
        console.warn(`${endpoint.name} error: ${errorMsg}`);
        continue;
      }
    }

    // All endpoints failed
    const errorSummary = errors.map(e => `${e.endpoint}: ${e.error}`).join('; ');
    throw new ESPNAPIError(
      `All endpoints failed for year ${year}. Errors: ${errorSummary}`,
      0,
      'All endpoints failed'
    );
  }

  // Main function to fetch league data with enhanced fallback
  static async fetchLeagueData(
    leagueId: string, 
    year: number, 
    cookies?: ESPNAuthCookies,
    view?: string
  ): Promise<ESPNAPIResponse> {
    const result = await this.fetchWithFallback(leagueId, year, cookies, view);
    return result.data;
  }

  // Specialized functions for different data types with view parameters
  static async fetchStandings(
    leagueId: string,
    year: number,
    cookies?: ESPNAuthCookies
  ): Promise<ESPNAPIResponse> {
    try {
      // Try with mStandings view first
      const result = await this.fetchWithFallback(
        leagueId, 
        year, 
        cookies, 
        'mStandings',
        ['teams', 'settings']
      );
      return result.data;
    } catch (error) {
      // Fallback to basic endpoint
      console.warn('mStandings view failed, trying basic endpoint');
      return await this.fetchLeagueData(leagueId, year, cookies);
    }
  }

  static async fetchMatchups(
    leagueId: string,
    year: number,
    cookies?: ESPNAuthCookies
  ): Promise<ESPNAPIResponse> {
    try {
      // Try with mMatchup view first
      const result = await this.fetchWithFallback(
        leagueId, 
        year, 
        cookies, 
        'mMatchup',
        ['schedule']
      );
      return result.data;
    } catch (error) {
      // Fallback to basic endpoint
      console.warn('mMatchup view failed, trying basic endpoint');
      return await this.fetchLeagueData(leagueId, year, cookies);
    }
  }

  static async fetchRosters(
    leagueId: string,
    year: number,
    cookies?: ESPNAuthCookies
  ): Promise<ESPNAPIResponse> {
    try {
      // Try with mRoster view first
      const result = await this.fetchWithFallback(
        leagueId, 
        year, 
        cookies, 
        'mRoster',
        ['teams']
      );
      return result.data;
    } catch (error) {
      // Fallback to basic endpoint
      console.warn('mRoster view failed, trying basic endpoint');
      return await this.fetchLeagueData(leagueId, year, cookies);
    }
  }

  // Enhanced multi-year fetch with per-year fallback
  static async fetchMultipleYears(
    leagueId: string,
    startYear: number,
    endYear: number,
    cookies?: ESPNAuthCookies
  ): Promise<Array<{ year: number; data: ESPNAPIResponse; endpoint: string }>> {
    const results = [];
    const errors = [];

    for (let year = startYear; year <= endYear; year++) {
      try {
        const result = await this.fetchWithFallback(leagueId, year, cookies);
        results.push({ 
          year, 
          data: result.data, 
          endpoint: result.endpoint 
        });
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error(`Failed to fetch data for year ${year}:`, error);
        errors.push({ year, error });
      }
    }

    if (errors.length > 0) {
      console.warn(`Failed to fetch data for ${errors.length} years:`, errors);
    }

    return results;
  }

  // Enhanced league info with endpoint fallback
  static async getLeagueInfo(
    leagueId: string, 
    year: number, 
    cookies?: ESPNAuthCookies
  ): Promise<ESPNLeagueInfo> {
    const result = await this.fetchWithFallback(
      leagueId, 
      year, 
      cookies, 
      undefined,
      ['settings']
    );
    
    return {
      id: leagueId,
      name: result.data.settings?.name || 'Unknown League',
      size: result.data.settings?.size || result.data.teams?.length || 10,
      scoringPeriodId: 1,
      seasonId: year,
      status: {
        currentMatchupPeriod: 1,
        finalScoringPeriod: result.data.settings?.regularSeasonMatchupPeriodCount || 14,
        firstScoringPeriod: 1,
        isActive: year === new Date().getFullYear(),
        latestScoringPeriod: result.data.settings?.regularSeasonMatchupPeriodCount || 14
      }
    };
  }

  // Enhanced connection test with endpoint reporting
  static async testConnection(
    leagueId: string, 
    year: number, 
    cookies?: ESPNAuthCookies
  ): Promise<{ 
    success: boolean; 
    error?: string; 
    leagueInfo?: ESPNLeagueInfo; 
    endpoint?: string;
    availableEndpoints?: string[];
  }> {
    const availableEndpoints = this.getEndpointsForYear(year).map(e => e.name);
    
    try {
      const result = await this.fetchWithFallback(leagueId, year, cookies);
      const leagueInfo = await this.getLeagueInfo(leagueId, year, cookies);
      
      return { 
        success: true, 
        leagueInfo,
        endpoint: result.endpoint,
        availableEndpoints
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        availableEndpoints
      };
    }
  }

  // Get endpoint status for diagnostics
  static async getEndpointStatus(
    leagueId: string,
    year: number,
    cookies?: ESPNAuthCookies
  ): Promise<Array<{
    name: string;
    url: string;
    status: 'success' | 'failed' | 'not_applicable';
    error?: string;
    responseTime?: number;
  }>> {
    const endpoints = this.getEndpointsForYear(year);
    const headers = this.buildHeaders(cookies);
    const results = [];

    for (const endpoint of endpoints) {
      const startTime = Date.now();
      try {
        const url = endpoint.getUrl(leagueId, year);
        const response = await fetch(url, {
          method: 'GET',
          headers,
          credentials: cookies ? 'include' : 'omit',
        });

        const responseTime = Date.now() - startTime;

        if (response.ok) {
          const data = await response.json();
          const isValid = this.validateResponseData(
            endpoint.isHistorical && Array.isArray(data) ? data[0] : data
          );

          results.push({
            name: endpoint.name,
            url,
            status: isValid ? 'success' : 'failed',
            error: isValid ? undefined : 'Invalid data format',
            responseTime
          });
        } else {
          results.push({
            name: endpoint.name,
            url,
            status: 'failed',
            error: `HTTP ${response.status}: ${response.statusText}`,
            responseTime
          });
        }
      } catch (error) {
        results.push({
          name: endpoint.name,
          url: endpoint.getUrl(leagueId, year),
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          responseTime: Date.now() - startTime
        });
      }
    }

    return results;
  }
}

// Enhanced error class with endpoint information
export class ESPNAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public url: string,
    public endpoint?: string
  ) {
    super(message);
    this.name = 'ESPNAPIError';
  }

  get isAuthError(): boolean {
    return this.statusCode === 401 || this.statusCode === 403;
  }

  get isNotFound(): boolean {
    return this.statusCode === 404;
  }

  get isRateLimit(): boolean {
    return this.statusCode === 429;
  }
}

// Enhanced data transformation utilities
export class ESPNDataTransformer {
  // Transform ESPN team data to our app format
  static transformTeamData(espnTeams: ESPNTeam[], members?: any[]): Array<{
    manager: string;
    wins: number;
    losses: number;
    pointsFor: number;
    pointsAgainst: number;
    place: number;
  }> {
    return espnTeams.map(team => {
      // Try to get manager name from owners/members data
      let managerName = 'Unknown Manager';
      
      if (team.owners && team.owners.length > 0 && members) {
        const owner = members.find(member => team.owners.includes(member.id));
        if (owner) {
          managerName = owner.displayName || `${owner.firstName} ${owner.lastName}`.trim();
        }
      }

      // Fallback to team name if no manager found
      if (managerName === 'Unknown Manager') {
        managerName = `${team.location} ${team.nickname}`.trim() || `Team ${team.id}`;
      }

      return {
        manager: managerName,
        wins: team.record?.overall?.wins || 0,
        losses: team.record?.overall?.losses || 0,
        pointsFor: team.record?.overall?.pointsFor || 0,
        pointsAgainst: team.record?.overall?.pointsAgainst || 0,
        place: team.rankCalculatedFinal || team.playoffSeed || 0
      };
    });
  }

  // Transform ESPN schedule data to our matchup format
  static transformMatchupData(espnSchedule: ESPNMatchup[], espnTeams: ESPNTeam[]): Array<{
    week: number;
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    winner: string;
    loser: string;
    marginOfVictory: number;
    isPlayoff: boolean;
  }> {
    if (!espnSchedule || !espnTeams) return [];

    return espnSchedule.map(matchup => {
      const homeTeam = espnTeams.find(team => team.id === matchup.home.teamId);
      const awayTeam = espnTeams.find(team => team.id === matchup.away.teamId);
      
      const homeTeamName = homeTeam ? `${homeTeam.location} ${homeTeam.nickname}`.trim() : `Team ${matchup.home.teamId}`;
      const awayTeamName = awayTeam ? `${awayTeam.location} ${awayTeam.nickname}`.trim() : `Team ${matchup.away.teamId}`;
      
      const homeScore = matchup.home.totalPoints || 0;
      const awayScore = matchup.away.totalPoints || 0;
      
      let winner = homeTeamName;
      let loser = awayTeamName;
      
      if (awayScore > homeScore) {
        winner = awayTeamName;
        loser = homeTeamName;
      }

      return {
        week: matchup.matchupPeriodId,
        homeTeam: homeTeamName,
        awayTeam: awayTeamName,
        homeScore,
        awayScore,
        winner,
        loser,
        marginOfVictory: Math.abs(homeScore - awayScore),
        isPlayoff: matchup.matchupPeriodId > 14 // Assume playoffs start week 15
      };
    });
  }
}

export default ESPNFantasyAPI;