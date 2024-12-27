 import { TestBed } from '@angular/core/testing';
 import { BirthdayService } from './birthday.service';
import { provideFirebaseApp } from '@angular/fire/app';
import { provideFirestore } from '@angular/fire/firestore';
import { getApp, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { environment } from 'src/environments/environment';
import { getAuth, indexedDBLocalPersistence, initializeAuth, provideAuth } from '@angular/fire/auth';
import { Capacitor } from '@capacitor/core';


// describe('BirthdayService', () => {
//   let service: BirthdayService;
  
//    beforeEach(() => {
//      TestBed.configureTestingModule({
//        providers: [
//          provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
//          provideFirestore(() => getFirestore()),
//        ],
//      });

//      service = TestBed.inject(BirthdayService);
//    });

//   it('should be created', () => {
//     expect(service).toBeTruthy();
//   });

describe('BirthdayService', () => {
  let service: BirthdayService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        // Import FirebaseApp and Firestore using AngularFireModule
        AngularFireModule.initializeApp(environment.firebaseConfig), // Initialize Firebase
      ],
      providers: [
        provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
        provideFirestore(() => getFirestore()),
        provideAuth(() => {
          if (Capacitor.isNativePlatform()) {
            return initializeAuth(getApp(), {
              persistence: indexedDBLocalPersistence,
            });
          } else {
            return getAuth();
          }
        }),
      ],
    });
    service = TestBed.inject(BirthdayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

