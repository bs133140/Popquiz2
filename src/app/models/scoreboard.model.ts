export class Scoreboard {
  filename: string;
  teams: Team[] = [];
  rounds: Round[] = [];
  rankingAfterRound: Ranking[][] = [];
  rankingPerRound: Ranking[][] = [];
  lastround = 0;
  lastroundtotal = 0;
  lastroundhighest = 0;
  teamtype = 0; //  0 = all, 1 = circuit, 2 = gelegenheid
  specSort: boolean;
}

export class Round {
  id: number;
  name: string;
  max?: number;
}

export class Ranking {
  id: number;
  score: number;
  rank?: number;
  srank?: number;
}

export class Team {
  id: number;
  name: string;
  scores: number[];
  type: number;
  total?: number;
  rank?: number;
  ranks?: number[];
  negranks?: number[];
}

export class Column {
  name: string;
  title: string;
  value: string;
}
