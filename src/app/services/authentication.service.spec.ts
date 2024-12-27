import { TestBed } from '@angular/core/testing';
import { AuthenticationService } from './authentication.service';
import { Router } from '@angular/router';
import { getAuth, indexedDBLocalPersistence, initializeAuth, provideAuth, User, UserCredential } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideFirebaseApp } from '@angular/fire/app';
import { getApp, initializeApp } from 'firebase/app';
import { environment } from 'src/environments/environment';
import { Capacitor } from '@capacitor/core';
const mockRouter = {
  navigate: jasmine.createSpy('navigate'),
};

describe('AuthenticationService', () => {
  let service: AuthenticationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
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

    service = TestBed.inject(AuthenticationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
   
});



