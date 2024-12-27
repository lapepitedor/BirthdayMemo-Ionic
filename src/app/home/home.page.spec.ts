import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {
  AlertController,
  IonicModule,
  ModalController,
  ToastController,
} from '@ionic/angular';
import { HomePage } from './home.page';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { BirthdayService } from '../services/birthday.service';
import { of } from 'rxjs';
import { DetailsPage } from '../details-page/details.page';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  const authServiceMock = jasmine.createSpyObj('AuthenticationService', [
    'getCurrentUser',
  ]);
  const birthdayServiceMock = jasmine.createSpyObj('BirthdayService', [
    'getBirthDates',
    'addBirthday',
  ]);
  const modalCtrlMock = jasmine.createSpyObj('ModalController', ['create']);
  const alertCtrlMock = jasmine.createSpyObj('AlertController', ['create']);
  const toastCtrlMock = jasmine.createSpyObj('ToastController', ['create']);
  const routerMock = jasmine.createSpyObj('Router', ['navigate']);

  beforeEach(async () => {
    authServiceMock.getCurrentUser.and.returnValue(
      Promise.resolve({ uid: 'user123' })
    );

    birthdayServiceMock.getBirthDates.and.returnValue(
      of([
        {
          id: '1',
          fullname: 'John Doe',
          date: new Date(),
          description: 'Gift idea 1',
        },
        {
          id: '2',
          fullname: 'Jane Doe',
          date: new Date(),
          description: 'Gift idea 2',
        },
      ])
    );

    await TestBed.configureTestingModule({
      declarations: [HomePage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: AuthenticationService, useValue: authServiceMock },
        { provide: BirthdayService, useValue: birthdayServiceMock },
        { provide: ModalController, useValue: modalCtrlMock },
        { provide: AlertController, useValue: alertCtrlMock },
        { provide: ToastController, useValue: toastCtrlMock },
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

  it('should create the component', () => {
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

  it('should calculate days left for a birthday correctly', () => {
    const today = new Date();
    const birthdayDate = new Date(today);
    birthdayDate.setDate(today.getDate() + 10); // 10 days from now

    const daysLeft = component.calculateDaysLeft(birthdayDate); // Pass Date object
    expect(daysLeft).toBe(10);
  });

  it('should open a birthday modal', waitForAsync(() => {
    const birthday = {
      id: '1',
      fullname: 'Test',
      date: new Date(),
      description: 'Test desc',
    };
    modalCtrlMock.create.and.returnValue(
      Promise.resolve({ present: () => Promise.resolve() })
    );

    component.openBirthday(birthday);

    fixture.whenStable().then(() => {
      expect(modalCtrlMock.create).toHaveBeenCalledWith({
        component: DetailsPage,
        componentProps: { id: '1' },
        breakpoints: [0, 0.5, 0.8],
        initialBreakpoint: 0.5,
      });
    });
  }));

  it('should display an alert for adding a birthday and call the service on save', waitForAsync(() => {
    const alertSpy = jasmine.createSpyObj('alert', ['present']);
    alertCtrlMock.create.and.returnValue(Promise.resolve(alertSpy));

    component.addBirthdate();

    fixture.whenStable().then(() => {
      expect(alertCtrlMock.create).toHaveBeenCalled();
      expect(alertSpy.present).toHaveBeenCalled();
    });
  }));

 it('should display an error toast if required fields are missing in addBirthdate', waitForAsync(async () => {
   const alertSpy = jasmine.createSpyObj('alert', ['present']);
   alertCtrlMock.create.and.returnValue(Promise.resolve(alertSpy));

   toastCtrlMock.create.and.returnValue(
     Promise.resolve({ present: jasmine.createSpy('present') })
   );

   await component.addBirthdate();

   fixture.whenStable().then(async () => {
     // Simuler la validation échouée dans le gestionnaire de l'alerte
     const alertHandler =
       alertCtrlMock.create.calls.mostRecent().args[0].buttons[1].handler;

     const mockData = { fullname: '', date: '' }; // Champs vides
     const result = await alertHandler(mockData);

     expect(result).toBe(false); // La validation échoue et empêche la fermeture
     expect(toastCtrlMock.create).toHaveBeenCalledWith({
       message: 'Please fill out both the Full Name and Date fields.',
       duration: 3000,
       color: 'danger',
       position: 'top',
     });
   });
 }));

  
  it('should call ToastController.create with correct parameters in presentErrorToast', async () => {
    toastCtrlMock.create.and.returnValue(
      Promise.resolve({ present: () => Promise.resolve() })
    );

    await component.presentErrorToast('Error message');

    expect(toastCtrlMock.create).toHaveBeenCalledWith({
      message: 'Error message',
      duration: 3000,
      color: 'danger',
      position: 'top',
    });
  });


  it('should log out and navigate to the login page', () => {
    component.logout();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });
});
