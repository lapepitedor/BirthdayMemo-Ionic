import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AlertController, IonicModule, ModalController } from '@ionic/angular';

import { HomePage } from './home.page';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { BirthdayService } from '../services/birthday.service';
import { of } from 'rxjs';
import { LandingPage } from '../landing/landing.page';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

    let authServiceMock: any;
    let birthdayServiceMock: any;
    let modalCtrlMock: any;
    let alertCtrlMock: any;
    let routerMock: any;

  beforeEach(async () => {
    authServiceMock = jasmine.createSpyObj('AuthenticationService', [
      'getCurrentUser',
    ]);
    
    authServiceMock.getCurrentUser.and.returnValue(
      Promise.resolve({ uid: 'user123' })
    );

    birthdayServiceMock = jasmine.createSpyObj('BirthdayService', [
      'getBirthDates',
      'addBirthday',
    ]);
    modalCtrlMock = jasmine.createSpyObj('ModalController', ['create']);
    alertCtrlMock = jasmine.createSpyObj('AlertController', ['create']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [HomePage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: AuthenticationService, useValue: authServiceMock },
        { provide: BirthdayService, useValue: birthdayServiceMock },
        { provide: ModalController, useValue: modalCtrlMock },
        { provide: AlertController, useValue: alertCtrlMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    // Setup the mock for getBirthDates to return an observable with test data
    birthdayServiceMock.getBirthDates.and.returnValue(
      of([
        {
          id: '1',
          fullname: 'John Doe',
          date: new Date(),
          description: 'Gift ideas',
        },
        {
          id: '2',
          fullname: 'Jane Doe',
          date: new Date(),
          description: 'Another idea',
        },
      ])
    );

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch and sort birthdays on init', waitForAsync(() => {
    spyOn(component, 'calculateDaysLeft').and.returnValue(5);

    fixture.whenStable().then(() => {
      expect(component.userId).toBe('user123');
      expect(birthdayServiceMock.getBirthDates).toHaveBeenCalledWith('user123');
      expect(component.birthdate.length).toBe(2);
      expect(component.birthdate[0].daysLeft).toBe(0);
    });
  }));

  it('should calculate the days left for a birthday correctly', () => {
    const today = new Date();
    const birthdayDate = new Date(today);
    birthdayDate.setDate(today.getDate() + 10); // 10 days from now

    const daysLeft = component.calculateDaysLeft(birthdayDate);
    expect(daysLeft).toBe(10);
  });

  it('should open birthday modal', waitForAsync(() => {
    const birthday = {
      id: '1',
      fullname: 'Test',
      date: new Date('2023-01-01'),
      description: 'Test desc',
    };

    modalCtrlMock.create.and.returnValue(
      Promise.resolve({ present: () => Promise.resolve() })
    );

    component.openBirthday(birthday);

    fixture.whenStable().then(() => {
      expect(modalCtrlMock.create).toHaveBeenCalledWith({
        component: LandingPage,
        componentProps: { id: '1' },
        breakpoints: [0, 0.5, 0.8],
        initialBreakpoint: 0.5,
      });
    });
  }));

  it('should show add birthday alert and save new birthday', waitForAsync(() => {
    const alertSpy = jasmine.createSpyObj('alert', ['present']);
    alertCtrlMock.create.and.returnValue(Promise.resolve(alertSpy));

    component.addBirthdate();

    fixture.whenStable().then(() => {
      expect(alertCtrlMock.create).toHaveBeenCalled();
      expect(alertSpy.present).toHaveBeenCalled();
    });
  }));

  it('should log out and navigate to login page', () => {
    component.logout();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);

  });

 });
