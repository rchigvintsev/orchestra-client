import {Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NavigationEnd, Router, RouterEvent} from '@angular/router';
import {NgForm} from '@angular/forms';

import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import {I18nService} from '../../../service/i18n.service';
import {TaskListService} from '../../../service/task-list.service';
import {TaskList} from '../../../model/task-list';
import {HttpRequestError} from '../../../error/http-request.error';
import {HTTP_RESPONSE_HANDLER, HttpResponseHandler} from '../../../handler/http-response.handler';
import {Strings} from '../../../util/strings';
import {PathMatcher} from '../../../util/path-matcher';

@Component({
  selector: 'app-task-lists',
  templateUrl: './task-lists.component.html',
  styleUrls: ['./task-lists.component.scss']
})
export class TaskListsComponent implements OnInit, OnDestroy {
  @ViewChild('taskListForm')
  taskListForm: NgForm;
  taskListFormModel = new TaskList();
  taskListFormSubmitEnabled = false;
  taskLists: TaskList[] = [];

  private pathMatcher: PathMatcher;
  private componentDestroyed = new Subject<boolean>();

  constructor(public i18nService: I18nService,
              private taskListService: TaskListService,
              @Inject(HTTP_RESPONSE_HANDLER) private httpResponseHandler: HttpResponseHandler,
              private router: Router) {
  }

  ngOnInit() {
    this.taskListService.getUncompletedTaskLists().subscribe(
      taskLists => this.taskLists = taskLists,
      (error: HttpRequestError) => this.httpResponseHandler.handleError(error));
    this.taskListService.getUpdatedTaskList()
      .pipe(takeUntil(this.componentDestroyed))
      .subscribe(taskList => this.onTaskListUpdate(taskList));
    this.taskListService.getCompletedTaskList()
      .pipe(takeUntil(this.componentDestroyed))
      .subscribe(taskList => this.onTaskListComplete(taskList));
    this.taskListService.getDeletedTaskList()
      .pipe(takeUntil(this.componentDestroyed))
      .subscribe(taskList => this.onTaskListDelete(taskList));

    this.pathMatcher = PathMatcher.fromUrlTree(this.router.parseUrl(this.router.url));

    this.router.events.subscribe((event: RouterEvent) => {
      if (event instanceof NavigationEnd) {
        this.onNavigationEnd(event);
      }
    });
  }

  ngOnDestroy(): void {
    this.componentDestroyed.next(true);
    this.componentDestroyed.complete();
  }

  isRouterLinkActive(path: string): boolean {
    return this.pathMatcher && this.pathMatcher.matches(path);
  }

  onTaskListFormModelNameChange() {
    this.taskListFormSubmitEnabled = !Strings.isBlank(this.taskListFormModel.name);
  }

  onTaskListFormSubmit() {
    this.createTaskList();
  }

  private onNavigationEnd(e: NavigationEnd) {
    this.pathMatcher = PathMatcher.fromUrlTree(this.router.parseUrl(e.url));
  }

  private createTaskList() {
    if (!Strings.isBlank(this.taskListFormModel.name)) {
      this.taskListService.createTaskList(this.taskListFormModel).subscribe(createdTaskList => {
        this.taskLists.push(createdTaskList);
        this.taskListForm.resetForm();
      }, (error: HttpRequestError) => this.httpResponseHandler.handleError(error));
    }
  }

  private onTaskListUpdate(updatedTaskList: TaskList) {
    const index = this.taskLists.findIndex(taskList => taskList.id === updatedTaskList.id);
    if (index >= 0) {
      this.taskLists[index] = updatedTaskList;
    }
  }

  private onTaskListComplete(completedTaskList: TaskList) {
    this.removeTaskList(completedTaskList);
  }

  private onTaskListDelete(deletedTaskList: TaskList) {
    this.removeTaskList(deletedTaskList);
  }

  private removeTaskList(taskList: TaskList) {
    const index = this.taskLists.findIndex(e => e.id === taskList.id);
    if (index >= 0) {
      this.taskLists.splice(index, 1);
    }
  }
}
