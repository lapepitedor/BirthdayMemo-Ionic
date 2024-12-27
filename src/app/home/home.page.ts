import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { Birthday } from '../models/birthday';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { BirthdayService } from '../services/birthday.service';
import { DetailsPage } from '../details-page/details.page';
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
    private toastController: ToastController,
    private birthdayService: BirthdayService,
    private modalctrl: ModalController,
    private router: Router
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
      component: DetailsPage,
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
          placeholder: 'Gift ideas?',
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
          handler: async (data) => {
            let errorMessage = '';
           
            if (!data.fullname && !data.date) {
              errorMessage =
                'Please fill out both the Full Name and Date fields.';
            } else if (!data.fullname) {
              errorMessage = 'Please fill out the Full Name field.';
            } else if (!data.date) {
              errorMessage = 'Please select a Date.';
            }

            if (errorMessage) {
              await this.presentErrorToast(errorMessage);
              return false; // Empêche la fermeture de l'alerte
            }

            // Appeler le service si la validation passe
            this.birthdayService.addBirthday({
              fullname: data.fullname,
              description: data.description,
              date: data.date,
            });

            return true; // Permet de fermer l'alerte
          },
        },
      ],
    });

    await alert.present();
  }

  async presentErrorToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000, // Durée en millisecondes
      color: 'danger', // Couleur du toast (peut être 'primary', 'secondary', etc.)
      position: 'top', // Position du toast ('top', 'bottom', 'middle')
    });
    toast.present();
  }

  async logout() {
    this.authService.doLogout; // Implement your logout logic here
    this.router.navigate(['/login']); // Redi
  }
}
