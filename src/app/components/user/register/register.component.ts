import { Component, OnInit, ViewChild } from '@angular/core';
import {NgForm} from '@angular/forms';
import {Router} from '@angular/router';
import {UserServiceClient} from '../../../services/user.service.client';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  @ViewChild('f') registerForm: NgForm;
  username: string;
  password: string;
  verifyPassword: string;
  lastName: string;
  firstName: string;
  email: string;
  errorFlag: boolean;
  errorMsg = '';

  constructor(private router: Router, private userService: UserServiceClient) { }

  ngOnInit() {
  }

  register() {
    this.username = this.registerForm.value.username;
    this.password = this.registerForm.value.password;
    this.verifyPassword = this.registerForm.value.verifyPassword;
    this.lastName = this.registerForm.value.lastName;
    this.firstName = this.registerForm.value.firstName;
    this.email = this.registerForm.value.email;
    const user  = {
      username: this.username,
      password: this.password,
      first_name: this.firstName,
      last_name: this.lastName,
      email: this.email,
      type: 'Customer'
    };

    this.userService.createUser(user)
      .subscribe(
        (newUser: any) => {
          this.errorFlag = false;
          this.router.navigate(['profile']);},
        (error: any) => {
          this.errorFlag = true;
        }
      );
  }

}
