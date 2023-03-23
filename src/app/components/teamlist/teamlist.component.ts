import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Column, Scoreboard } from 'src/app/models/scoreboard.model';
import { ScoreboardService } from 'src/app/services/scoreboard.service';

@Component({
  selector: 'app-teamlist',
  templateUrl: './teamlist.component.html',
  styleUrls: ['./teamlist.component.scss'],
})
export class TeamlistComponent {
  scoreboard: Scoreboard;
  displayedColumns: string[] = [];
  columns: Column[] = [];
  list: any[] = [];
  dataSource = new MatTableDataSource<any>(this.list);
  title: string;
  showRoundup: boolean;
  lastroundaverage: string;

  constructor(private scoreboardService: ScoreboardService) {}

  ngOnInit(): void {
    this.scoreboardService.scoreboard$.subscribe((scoreboard) => {
      this.scoreboard = scoreboard;
      this.renderList();
    });
  }

  renderList() {
    this.list = [];
    this.columns = [];
    this.displayedColumns = ['id', 'team'];
    this.title =  'SCORES PER RONDE';     
    this.showRoundup = true;   
  
    if(this.scoreboard.teamtype === 1) {
      this.title += ' - Circuitploegen&nbsp;&#9929';
    }
    if(this.scoreboard.teamtype === 2) {
      this.title += ' - Gelegenheidsploegen';
    }

    // Set rounds
    if (this.scoreboard && this.scoreboard.rounds) {
      this.scoreboard.rounds.forEach((round, i) => {
        if (
          i <= this.scoreboard.lastround ||
          i == this.scoreboard.rounds.length - 1
        ) {
          this.columns.push({
            name: 'col' + i,
            title:
              (i == this.scoreboard.rounds.length - 1 ? 'TOT' : i + 1) +
              '<br/>/' +
              round.max,
            value: '',
          });
          this.displayedColumns.push('col' + i);
        }
      });
    }

    // Set teams
    if (this.scoreboard && this.scoreboard.teams) {
      this.scoreboard.teams.forEach((team, i) => {
        if (
          this.scoreboard.teamtype == 0 ||
          this.scoreboard.teamtype == team.type
        ) {
          const row: any = {
            id: team.id,
            team:
              (team.name.length > 38
                ? this.HTMLEncode(team.name.substring(0, 35)) + ' ...'
                : this.HTMLEncode(team.name)) +
              (team.type == 1
                ? '&nbsp;&#9929'
                : ''),
          };

          team.scores.forEach((score, x) => {
            if (
              x <= this.scoreboard.lastround ||
              x == this.scoreboard.rounds.length - 1
            ) {
              row['col' + x] =
                '<span class="badge ' +
                (x <= this.scoreboard.lastround
                  ? this.getScoreStyle(
                      i,
                      score,
                      this.scoreboard.rounds[x].max as number
                    )
                  : '') +
                '">' +
                score +
                '</span>';
            }
          });

          this.list.push(row);
        }
      });
    }

    this.lastroundaverage = parseFloat((this.scoreboard.lastroundtotal / this.scoreboard.filteredteams)+'').toFixed(1);
    this.dataSource = new MatTableDataSource<any>(this.list);
  }

  getScoreStyle(idx: number, score: number, max: number) {
    var coeff = parseFloat(score + '') / parseFloat(max + '');
    var result = '';

    // orange
    if (coeff >= 0.3 && coeff <= 0.5) {
      result = 'orange';
    }

    // green
    if (coeff > 0.5) {
      result = 'green';
    }

    // red
    if (coeff < 0.3) {
      result = 'red';
    }

    return result;
  }

  HTMLEncode(str: string) {
    let i = str.length,
      aRet = [];

    while (i--) {
      var iC = str[i].charCodeAt(0);
      if (iC < 65 || iC > 127 || (iC > 90 && iC < 97)) {
        aRet[i] = '&#' + iC + ';';
      } else {
        aRet[i] = str[i];
      }
    }
    return aRet.join('');
  }
}
