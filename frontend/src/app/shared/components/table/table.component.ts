import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface TableColumn {
  key: string;
  header: string;
  sortable?: boolean;
}

@Component({
  selector: 'app-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './table.component.html',
})
export class TableComponent {
  readonly columns = input.required<TableColumn[]>();
  readonly data = input.required<Record<string, unknown>[]>();
  readonly pageable = input(false);
  readonly page = input(1);
  readonly pageSize = input(10);
  readonly total = input(0);

  readonly pageChange = output<number>();
  readonly rowClick = output<Record<string, unknown>>();

  protected getPageCount(): number {
    const size = this.pageSize();
    const count = this.total() > 0 ? this.total() : this.data().length;
    return size > 0 ? Math.max(1, Math.ceil(count / size)) : 1;
  }

  protected onPreviousPage(): void {
    if (this.page() > 1) {
      this.pageChange.emit(this.page() - 1);
    }
  }

  protected onNextPage(): void {
    if (this.page() < this.getPageCount()) {
      this.pageChange.emit(this.page() + 1);
    }
  }

  protected onRowClick(row: Record<string, unknown>): void {
    this.rowClick.emit(row);
  }
}
