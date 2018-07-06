import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TableEditComponent } from 'app/table/table-edit.component';
import { BfComponentParameterService } from 'bfend';
import { ComponentParameter } from 'bfend/src/component-parameter';
import { NzModalService } from 'ng-zorro-antd';
import { retry, switchMap } from 'rxjs/operators';
import { finalize } from 'rxjs/operators/finalize';
import { UserApi } from '../core/api/user.api';

@Component({
  template: `
    <bf-page caption="表格" [description]="description">
      <ng-template #description>列表页操作演示</ng-template>

      <nz-card>
        <form class="search-form" nz-form [nzLayout]="'inline'" (submit)="onSearch($event)">
          <nz-row nzType="flex" [nzGutter]="16">
            <nz-col [nzMd]="8" [nzSm]="24">
              <nz-form-item>
                <nz-form-label nzFor="no" style="width:95px;">规则编号</nz-form-label>
                <nz-form-control>
                  <input nz-input name="no" placeholder="请输入" id="no" [(ngModel)]="searches.id">
                </nz-form-control>
              </nz-form-item>
            </nz-col>
            <nz-col [nzMd]="8" [nzSm]="24">
              <nz-form-item>
                <nz-form-label nzFor="status" style="width:95px;">使用时间</nz-form-label>
                <nz-form-control>
                  <nz-date-picker [nzStyle]="{width: '100%'}" name="date" [(ngModel)]="searches.date"></nz-date-picker>
                </nz-form-control>
              </nz-form-item>
            </nz-col>
            <nz-col [nzMd]="8" [nzSm]="24" *ngIf="expandForm">
              <nz-form-item>
                <nz-form-label nzFor="callNo" style="width:95px;">调用次数</nz-form-label>
                <nz-form-control>
                  <input nz-input id="callNo">
                </nz-form-control>
              </nz-form-item>
            </nz-col>
            <nz-col [nzMd]="8" [nzSm]="24" *ngIf="expandForm">
              <nz-form-item>
                <nz-form-label nzFor="updatedAt" style="width:95px;">更新日期</nz-form-label>
                <nz-form-control>
                </nz-form-control>
              </nz-form-item>
            </nz-col>
            <nz-col [nzMd]="8" [nzSm]="24" *ngIf="expandForm">
              <nz-form-item>
                <nz-form-label nzFor="status2" style="width:95px;">使用状态</nz-form-label>
                <nz-form-control>
                  <nz-select [nzPlaceHolder]="'请选择'" nzId="status2" [nzShowSearch]="true">
                    <nz-option [nzLabel]="'成功'" [nzValue]="1"></nz-option>
                    <nz-option [nzLabel]="'失败'" [nzValue]="0"></nz-option>
                  </nz-select>
                </nz-form-control>
              </nz-form-item>
            </nz-col>
            <nz-col [nzMd]="8" [nzSm]="24" *ngIf="expandForm">
              <nz-form-item>
                <nz-form-label nzFor="status3" style="width:95px;">使用状态</nz-form-label>
                <nz-form-control>
                  <nz-select [nzPlaceHolder]="'请选择'" nzId="status3" [nzShowSearch]="true">
                    <nz-option [nzLabel]="'成功'" [nzValue]="1"></nz-option>
                    <nz-option [nzLabel]="'失败'" [nzValue]="0"></nz-option>
                  </nz-select>
                </nz-form-control>
              </nz-form-item>
            </nz-col>
            <nz-col [nzSpan]="expandForm ? 24 : 8" [class.text-right]="expandForm">
              <button nz-button type="submit" [nzType]="'primary'" [nzLoading]="loading">查询</button>
              <button nz-button type="reset" class="mx-sm">重置</button>
              <a (click)="expandForm=!expandForm">
                {{expandForm ? '收起' : '展开'}}
                <i class="anticon" [class.anticon-down]="!expandForm" [class.anticon-up]="expandForm"></i>
              </a>
            </nz-col>
          </nz-row>
        </form>

        <button nz-button [nzType]="'primary'" (click)="edit()" class="mb-sm">
          <i class="anticon anticon-plus"></i>
          <span>新建</span>
        </button>
        
        <nz-table
          #nzTable
          [nzData]="data"
          [nzFrontPagination]="false"
          [nzTotal]="page.total"
          [(nzPageIndex)]="page.index"
          [(nzPageSize)]="page.size"
          (nzPageIndexChange)="onPageIndexChange($event)"
          [nzSize]="'middle'"
          [nzLoading]="loading"
          [nzLoadingDelay]="1000">
          <thead>
          <tr>
            <th>Name</th>
            <th>Age</th>
            <th>Address</th>
            <th [nzWidth]="'150px'">Action</th>
          </tr>
          </thead>
          <tbody>
          <tr *ngFor="let data of nzTable.data">
            <td>{{data.name}}</td>
            <td>{{data.age}}</td>
            <td>{{data.address}}</td>
            <td>
              <span acl="table.detail.show">
                <a [routerLink]="'../' + data.id">详情</a>
                <nz-divider nzType="vertical"></nz-divider>
              </span>
              <span [acl]="'table.detail.edit'">
                <a (click)="edit(123)">编辑</a>
                <nz-divider nzType="vertical"></nz-divider>
              </span>
              <nz-popconfirm acl="table.detail.delete" [nzTitle]="'确定要删除吗？'">
                <a class="text-error" nz-popconfirm>删除</a>
              </nz-popconfirm>
            </td>
          </tr>
          </tbody>
        </nz-table>
      </nz-card>
    </bf-page>
  `
})
export class TableComponent implements OnInit {
  data: any = [];

  loading = false;

  expandForm = false;

  page = {
    index: 1,
    size: 15,
    total: 0
  };

  total = 0;

  searches: {[index: string]: any} = {
    id: null,
    date: null
  };

  private params: ComponentParameter<any>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private nzModal: NzModalService,
    private api: UserApi,
    cp: BfComponentParameterService
  ) {
    this.params = cp.new(TableComponent, {
      page: this.page.index,
      ...this.searches
    });
  }

  ngOnInit() {
    this.params.params$.pipe(
      switchMap(p => {
        const {page, ...searches} = p;

        this.page.index = page;
        this.searches = {...this.searches, ...searches};
        this.searches.date = this.searches.date ? new Date(this.searches.date) : null;

        this.loading = true;
        return this.api.get({
          page,
          page_size: this.page.size,
          ...searches,
        }).pipe(finalize(() => this.loading = false));
      }),
      retry()
    ).subscribe(res => {
      this.data = res.data;
      this.page.total = res.meta.total;
    });
  }

  load() {
    this.params.set({});
  }

  edit(id?) {
    const modal = this.nzModal.create({
      nzTitle: id ? '编辑' : '添加',
      nzContent: TableEditComponent,
      nzMaskClosable: false,
      nzComponentParams: {id},
      nzOnOk: () => modal.getContentComponent().submit().then(res => {
        if (res) {
          this.load();
        }
        return res;
      })
    });
  }

  onPageIndexChange(index) {
    this.params.set({page: index});
  }

  onSearch(e) {
    e.preventDefault();
    this.params.set({
      ...this.searches,
      date: this.searches.date ? formatDate(this.searches.date) : null
    });
  }
}

function formatDate(date: Date) {
  function pz(n: number) {
    return n < 10 ? `0${n}` : n.toString();
  }
  return `${date.getFullYear()}-${pz(date.getMonth() + 1)}-${pz(date.getDate())}`
}