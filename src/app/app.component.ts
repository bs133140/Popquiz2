import { Component } from '@angular/core';
import { Scoreboard } from './models/scoreboard.model';
import { ScoreboardService } from './services/scoreboard.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'popquiz';
  showList: boolean;
  showRanking: boolean;
  scoreboard: Scoreboard;
  scrolling: boolean;
  showRankingRoundup: boolean;
  showListRoundup: boolean;
  firstCall: boolean = true;

  constructor(private scoreboardService: ScoreboardService) {
    
  }

  ngOnInit(): void {
    this.scoreboardService.scoreboard$.subscribe((scoreboard) => {
      this.scoreboard = scoreboard;

      if (this.scoreboard) {   
        if(this.firstCall) {
          this.firstCall = false;
          this.showRanking = true;
        }     
        this.ranking();
      }
    });
  }

  autoscroll(state: boolean) {
    this.scrolling = state;
  }

  ranking(toggle: boolean = false) {
    if(toggle) {
      this.showRanking = !this.showRanking;
      this.scrolling = false;
    }
    if (this.showRanking) {
      this.showList = false;
      this.showRanking = true;
      this.showRankingRoundup = true;
      this.showListRoundup = false;
    } else {
      this.showList = true;
      this.showRanking = false;
      this.showRankingRoundup = false;
      this.showListRoundup = false;
    }    
  }

  filter(filter: number) {
    this.scoreboard.teamtype = filter;
    this.scoreboardService.setScoreboard(this.scoreboard);
  }

  home() {
    this.showList = false;
    this.showRanking = false;
    this.showRankingRoundup = false;
    this.showListRoundup = false;
  }
}
