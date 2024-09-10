import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { Birthday } from '../models/birthday';
import { AlertController, ModalController } from '@ionic/angular';
import { BirthdayService } from '../services/birthday.service';
import { LandingPage } from '../landing/landing.page';
import { Route, Router } from '@angular/router';


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
    private modalctrl: ModalController,
    private router:Router
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().then((user) => {
      this.userId = user?.uid;
      console.log('user:', this.userId);

      //
      if (this.userId) {
        this.birthdayService
          .getBirthDates(this.userId)
          .subscribe((birthdates) => {
            // Calculate days left for each birthday and update the list
            this.birthdate = birthdates
              .map((birthday) => ({
                ...birthday,
                daysLeft: this.calculateDaysLeft(birthday.date), // Calculate days left for each birthday
              }))
              // Sort birthdays by daysLeft in ascending order
              .sort((a, b) => a.daysLeft - b.daysLeft);

            console.log('Birthdates sorted by days left:', this.birthdate);
          });
      }
    });
  }

  calculateDaysLeft(birthdayDateString: Date): number {
    const today = new Date();
    const birthdayDate = new Date(birthdayDateString);

    // Set the birthday to this year
    birthdayDate.setFullYear(today.getFullYear());

    // If the birthday has already passed this year, set it to next year
    if (today > birthdayDate) {
      birthdayDate.setFullYear(today.getFullYear() + 1);
    }

    // Check if birthday is today
    const isToday =
      today.getDate() === birthdayDate.getDate() &&
      today.getMonth() === birthdayDate.getMonth();

    if (isToday) {
      return 0; // Birthday is today
    }

    // Calculate the difference in time and convert to days
    const timeDiff = birthdayDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)); // Convert from ms to days
  }

  async openBirthday(birthday: Birthday) {
    const modal = await this.modalctrl.create({
      component: LandingPage,
      componentProps: { id: birthday.id },
      breakpoints: [0, 0.5, 0.8],
      initialBreakpoint: 0.5,
    });
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

  async logout() {
    this.authService.doLogout; // Implement your logout logic here
    this.router.navigate(['/login']); // Redi
  }
}
