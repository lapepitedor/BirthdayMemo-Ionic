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
  constructor(
    private authService: AuthenticationService,
    private alertctrl: AlertController,
    private toastctrl:ToastController,
    private birthdayService: BirthdayService,
    private modalctrl: ModalController
  ) {}

  ngOnInit() {
    debugger
    this.birthdayService.getBirthDayById(this.id).subscribe((data) => {
      this.birthday = data;
      console.log('data:', this.birthday)
    });
  }

  async updateBirthdate() {
      console.log('Birthday to update:', this.birthday);
    debugger
    
    this.birthdayService.updateBirthDate(this.birthday);
   const toast = await this.toastctrl.create({
     message: 'Birthday updated!',
     duration: 2500
   });
    toast.present();
    this.modalctrl.dismiss();
  
  }

  async deleteBirthdate() {
    await this.birthdayService.deleteBirthday(this.birthday);
    this.modalctrl.dismiss();
  }
}
