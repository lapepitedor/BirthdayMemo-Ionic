import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../services/authentication.service';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';

// https://www.w3schools.com/TAGS/att_input_pattern.asp

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  registerForm!: FormGroup;
  constructor(
    public authService: AuthenticationService,
    public loadingCtrl: LoadingController,
    private toastController: ToastController,
    private router: Router,
    private fb: FormBuilder
  ) {}

  //title="Must contain at least one  number and one uppercase and lowercase letter, and at least 8 or more characters"

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
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
    return this.registerForm?.controls;
  }

  async signUp() {
    debugger
    const loading = await this.loadingCtrl.create();
    await loading.present();

    if (this.registerForm.valid) {
      try {
        const { email, password, username } = this.registerForm.value;
        console.log('Attempting to register with:', { email, password, username });

        // Await the registration call
        await this.authService.doRegister(email, password, username);
      
        // If successful
        await loading.dismiss();
        this.presentToast('Registration successful');

      } catch (err:any) {
        // Handle errors
        await loading.dismiss();
        this.presentToast(err.message || 'An error occurred during registration.');
      }
    } else {
      // Form is invalid
      await loading.dismiss();
      this.presentToast('Please fill in all required fields.');
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
