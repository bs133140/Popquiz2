import { animate, state, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Column, Scoreboard } from 'src/app/models/scoreboard.model';
import { ScoreboardService } from 'src/app/services/scoreboard.service';

@Component({
  selector: 'app-teamranking',
  templateUrl: './teamranking.component.html',
  styleUrls: ['./teamranking.component.scss'],  
})
export class TeamrankingComponent implements OnInit, AfterViewInit, OnChanges  {
  scoreboard: Scoreboard;
  displayedColumns: string[] = [];
  ranking: any[] = [];
  dataSource = new MatTableDataSource<any>(this.ranking);

  top3total = '';
  top3lastround = '';
  top3lstcnt = 1;
  top3prev = 0;
  top3rnk = 0;

  title: string;
  scrollEvent: any;
  scrollDirection = 1;
  roundName: string;
  roundScore: number;
  showRoundup: boolean;
  totalScore: number;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('ranking') rankingWrapper: ElementRef;
  @Input() autoscroll: boolean;

  constructor(private scoreboardService: ScoreboardService) {}

  ngOnInit(): void {
    this.scoreboardService.scoreboard$.subscribe((scoreboard) => {
      this.scoreboard = scoreboard;
      this.renderRanking();
    });
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  ngOnChanges(changes:any) {
    if(changes.autoscroll){
      if(this.autoscroll) {
        let pauze = false;
        this.scrollEvent = setInterval(()=>{
          this.rankingWrapper.nativeElement.scrollTo({
            top: this.rankingWrapper.nativeElement.scrollTop+this.scrollDirection,
          });
          if(!pauze && this.rankingWrapper.nativeElement.scrollTop+this.rankingWrapper.nativeElement.clientHeight>= this.rankingWrapper.nativeElement.firstChild.clientHeight) {
            const newDirection = -1*this.scrollDirection;
            this.scrollDirection = 0;
            pauze = true;
            setTimeout(()=>{this.scrollDirection = newDirection;pauze=false;}, 2000);
          }
          if(!pauze && this.rankingWrapper.nativeElement.scrollTop==0) {
            const newDirection = -1*this.scrollDirection;
            pauze = true;
            setTimeout(()=>{this.scrollDirection = newDirection;pauze=false;}, 2000);
          }
        }, 10);
      } else {
        clearInterval(this.scrollEvent);
      }
    }
  }

  renderRanking() {
    const round = this.scoreboard.lastround;
    this.top3total = '';
    this.top3lastround = '';
    this.top3lstcnt = 1;
    this.top3prev = 0;
    this.top3rnk = 0;
    this.showRoundup = true;
    this.displayedColumns = [];
    this.ranking = [];
    this.totalScore = this.scoreboard.rounds.filter((r,i)=>i<=this.scoreboard.lastround).map((r)=>r.max as number).reduce((partialSum, a) => partialSum + a, 0);


    // set columns
    if (this.scoreboard.specSort) {
      this.displayedColumns = [
        'rank',
        'mrank',
        'srank',
        'diff',
        'team',
        'round',
        'nextround',
        'total',
      ];
    } else {
      this.displayedColumns = [
        'rank',
        'srank',
        'diff',
        'team',
        'round',
        'nextround',
        'total',
      ];
    }

    if(this.scoreboard.rankingPerRound[round]) {
      this.scoreboard.rankingPerRound[round].forEach((tms, t) => {
        if (
          this.scoreboard.teamtype == 0 ||
          this.scoreboard.teamtype == this.scoreboard.teams[tms.id - 1].type
        ) {
          if (this.top3lstcnt <= 3 || this.top3prev == tms.score) {
            if (this.top3prev != tms.score) {
              this.top3rnk = this.top3lstcnt;
            }
            this.top3lastround +=
              this.top3rnk +
              '. ' +
              this.scoreboard.teams[tms.id - 1].name +
              ' (' +
              tms.score +
              ')<br/>';
            this.top3lstcnt++;
            this.top3prev = tms.score;
          }
        }
      });
    }

    // filtered ranking
    let specialrank:any = {},
      specialcount = 0;

    if(this.scoreboard.rankingAfterRound[round]) {
      this.scoreboard.rankingAfterRound[round].forEach((rank, r) => {
        // compare to previous round
        let prevrank = 0,
          diff = 0;
        if (round > 0) {
          // get prevoius rank
          this.scoreboard.rankingAfterRound[
            this.scoreboard.lastround - 1
          ].forEach((prank, pr) => {
            if (prank.id == rank.id) {
              prevrank = prank.rank as number;
            }
          });
  
          diff = prevrank - (rank.rank as number);
        }
  
        // inject ranking for last round
        if (round == this.scoreboard.lastround) {
          // TODO: Not sure here
          // $('#team_'+rank.id).html(rank.rank + '. ');
        }
  
        // last round scores
        var rrid = 0;
        this.scoreboard.rankingPerRound[round].forEach((rr, t)=>{
          if(rr.id==this.scoreboard.teams[rank.id-1].id)
          {
            rrid = t;
          }
        });
        
        // last round -1  scores
        var rrid0 = 0;
        this.scoreboard.rankingPerRound[round-1].forEach((rr, t)=>{
          if(rr.id==this.scoreboard.teams[rank.id-1].id)
          {
            rrid0 = t;
          }
        });
  
        if(this.scoreboard.teamtype == 0 || this.scoreboard.teamtype == this.scoreboard.teams[rank.id-1].type)
        {
          specialcount++;
          let defrank = rank.rank as number;
  
          if(this.scoreboard.teamtype == this.scoreboard.teams[rank.id-1].type)
          {
            if(typeof specialrank[(rank.rank as number)] != 'undefined')
            {
              defrank = specialrank[(rank.rank as number)];
            }
            else{
              specialrank[(rank.rank as number)] = specialcount;
              defrank = specialcount;
            }
          }
  
          if(defrank <= 3)
          {  
            const percentage = (rank.score / this.totalScore * 100).toFixed(1);
            this.top3total += defrank + ". " + this.scoreboard.teams[rank.id-1].name + " ("+rank.score+" - " + percentage + "%)<br>";
          }
  
          // render table
          const row = {
            rank: defrank,
            mrank: 0,
            srank: rank.srank,
            diff: (diff>0?'+':(diff==0?'':'-')),
            team: this.scoreboard.teams[rank.id-1].name + (this.scoreboard.teams[rank.id-1].type == 1?'&nbsp;&#9929;':''),
            round:this.scoreboard.rankingPerRound[round-1][rrid0].score,
            nextround: this.scoreboard.rankingPerRound[round][rrid].score,
            total: '<span class="badge">' + rank.score +'</span>'
          };
  
          if(this.scoreboard.specSort){
            row.mrank = (parseInt(rank.srank+'',10) * 10) + parseInt(this.scoreboard.teams[rank.id-1].type+'', 10);
          }
  
          this.ranking.push(row);
        }
      });
    }

    // Set title
    if(this.scoreboard.rounds[this.scoreboard.lastround]) {
      this.roundName = this.scoreboard.rounds[this.scoreboard.lastround].name;
      this.roundScore = this.scoreboard.rounds[this.scoreboard.lastround].max as number;
      this.title =  'DE STAND NA ' + this.roundName;        
  
      if(this.scoreboard.teamtype === 1) {
        this.title += ' - Circuitploegen&nbsp;&#9929';
      }
      if(this.scoreboard.teamtype === 2) {
        this.title += ' - Gelegenheidsploegen';
      }
    }

    this.dataSource = new MatTableDataSource<any>(this.ranking);
  }
}
