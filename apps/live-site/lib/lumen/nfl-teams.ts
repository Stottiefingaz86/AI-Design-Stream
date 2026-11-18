/** NFL clubs used on the football board — marks under `public/team/nfl`. */
export type NflTeam = { name: string; abbr: string; logo: string; kicker: string }

const team = (name: string, abbr: string, file: string, kicker: string): NflTeam => ({
  name,
  abbr,
  logo: `/team/nfl/${file}.svg`,
  kicker,
})

export const NFL_TEAMS: Record<string, NflTeam> = {
  SEA: team('Seattle Seahawks', 'SEA', 'sea', 'Jason Myers'),
  SF: team('San Francisco 49ers', 'SF', 'sf', 'Eddy Piñeiro'),
  KC: team('Kansas City Chiefs', 'KC', 'kc', 'Harrison Butker'),
  BUF: team('Buffalo Bills', 'BUF', 'buf', 'Tyler Bass'),
  DAL: team('Dallas Cowboys', 'DAL', 'dal', 'Brandon Aubrey'),
  PHI: team('Philadelphia Eagles', 'PHI', 'phi', 'Jake Elliott'),
  MIA: team('Miami Dolphins', 'MIA', 'mia', 'Jason Sanders'),
  NYJ: team('New York Jets', 'NYJ', 'nyj', 'Nick Folk'),
  CHI: team('Chicago Bears', 'CHI', 'chi', 'Cairo Santos'),
  MIN: team('Minnesota Vikings', 'MIN', 'min', 'Will Reichard'),
  LAR: team('Los Angeles Rams', 'LAR', 'la', 'Joshua Karty'),
  ARI: team('Arizona Cardinals', 'ARI', 'ari', 'Chad Ryland'),
  DET: team('Detroit Lions', 'DET', 'det', 'Jake Bates'),
  GB: team('Green Bay Packers', 'GB', 'gb', 'Brandon McManus'),
  BAL: team('Baltimore Ravens', 'BAL', 'bal', 'Tyler Loop'),
  CIN: team('Cincinnati Bengals', 'CIN', 'cin', 'Evan McPherson'),
  PIT: team('Pittsburgh Steelers', 'PIT', 'pit', 'Chris Boswell'),
  HOU: team('Houston Texans', 'HOU', 'hou', "Ka'imi Fairbairn"),
  DEN: team('Denver Broncos', 'DEN', 'den', 'Wil Lutz'),
  LAC: team('Los Angeles Chargers', 'LAC', 'lac', 'Cameron Dicker'),
  WAS: team('Washington Commanders', 'WAS', 'was', 'Matt Gay'),
  TB: team('Tampa Bay Buccaneers', 'TB', 'tb', 'Chase McLaughlin'),
}

const BY_NAME: Record<string, NflTeam> = Object.fromEntries(
  Object.values(NFL_TEAMS).map((t) => [t.name, t]),
)

export function nflTeamByName(name: string): NflTeam | undefined {
  return BY_NAME[name]
}
