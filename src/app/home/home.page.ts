import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { Birthday } from '../models/birthday';
import { AlertController, ModalController } from '@ionic/angular';
import { BirthdayService } from '../services/birthday.service';
import { LandingPage } from '../landing/landing.page';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  userId: any;
  birthdate: Birthday[] = [];

  constructor(
    private authService: AuthenticationService,
    private alertctrl: AlertController,
    private birthdayService: BirthdayService,
    private modalctrl: ModalController
  ) {
   
  }

  ngOnInit() {
    this.authService.getCurrentUser().then((user) => {
      this.userId = user?.uid;
      console.log('user:', this.userId);

       if (this.userId) {
         this.birthdayService
           .getBirthDates(this.userId)
           .subscribe((birthdates) => {
             this.birthdate = birthdates;
             console.log('Birthdates:', this.birthdate);
           });
       }
    });
  }

  async openBirthday(birthday: Birthday) {
    const modal = await this.modalctrl.create({
      component: LandingPage,
      componentProps: { id: birthday.id },
      breakpoints: [0, 0.5, 0.8],
      initialBreakpoint:0.5
    })
    modal.present();
 }

  async addBirthdate() {
    const alert = await this.alertctrl.create({
      header: 'Add Birthdate',
      inputs: [
        {
          name: 'fullname',
          placeholder: 'Whose birthday is it?',
          type: 'text',
        },
        {
          name: 'description',
          placeholder: 'gift ideas?',
          type: 'textarea',
        },
        {
          name: 'date',
          placeholder: 'Select birthdate',
          type: 'date', // Date picker input
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          },
        },
        {
          text: 'Save',
          handler: (data) => {
            this.birthdayService.addBirthday({
              fullname: data.fullname,
              description: data.description,
              date: data.date,
            });
          },
        },
      ],
    });

    await alert.present();
  }
}
