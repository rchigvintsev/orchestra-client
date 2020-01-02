import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';

import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {Task} from '../model/task';
import {ConfigService} from './config.service';

const commonHttpOptions = {withCredentials: true};
const postOptions = Object.assign({headers: new HttpHeaders({'Content-Type': 'application/json'})}, commonHttpOptions);

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  readonly baseUrl: string;

  constructor(private http: HttpClient, private config: ConfigService) {
    this.baseUrl = `${this.config.apiBaseUrl}/tasks`;
  }

  getTasks(completed: boolean) {
    const options = Object.assign({params: new HttpParams().set('completed', String(completed))}, commonHttpOptions);
    return this.http.get<any>(this.baseUrl, options).pipe(
      map(response => {
        const tasks = [];
        for (const json of response) {
          tasks.push(new Task().deserialize(json));
        }
        return tasks;
      })
    );
  }

  getTask(id: number): Observable<Task> {
    return this.http.get<any>(`${this.baseUrl}/${id}`, commonHttpOptions).pipe(
      map(response => {
        return new Task().deserialize(response);
      })
    );
  }

  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.baseUrl, task, postOptions).pipe(
      map(response => {
        return new Task().deserialize(response);
      })
    );
  }

  updateTask(task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.baseUrl}/${task.id}`, task, postOptions).pipe(
      map(response => {
        return new Task().deserialize(response);
      })
    );
  }
}
