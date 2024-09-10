import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { user } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  constructor(
    public authService: AuthenticationService,
    private loadingCtrl: LoadingController,
    private toastController: ToastController,
    private router: Router,
    private fb: FormBuilder
  ) {}
  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]'),
        ],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          //  Validators.pattern('(?=.*d)(?=.*[a-z])(?=.*[A-Z]).{8,}'),
        ],
      ],
    });
  }

  get errorControl() {
    return this.loginForm?.controls;
  }

  async login() {
    const loading = await this.loadingCtrl.create();
    await loading.present();

    if (this.loginForm.valid) {
      try {
        await this.authService.doLogin(
          this.loginForm.value.email,
          this.loginForm.value.password
        );

        loading.dismiss();
        this.router.navigate(['/home']);
      } catch (err) {
        loading.dismiss();
        this.presentToast('Email or Password is wrong.');
        console.log(err);
      }
    } else {
      loading.dismiss();
      this.presentToast('Please fill in the form correctly.');
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 1500,
      position: 'top',
    });

    await toast.present();
  }
}
