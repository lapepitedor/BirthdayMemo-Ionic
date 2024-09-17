import { TestBed } from '@angular/core/testing';
import { BirthdayService } from './birthday.service';
import {
  Firestore,
  provideFirestore,
  getFirestore,
} from '@angular/fire/firestore';
import { of } from 'rxjs';
import { AuthenticationService } from './authentication.service';
import { Birthday } from '../models/birthday';
import { AngularFireModule } from '@angular/fire/compat';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { environment } from 'src/environments/environment';
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
} from '@angular/fire/firestore';
import { user } from '@angular/fire/auth';

// Mocks
const mockAuthService = {
   getCurrentUser: jasmine
     .createSpy('getCurrentUser')
     .and.returnValue(Promise.resolve({ uid: 'testUserId' })),

  // getCurrentUser() {
  //   return Promise.resolve({ uid: 'testUserId' });
  // },
};
const mockFirestore = {
  collection: jasmine.createSpy('collection').and.callFake(() => ({})),
  doc: jasmine.createSpy('doc').and.callFake(() => ({})),
};

// const mockFirestore = {
//   collection: jasmine.createSpy('collection').and.returnValue({
//     add: jasmine.createSpy('add').and.returnValue(Promise.resolve()),
//     valueChanges: jasmine.createSpy('valueChanges').and.returnValue(of([])),
//     doc: jasmine.createSpy('doc').and.callFake(() => ({
//       update: jasmine.createSpy('update').and.returnValue(Promise.resolve()),
//       delete: jasmine.createSpy('delete').and.returnValue(Promise.resolve()),
//       valueChanges: jasmine.createSpy('valueChanges').and.returnValue(of({})),
//     })),
//   }),
// };


describe('BirthdayService', () => {
  let service: BirthdayService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        // Import FirebaseApp and Firestore using AngularFireModule
        AngularFireModule.initializeApp(environment.firebaseConfig), // Initialize Firebase
      ],
      providers: [
        BirthdayService,
        { provide: AuthenticationService, useValue: mockAuthService },
        { provide: Firestore, useValue: mockFirestore },
         provideFirebaseApp(() => initializeApp(environment.firebaseConfig)), // Provide Firebase app
         provideFirestore(() => getFirestore()), // Provide Firestore
      ],
    });

    service = TestBed.inject(BirthdayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a birthday for the current user', async () => {
    const birthday: Birthday = {
      id: '1',
      fullname: 'John Doe',
      date: new Date(),
      description: 'Friend',
      userId: '', 
    };

    await service.addBirthday(birthday);

    // Vérifie que la collection "birthdayList" a bien été appelée
    expect(mockFirestore.collection).toHaveBeenCalledWith('birthdayList');

    // Vérifie que userId est bien défini lors de l'ajout de l'anniversaire
    expect(mockFirestore.collection().add).toHaveBeenCalledWith({
      ...birthday,
      userId: 'testUserId', // userId doit être ajouté par le service
    });
  });


  // Test deleteBirthday
  it('should delete a birthday by id', async () => {
    const birthdayId = 'testBirthdayId';

    await service.deleteBirthday(birthdayId);

    expect(mockFirestore.collection().doc).toHaveBeenCalledWith(
      'testBirthdayId'
    );
    expect(mockFirestore.collection().doc().delete).toHaveBeenCalled();
  });

  // Test getBirthDates
  it('should get birth dates for a user', () => {
    const userId = 'testUserId';
    service.getBirthDates(userId).subscribe((birthdays) => {
      expect(mockFirestore.collection).toHaveBeenCalledWith('birthdayList');
      expect(mockFirestore.collection().valueChanges).toHaveBeenCalled();
      expect(birthdays).toEqual([]);
    });
  });

  // Test getBirthDayById
  it('should get a birthday by id', () => {
    const birthdayId = 'testBirthdayId';

    service.getBirthDayById(birthdayId).subscribe((birthday) => {
      expect(mockFirestore.collection().doc).toHaveBeenCalledWith(
        `birthdayList/${birthdayId}`
      );
      expect(mockFirestore.collection().doc().valueChanges).toHaveBeenCalled();
    });
  });

  // Test updateBirthDate
  it('should update a birthday', async () => {
    const birthday: Birthday = {
      id: '1',
      fullname: 'John Doe',
      date: new Date(),
      description: 'Friend',
      userId: 'testUserId',
    };

    await service.updateBirthDate(birthday);

    expect(mockFirestore.collection().doc).toHaveBeenCalledWith(`1`);
    expect(mockFirestore.collection().doc().update).toHaveBeenCalledWith({
      fullname: 'John Doe',
      date: birthday.date,
      description: 'Friend',
    });
  });
});
