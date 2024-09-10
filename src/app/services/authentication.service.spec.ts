import { TestBed } from '@angular/core/testing';

import { AuthenticationService } from './authentication.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { User, UserCredential } from '@angular/fire/auth';

// Mocks
const mockAngularFireAuth = {
  createUserWithEmailAndPassword: jasmine.createSpy(
    'createUserWithEmailAndPassword'
  ),
  signInWithEmailAndPassword: jasmine.createSpy('signInWithEmailAndPassword'),
  signOut: jasmine.createSpy('signOut'),
  onAuthStateChanged: jasmine
    .createSpy('onAuthStateChanged')
    .and.callFake((callback) => callback(null)),
};

const mockAngularFirestore = {
  collection: jasmine.createSpy('collection').and.returnValue({
    doc: jasmine.createSpy('doc').and.returnValue({
      set: jasmine.createSpy('set').and.returnValue(Promise.resolve()),
    }),
  }),
};

const mockRouter = {
  navigate: jasmine.createSpy('navigate'),
};

describe('AuthenticationService', () => {
  let service: AuthenticationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthenticationService,
        { provide: AngularFireAuth, useValue: mockAngularFireAuth },
        { provide: AngularFirestore, useValue: mockAngularFirestore },
        { provide: Router, useValue: mockRouter },
      ],
    });

    service = TestBed.inject(AuthenticationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Test for doRegister method
  it('should register a user and store additional data', async () => {
    const mockUserCredential: Partial<UserCredential> = {
      user: { uid: '123', email: 'test@test.com' } as any,
    };
    mockAngularFireAuth.createUserWithEmailAndPassword.and.returnValue(
      Promise.resolve(mockUserCredential)
    );

    const email = 'test@test.com';
    const password = '123456';
    const username = 'testuser';

    await service.doRegister(email, password, username);

    expect(
      mockAngularFireAuth.createUserWithEmailAndPassword
    ).toHaveBeenCalledWith(email, password);
    expect(mockAngularFirestore.collection).toHaveBeenCalledWith('users');
    expect(mockAngularFirestore.collection('users').doc).toHaveBeenCalledWith(
      '123'
    );
    expect(
      mockAngularFirestore.collection('users').doc('123').set
    ).toHaveBeenCalledWith({
      email: email,
      username: username,
    });
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
  });

  // Test for doLogin method
  it('should log in a user', async () => {
    const email = 'test@test.com';
    const password = '123456';

    mockAngularFireAuth.signInWithEmailAndPassword.and.returnValue(
      Promise.resolve()
    );

    await service.doLogin(email, password);

    expect(mockAngularFireAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(
      email,
      password
    );
  });

  // Test for doLogout method
  it('should log out a user', async () => {
    mockAngularFireAuth.signOut.and.returnValue(Promise.resolve());

    await service.doLogout();

    expect(mockAngularFireAuth.signOut).toHaveBeenCalled();
  });

  // Test for getCurrentUser method
  it('should return the current user if logged in', async () => {
    const mockUser = { uid: '123', email: 'test@test.com' } as any;

    mockAngularFireAuth.onAuthStateChanged.and.callFake((callback) =>
      callback(mockUser)
    );

    const user = await service.getCurrentUser();

    expect(user).toEqual(mockUser);
  });

  it('should reject if no user is logged in', async () => {
    mockAngularFireAuth.onAuthStateChanged.and.callFake((callback) =>
      callback(null)
    );

    try {
      await service.getCurrentUser();
      fail('Expected getCurrentUser to throw an error');
    } catch (error) {
      expect(error).toEqual('No user logged in');
    }
  });
});

// Explanation of the Test:
// Mocking Dependencies:

// AngularFireAuth: Mocked methods like createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, and onAuthStateChanged.
// AngularFirestore: Mocked the collection and document functionality.
// Router: Mocked the navigate method to prevent actual route navigation.
// Testing doRegister:

// This test verifies that the service calls the Firebase Auth createUserWithEmailAndPassword method, stores additional user data in Firestore, and then navigates to /home upon successful registration.
// Testing doLogin:

// Ensures that the service calls Firebase Auth's signInWithEmailAndPassword with the correct credentials.
// Testing doLogout:

// Checks that the service properly calls Firebase Auth's signOut method.
// Testing getCurrentUser:

// The test mocks onAuthStateChanged to return a user if one is logged in, and throws an error if no user is logged in.
// Tools Used:
// jasmine.createSpy: Used to mock methods and keep track of calls.
// of: To create mock observables if needed.
// TestBed: To set up the testing environment in Angular, inject the necessary services, and mock dependencies.
// This setup ensures that the AuthenticationService works as expected in different scenarios.

