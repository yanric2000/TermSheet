import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'lib-util',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './util.component.html',
  styleUrl: './util.component.scss',
})
export class UtilComponent {}
