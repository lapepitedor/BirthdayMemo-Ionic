import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { AuthenticationService } from '../services/authentication.service';
import { BirthdayService } from '../services/birthday.service';
import { Birthday } from '../models/birthday';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
})
export class LandingPage implements OnInit {
  @Input() id!: string;
  birthday!: Birthday;
  isModified: boolean = false;
  originalBirthday!: Birthday; // To store the original values
  constructor(
    private toastctrl: ToastController,
    private birthdayService: BirthdayService,
    private modalctrl: ModalController
  ) {}

  ngOnInit() {
    this.birthdayService.getBirthDayById(this.id).subscribe((data) => {
      this.birthday = data;
      this.originalBirthday = { ...data }; // Save a copy of the original birthday data
    });
  }

  async updateBirthdate() {
    if (!this.isModified) return;
   try {
     await this.birthdayService.updateBirthDate(this.birthday);
     const toast = await this.toastctrl.create({
       message: 'Birthday updated!',
       duration: 2500,
     });
     toast.present();
     this.modalctrl.dismiss();
   } catch (error) {
     console.error('Error updating birthday:', error);
   }
  }

  cancelUpdate() {
    this.modalctrl.dismiss();
  }

  onInputChange() {
    this.isModified = this.hasChanges();
  }

  hasChanges(): boolean {
    return (
      this.birthday.fullname !== this.originalBirthday.fullname ||
      this.birthday.description !== this.originalBirthday.description ||
      this.birthday.date !== this.originalBirthday.date
    );
  }

  async deleteBirthdate(id: string) {
    await this.birthdayService.deleteBirthday(id);
    const toast = await this.toastctrl.create({
      message: 'Birthday deleted!',
      duration: 2500,
    });
    toast.present();
    this.modalctrl.dismiss();
  }
}
