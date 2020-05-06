import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';

import {TranslateService} from '@ngx-translate/core';

import {WebServiceBasedComponent} from '../web-service-based.component';
import {Task} from '../model/task';
import {TaskGroup} from '../service/task-group';
import {TaskGroupService} from '../service/task-group.service';
import {TaskService} from '../service/task.service';
import {AuthenticationService} from '../service/authentication.service';
import {LogService} from '../service/log.service';
import {Strings} from '../util/strings';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.styl']
})
export class TasksComponent extends WebServiceBasedComponent implements OnInit {
  @ViewChild('taskForm')
  taskForm: NgForm;

  formModel = new Task();
  tasks: Array<Task>;
  title: string;

  constructor(router: Router,
              translate: TranslateService,
              authenticationService: AuthenticationService,
              log: LogService,
              private route: ActivatedRoute,
              private taskService: TaskService,
              private taskGroupService: TaskGroupService) {
    super(translate, router, authenticationService, log);
  }

  private static getTitle(taskGroup: TaskGroup): string {
    switch (taskGroup) {
      case TaskGroup.INBOX:
        return 'inbox';
      case TaskGroup.TODAY:
        return 'scheduled_for_today';
      case TaskGroup.TOMORROW:
        return 'scheduled_for_tomorrow';
      case TaskGroup.WEEK:
        return 'scheduled_for_week';
      case TaskGroup.SOME_DAY:
        return 'scheduled_for_some_day';
    }
    return null;
  }

  ngOnInit() {
    this.taskGroupService.getSelectedTaskGroup().subscribe(taskGroup => this.onTaskGroupSelect(taskGroup));
    this.route.fragment.subscribe(fragment => this.onUrlFragmentChange(fragment));
  }

  onTaskFormSubmit() {
    this.createTask();
  }

  onTaskCompleteCheckboxChange(task: Task) {
    // Let animation to complete
    setTimeout(() => {
      this.completeTask(task);
    }, 300);
  }

  private onTaskGroupSelect(taskGroup: TaskGroup) {
    if (taskGroup != null) {
      this.taskService.getTasks(taskGroup).subscribe(tasks => this.tasks = tasks, this.onServiceCallError.bind(this));
      this.title = TasksComponent.getTitle(taskGroup);
    }
  }

  private onUrlFragmentChange(fragment: string) {
    let taskGroup = TaskGroup.valueOf(fragment);
    if (!taskGroup) {
      taskGroup = TaskGroup.TODAY;
      this.router.navigate([this.translate.currentLang, 'task'], {fragment: taskGroup.value}).then();
    }
    this.taskGroupService.notifyTaskGroupSelected(taskGroup);
  }

  private createTask() {
    if (!Strings.isBlank(this.formModel.title)) {
      this.taskService.createTask(this.formModel).subscribe(task => {
        this.tasks.push(task);
        this.taskForm.resetForm();
      }, this.onServiceCallError.bind(this));
    }
  }

  private completeTask(task: Task) {
    this.taskService.completeTask(task).subscribe(_ => {
      this.tasks = this.tasks.filter(e => e.id !== task.id);
    }, this.onServiceCallError.bind(this));
  }
}
