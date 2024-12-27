import { Injectable } from '@angular/core';
import { AuthenticationService } from './authentication.service';
import { Birthday } from '../models/birthday';
import { from, map, Observable, Subject } from 'rxjs';
import { addDoc, collection, collectionData, deleteDoc, doc, docData, Firestore, query, updateDoc, where } from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root',
})
export class BirthdayService {
  private userId!: any;

  private collectionRefPath = 'birthdayList';
  

  constructor(
    private authservice: AuthenticationService,
    public db: Firestore,
  ) {
    this.authservice.getCurrentUser().then((user) => {
      this.userId = user?.uid;
      console.log(this.userId);
    });
  }

  addBirthday(birthday: Birthday) {
    birthday.userId = this.userId;
    const birthdayRef = collection(this.db, this.collectionRefPath);
    return addDoc(birthdayRef, birthday);
  }

  deleteBirthday(id: string) {
    const birthdayRef = doc(this.db, `birthdayList/${id}`);
    return deleteDoc(birthdayRef);
  }

  getBirthDates(userId: any) {
    const birthdayRef = collection(this.db, 'birthdayList');
    const queryRef = query(birthdayRef, where('userId', '==', userId));
    return collectionData(queryRef, { idField: 'id' }) as Observable<
      Birthday[]
    >;
  }

  getBirthDayById(id: any) {
    const birthdayRef = doc(this.db, `birthdayList/${id}`);
    return docData(birthdayRef, { idField: 'id' }) as Observable<Birthday>;
  }

  updateBirthDate(birthday: Birthday) {
    if (!birthday.id) {
      throw new Error('Birthday ID is required to update the document.');
    }
    const birthdayRef = doc(this.db, `birthdayList/${birthday.id}`);
    return updateDoc(birthdayRef, {
      fullname: birthday.fullname,
      date: birthday.date,
      description: birthday.description,
    });
  }
  
}
