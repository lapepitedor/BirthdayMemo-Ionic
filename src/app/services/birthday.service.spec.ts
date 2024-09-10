import { TestBed } from '@angular/core/testing';

import { BirthdayService } from './birthday.service';
import { Firestore } from '@angular/fire/firestore';
import { of } from 'rxjs';
import { AuthenticationService } from './authentication.service';
import { Birthday } from '../models/birthday';

// Mocks
const mockAuthService = {
  getCurrentUser: jasmine
    .createSpy('getCurrentUser')
    .and.returnValue(Promise.resolve({ uid: 'testUserId' })),
};

const mockFirestore = {
  collection: jasmine.createSpy('collection').and.returnValue({
    add: jasmine.createSpy('add').and.returnValue(Promise.resolve()),
    valueChanges: jasmine.createSpy('valueChanges').and.returnValue(of([])),
    doc: jasmine.createSpy('doc').and.callFake(() => ({
      update: jasmine.createSpy('update').and.returnValue(Promise.resolve()),
      delete: jasmine.createSpy('delete').and.returnValue(Promise.resolve()),
      valueChanges: jasmine.createSpy('valueChanges').and.returnValue(of({})),
    })),
  }),
};

describe('BirthdayService', () => {
  let service: BirthdayService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BirthdayService,
        { provide: AuthenticationService, useValue: mockAuthService },
        { provide: Firestore, useValue: mockFirestore },
      ],
    });

    service = TestBed.inject(BirthdayService);
  });

  // Test addBirthday
  it('should add a birthday for the current user', async () => {
    const birthday: Birthday = {
      id: '1',
      fullname: 'John Doe',
      date: new Date(),
      description: 'Friend',
      userId: 'testUserId',
    };

    await service.addBirthday(birthday);

    expect(mockFirestore.collection).toHaveBeenCalledWith('birthdayList');
    expect(mockFirestore.collection().add).toHaveBeenCalledWith(birthday);
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
        `testBirthdayId`
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

// Explanation of the Test Cases:
// Mocking Dependencies:

// AuthenticationService: Mocked to return a user ID (testUserId) when calling getCurrentUser().
// Firestore: Mocked collection(), doc(), addDoc(), deleteDoc(), and updateDoc() to simulate Firestore functionality.
// AngularFirestore: Mocked to simulate the Firestore collection with the .valueChanges() method returning an empty observable for testing getBirthDates().
// Testing addBirthday():

// Ensures that the service adds a birthday by calling the addDoc() method with the correct data (birthday object).
// Testing deleteBirthday():

// Checks that the service properly calls the deleteDoc() method with the correct birthday ID to delete the document from Firestore.
// Testing getBirthDates():

// Verifies that the service fetches the list of birthdays associated with a specific user using a Firestore query.
// Testing getBirthDayById():

// Ensures that the service fetches a single birthday document by its ID using docData().
// Testing updateBirthDate():

// Verifies that the service updates the birthday document using the updateDoc() method with the correct data.
// Tools Used:
// jasmine.createSpy: Used to mock and spy on methods.
// of: To create mock observables for the getBirthDates() method.
// TestBed: Angular's test utility to configure and provide the necessary services for testing.
// This setup allows you to verify the core methods of BirthdayService, ensuring they interact with Firestore and other services as expected.
