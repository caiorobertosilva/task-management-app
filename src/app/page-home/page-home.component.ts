import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogUserData {
  name: string;
  i: number;
  tasks: Array<{ name: string, state: string }>
}

export interface DialogTaskData {
  name: string;
  description: string;
  creationDate: string;
  modificationDate: string;
  state: string;
  i: number;
  assignee: string;
}

@Component({
  selector: 'app-page-home',
  templateUrl: './page-home.component.html',
  styleUrls: ['./page-home.component.scss']
})
export class PageHomeComponent implements OnInit {
  fgTask!: FormGroup;
  fgUser!: FormGroup;

  tasks: Array<{
    name: string,
    description: string,
    creationDate: number,
    modificationDate: number,
    state: string,
    assignee: string
  }> = [];

  users: Array<{ name: string, tasks?: Array<{ name: string, state: string }> }> = [];

  constructor(public dialog: MatDialog, private fb: FormBuilder) { }

  ngOnInit() {
    this.fgTask = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(20)]]
    });

    this.fgUser = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(20)]]
    });

    const user_storage = localStorage.getItem('users');
    const task_storage = localStorage.getItem('tasks');

    if (typeof user_storage !== 'undefined' && user_storage !== null) {
      this.users = [];
      this.users = JSON.parse(localStorage.getItem('users') || '{}');
    }

    if (typeof task_storage !== 'undefined' && task_storage !== null) {
      this.tasks = [];
      this.tasks = JSON.parse(localStorage.getItem('tasks') || '{}');
    }

    this.getUserTasks();
  }

  deleteUser(i: number) {
    this.users.splice(i, 1);
    localStorage.setItem('users', JSON.stringify(this.users));
    this.getUserTasks();
  }

  deleteTask(i: number) {
    this.tasks.splice(i, 1);
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
    this.getUserTasks();
  }

  editUser(i: number): void {
    const dialogRef = this.dialog.open(DialogUser, {
      width: '300px',
      data: { name: this.users[i].name, i }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.users = [];
      this.users = JSON.parse(localStorage.getItem('users') || '{}');
      this.getUserTasks();
    });
  }

  editTask(i: number): void {
    const dialogRef = this.dialog.open(DialogTask, {
      width: '300px',
      data: {
        name: this.tasks[i].name,
        description: this.tasks[i].description,
        state: this.tasks[i].state,
        assignee: this.tasks[i].assignee,
        i: i
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.tasks = [];
      this.tasks = JSON.parse(localStorage.getItem('tasks') || '{}');
      this.getUserTasks();
    });
  }

  getUserTasks() {
    for (let user of this.users) {
      user.tasks = [];
    }

    for (let user of this.users) {
      for (let task of this.tasks) {
        if (user.name === task.assignee) {
          user.tasks?.push({ name: task.name, state: task.state });
        }
      }
    }

    console.log(this.users);
  }

  onSubmitUser(form: FormGroup) {
    if (form.valid) {
      let old: Array<{name: string}> = JSON.parse(localStorage.getItem('users') || '{}');
      old.push({ name: form.value.name });
      localStorage.setItem('users', JSON.stringify(old));
      this.users = [];
      this.users = JSON.parse(localStorage.getItem('users') || '{}');
      this.fgUser.get('name')?.setValue('');
      this.fgUser.get('name')?.clearValidators();
      this.fgUser.get('name')?.setErrors(null);
      this.fgUser.get('name')?.updateValueAndValidity();
      this.getUserTasks();
    }
  }

  onSubmitTask(form: FormGroup) {
    if (form.valid) {
      const dialogRef = this.dialog.open(DialogTask, {
        width: '300px',
        data: { name: form.value.name, i: null }
      });

      dialogRef.afterClosed().subscribe(result => {
        this.tasks = [];
        this.tasks = JSON.parse(localStorage.getItem('tasks') || '{}');
        this.fgTask.get('name')?.setValue('');
        this.fgTask.get('name')?.clearValidators();
        this.fgTask.get('name')?.setErrors(null);
        this.fgTask.get('name')?.updateValueAndValidity();
        this.getUserTasks();
      });
    }
  }
}

@Component({
  selector: 'dialog-user',
  templateUrl: 'dialog-user.html',
})
export class DialogUser implements OnInit {
  fgUserEdit!: FormGroup;
  invalid: boolean = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DialogUser>,
    @Inject(MAT_DIALOG_DATA) public data: DialogUserData
  ) { }

  ngOnInit() {
    this.fgUserEdit = this.fb.group({
      name: [this.data.name, [Validators.required, Validators.maxLength(20)]]
    });
  }

  onSubmitEditUser(form: FormGroup): void {
    if (form.valid) {
      let old: Array<{name: string}> = JSON.parse(localStorage.getItem('users') || '{}');
      old[this.data.i].name = form.value.name;
      localStorage.setItem('users', JSON.stringify(old));
      this.dialogRef.close();
    }
  }
}

@Component({
  selector: 'dialog-task',
  templateUrl: 'dialog-task.html',
})
export class DialogTask implements OnInit {
  fgTaskEdit!: FormGroup;
  invalid: boolean = false;
  inProgress: number = 0;
  users: Array<{ name: string, tasks: Array<{ name: string, state: string }> }> = [];

  tasks: Array<{
    name: string,
    description: string,
    creationDate: number,
    modificationDate: number,
    state: string,
    assignee: string
  }> = [];

  state = [
    { value: 'in queue', viewValue: 'In queue', disabled: false },
    { value: 'in progress', viewValue: 'In progress', disabled: false },
    { value: 'done', viewValue: 'Done', disabled: false }
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DialogTask>,
    @Inject(MAT_DIALOG_DATA) public data: DialogTaskData
  ) { }

  ngOnInit() {
    this.fgTaskEdit = this.fb.group({
      name: [this.data.name, [Validators.required, Validators.maxLength(20)]],
      description: [this.data.description, [Validators.required, Validators.maxLength(20)]],
      state: [this.data.state],
      assignee: [this.data.assignee]
    });

    this.users = JSON.parse(localStorage.getItem('users') || '{}');
    this.users.unshift({ name: 'None', tasks: [] });

    this.getUserTasks();

    this.fgTaskEdit.get("assignee")?.valueChanges.subscribe(selectedValue => {
      this.getUserTasks();
      this.state[1].disabled = selectedValue === 'None' ? true : (this.inProgress > 0 && this.users[this.data.i].name === selectedValue ? true : false);
      this.state[2].disabled = selectedValue === 'None' ? true : false;

      if (selectedValue === 'None' || this.inProgress > 0 && this.users[this.data.i].name === selectedValue) {
        this.fgTaskEdit.get('state')?.setValue('in queue');
      }
    })
  }

  getUserTasks() {
    this.tasks = [];
    this.tasks = JSON.parse(localStorage.getItem('tasks') || '{}');
    this.inProgress = 0;

    for (let user of this.users) {
      user.tasks = [];
    }

    for (let user of this.users) {
      for (let task of this.tasks) {
        if (user.name === task.assignee) {
          user.tasks?.push({ name: task.name, state: task.state });

          if (task.state === 'in progress') {
            this.inProgress++;
          }
        }
      }
    }

    if (this.inProgress > 0) {
      this.state[1].disabled = true;
    }
  }

  onSubmitEditTask(form: FormGroup): void {
    if (form.valid) {
      let old: Array<{
        name: string,
        description: string,
        creationDate: string,
        modificationDate: string,
        state: string,
        assignee: string
      }> = JSON.parse(localStorage.getItem('tasks') || '{}');

      const newDate = new Intl.DateTimeFormat('en-US', {
        dateStyle: 'short', timeStyle: 'medium', timeZone: 'America/New_York'
      }).format(new Date());

      if (this.data.i === null) {
        old.push({
          name: form.value.name,
          description: form.value.description,
          creationDate: newDate,
          modificationDate: newDate,
          state: form.value.state,
          assignee: form.value.assignee
        });
      } else {
        old[this.data.i].name = form.value.name;
        old[this.data.i].description = form.value.description;
        old[this.data.i].modificationDate = newDate;
        old[this.data.i].state = form.value.state;
        old[this.data.i].assignee = form.value.assignee;
      }

      localStorage.setItem('tasks', JSON.stringify(old));
      this.dialogRef.close();
    }
  }
}
