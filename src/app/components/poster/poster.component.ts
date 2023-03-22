import { Component, OnInit } from '@angular/core';
import { Scoreboard } from 'src/app/models/scoreboard.model';
import { ScoreboardService } from 'src/app/services/scoreboard.service';

@Component({
  selector: 'app-poster',
  templateUrl: './poster.component.html',
  styleUrls: ['./poster.component.scss'],
})
export class PosterComponent implements OnInit {
  scoreboard: Scoreboard;

  constructor(private scoreboardService: ScoreboardService) {}

  ngOnInit(): void {
    this.scoreboardService.scoreboard$.subscribe((scoreboard)=>{
      this.scoreboard = scoreboard;
    });
  }
}
