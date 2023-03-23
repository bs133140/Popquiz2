import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Scoreboard, Team } from '../models/scoreboard.model';

@Injectable({
  providedIn: 'root',
})
export class ScoreboardService {
  private scoreboard: Scoreboard;
  private readonly subjectScoreboard: BehaviorSubject<any> =
    new BehaviorSubject(null);
  public readonly scoreboard$: Observable<any> =
    this.subjectScoreboard.asObservable();

  constructor() {}

  setScoreboard(scoreboard: Scoreboard) {
    this.scoreboard = scoreboard;
    this.setRanking(true);
    this.subjectScoreboard.next(this.scoreboard);
  }

  clearScoreboard() {
    this.scoreboard = {
      filename: '',
      teams: [],
      rounds: [],
      rankingAfterRound: [],
      rankingPerRound: [],
      lastround: 0,
      lastroundtotal: 0,
      lastroundhighest: 0,
      specSort: false,
      teamtype: 0,
      filteredteams: 0,
    };

    this.subjectScoreboard.next(this.scoreboard);
  }

  processData(filename: string, allText: string) {
    this.clearScoreboard();
    this.scoreboard.filename = filename;

    this.parseText(allText);
    this.setRanking();
    this.subjectScoreboard.next(this.scoreboard);
  }

  parseText(allText: string) {
    var allTextLines = allText.split(/\r\n|\n/);

    // read lines
    for (var i = 0; i < allTextLines.length; i++) {
      if (allTextLines[i] != '') {
        var entries = allTextLines[i].split(';');

        // read rounds
        if (i == 0) {
          for (var r = 1; r < entries.length; r++) {
            if (r > 2) {
              this.scoreboard.rounds.push({ id: r - 2, name: entries[r] });
              this.scoreboard.rankingAfterRound.push([]);
              this.scoreboard.rankingPerRound.push([]);
            }
          }
        }

        // read maxs
        if (i == 1) {
          for (var r = 3; r < entries.length; r++) {
            this.scoreboard.rounds[r - 3].max = parseInt(entries[r], 10);
          }
        }

        // read data
        if (i > 1) {
          var team: Team = { scores: [], id: i - 1, type: 2, name:'' };
          var totalscore = 0;

          for (var r = 1; r < entries.length; r++) {
            var entry = entries[r];

            // ploeg
            if (r == 1) {
              team.name = entry;
            } else if (r == 2) {
              if (entry == '1') {
                team.type = 1;
              }
            } else {
              var score = entry == '' ? 0 : parseInt(entry, 10);
              totalscore += score;
              team.scores.push(score);

              if (r < entries.length - 1) {
                if (score > 0 && r - 3 > this.scoreboard.lastround) {
                  this.scoreboard.lastround = r - 3;
                }
                this.scoreboard.rankingAfterRound[r - 3].push({
                  id: i - 1,
                  score: totalscore,
                });
                this.scoreboard.rankingPerRound[r - 3].push({
                  id: i - 1,
                  score: score,
                });
              }
            }
          }
          team.total = parseInt(entries[entries.length - 1], 10);
          this.scoreboard.teams.push(team);
        }
      }
    }
  }

  setRanking(pricesort?: boolean) {
    this.scoreboard.filteredteams = 0;
    this.scoreboard.lastroundtotal = 0;
    this.scoreboard.lastroundhighest = 0;

    // sort rankings
    this.scoreboard.specSort = pricesort || false;

    for (var t = 0; t < this.scoreboard.rankingAfterRound.length; t++) {
      this.scoreboard.rankingAfterRound[t]
        .sort(this.dynamicSort('score'))
        .reverse();
      this.scoreboard.rankingPerRound[t]
        .sort(this.dynamicSort('score'))
        .reverse();
    }

    // t = round
    for (var t = 0; t < this.scoreboard.rankingAfterRound.length; t++) {
      var rank = 0,
        g_rank = 0, // gelegenheidsploeg rank
        c_rank = 0, // circuitploeg rank
        prevscore = -1,
        g_prevscore = -1,
        c_prevscore = -1,
        g_idx = 0,
        c_idx = 0;

      // s = team sorted by score
      for (var s = 0; s < this.scoreboard.rankingAfterRound[t].length; s++) {
        if (this.scoreboard.rankingAfterRound[t][s].score != prevscore) {
          rank = s + 1;
          prevscore = this.scoreboard.rankingAfterRound[t][s].score;
        }

        // gelegenheidsploeg
        var srank = 0;
        if (
          this.scoreboard.teams[this.scoreboard.rankingAfterRound[t][s].id - 1]
            .type == 2
        ) {
          if (this.scoreboard.rankingAfterRound[t][s].score != g_prevscore) {
            g_rank = g_idx + 1;
            g_prevscore = this.scoreboard.rankingAfterRound[t][s].score;
          }
          srank = g_rank;
          g_idx++;
        }

        // circuitploeg
        if (
          this.scoreboard.teams[this.scoreboard.rankingAfterRound[t][s].id - 1]
            .type == 1
        ) {
          if (this.scoreboard.rankingAfterRound[t][s].score != c_prevscore) {
            c_rank = c_idx + 1;
            c_prevscore = this.scoreboard.rankingAfterRound[t][s].score;
          }
          srank = c_rank;
          c_idx++;
        }

        this.scoreboard.rankingAfterRound[t][s].rank = rank;
        this.scoreboard.rankingAfterRound[t][s].srank = srank;

        // ranking last round
        if (t == this.scoreboard.lastround) {
          //console.info(rankingAfterRound[t][s].id);
          this.scoreboard.teams[
            this.scoreboard.rankingAfterRound[t][s].id - 1
          ].rank = rank;
        }

        // ranking evolution
        if (
          typeof this.scoreboard.teams[
            this.scoreboard.rankingAfterRound[t][s].id - 1
          ].ranks == 'undefined'
        ) {
          this.scoreboard.teams[
            this.scoreboard.rankingAfterRound[t][s].id - 1
          ].ranks = [];
          this.scoreboard.teams[
            this.scoreboard.rankingAfterRound[t][s].id - 1
          ].negranks = [];
        }

        (
          this.scoreboard.teams[this.scoreboard.rankingAfterRound[t][s].id - 1]
            .ranks as number[]
        ).push(rank);
        (
          this.scoreboard.teams[this.scoreboard.rankingAfterRound[t][s].id - 1]
            .negranks as number[]
        ).push(this.scoreboard.teams.length - rank);
      }

      rank = 0;
      prevscore = -1;

      for (var s = 0; s < this.scoreboard.rankingPerRound[t].length; s++) {
        if (
          this.scoreboard.teamtype == 0 ||
          this.scoreboard.teams[this.scoreboard.rankingPerRound[t][s].id - 1]
            .type == this.scoreboard.teamtype
        ) {
          if (t == this.scoreboard.lastround) {
            this.scoreboard.filteredteams++;
            this.scoreboard.lastroundtotal +=
              this.scoreboard.rankingPerRound[t][s].score;
            if (
              this.scoreboard.rankingPerRound[t][s].score >
              this.scoreboard.lastroundhighest
            ) {
              this.scoreboard.lastroundhighest =
                this.scoreboard.rankingPerRound[t][s].score;
            }
          }

          if (this.scoreboard.rankingPerRound[t][s].score != prevscore) {
            rank++;
            prevscore = this.scoreboard.rankingPerRound[t][s].score;
          }
          this.scoreboard.rankingPerRound[t][s].rank = rank;
        }
      }
    }
  }

  dynamicSort(property: string) {
    var sortOrder = 1;
    if (property[0] === '-') {
      sortOrder = -1;
      property = property.substr(1);
    }
    return function (a: any, b: any) {
      var result =
        a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
      return result * sortOrder;
    };
  }
}
