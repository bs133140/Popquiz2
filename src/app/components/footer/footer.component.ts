import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  faUpload,
  faPlay,
  faChartBar,
  faFilter,
  faGift,
} from '@fortawesome/free-solid-svg-icons';
import { Scoreboard, Team } from 'src/app/models/scoreboard.model';
import { ScoreboardService } from 'src/app/services/scoreboard.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  faUpload = faUpload;
  faPlay = faPlay;
  faChartBar = faChartBar;
  faFilter = faFilter;
  faGift = faGift;
  autoscrollState: boolean;
  filterState: number = 0;
  loaded: boolean;
  stickyMenu: boolean;

  @ViewChild('fileInput') fileInput: ElementRef;
  @Output() autoscroll = new EventEmitter<boolean>();
  @Output() ranking = new EventEmitter<boolean>();
  @Output() filter = new EventEmitter<number>();
  @Output() home = new EventEmitter<void>();

  @HostListener('window:keypress', ['$event'])
  keyEvent(event: KeyboardEvent) {
    
    // Toggle menu
    if (event.key.toLowerCase() === 'q') {
      this.stickyMenu = true; // !this.stickyMenu;
      this.showPoster();
    }

    // Open file
    if (event.code === 'Space') {
      this.openFileDialog();
    }

    // Toggle list/ranking
    if (event.key.toLowerCase() === 's') {
      this.toggleRanking();
    }

    // Toggle autoplay
    if (event.key.toLowerCase() === 'd') {
      this.toggleAutoscroll();
    }

    // Toggle filter
    if (event.key.toLowerCase() === 'f') {
      this.toggleFilter();
    }
  }

  constructor(private scoreboardService: ScoreboardService) {}

  ngOnInit(): void {}

  openFileDialog() {
    this.fileInput.nativeElement.value = null;
    this.fileInput.nativeElement.click();
  }

  readFile() {
    // read file
    var file = this.fileInput.nativeElement.files[0];
    var reader = new FileReader();

    const me = this;
    reader.onload = function (e) {
      me.scoreboardService.processData(file.name, reader.result as string);
      me.loaded = true;
    };

    reader.readAsText(file);
  }

  showPoster(){
    this.home.emit();
  }

  toggleAutoscroll() {
    this.autoscrollState = !this.autoscrollState;
    this.autoscroll.emit(this.autoscrollState);
  }

  toggleRanking() {
    this.ranking.emit(true);
  }

  toggleFilter() {
    this.filterState += 1;

    if (this.filterState > 2) {
      this.filterState = 0;
    }

    this.filter.emit(this.filterState);
  }

  togglePrices() {
    this.ranking.emit(true);
  }
}
