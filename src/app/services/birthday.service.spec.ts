 import { TestBed } from '@angular/core/testing';
 import { BirthdayService } from './birthday.service';
import { provideFirebaseApp } from '@angular/fire/app';
import { provideFirestore } from '@angular/fire/firestore';
import { getApp, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { environment } from 'src/environments/environment';
import { getAuth, indexedDBLocalPersistence, initializeAuth, provideAuth } from '@angular/fire/auth';
import { Capacitor } from '@capacitor/core';


describe('BirthdayService', () => {
  let service: BirthdayService;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
        provideFirestore(() => getFirestore()),
        provideAuth(() => getAuth()),
      ],
    });

    service = TestBed.inject(BirthdayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
}
);

