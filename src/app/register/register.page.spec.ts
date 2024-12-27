import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonicModule,
  LoadingController,
  ToastController,
  NavController,
} from '@ionic/angular';
import { of, throwError } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';
import { RegisterPage } from './register.page';

describe('RegisterPage', () => {
  let component: RegisterPage;
  let fixture: ComponentFixture<RegisterPage>;
  let mockAuthService: jasmine.SpyObj<AuthenticationService>;
  let mockLoadingCtrl: jasmine.SpyObj<LoadingController>;
  let mockToastController: jasmine.SpyObj<ToastController>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockNavController: jasmine.SpyObj<NavController>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthenticationService', [
      'doRegister',
    ]);
    mockLoadingCtrl = jasmine.createSpyObj('LoadingController', ['create']);
    mockToastController = jasmine.createSpyObj('ToastController', ['create']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockNavController = jasmine.createSpyObj('NavController', [
      'navigateForward',
    ]);

    // Mock the 'create' method of LoadingController
    const mockLoading = jasmine.createSpyObj('HTMLIonLoadingElement', [
      'present',
      'dismiss',
    ]);
    mockLoadingCtrl.create.and.returnValue(Promise.resolve(mockLoading));

    // Mock the 'create' method of ToastController
    mockToastController.create.and.returnValue(
      Promise.resolve({
        present: jasmine.createSpy('present'),
        dismiss: jasmine.createSpy('dismiss'),
      } as any)
    );

    await TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), ReactiveFormsModule],
      declarations: [RegisterPage],
      providers: [
        { provide: AuthenticationService, useValue: mockAuthService },
        { provide: LoadingController, useValue: mockLoadingCtrl },
        { provide: ToastController, useValue: mockToastController },
        { provide: Router, useValue: mockRouter },
        { provide: NavController, useValue: mockNavController },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a valid form when all fields are filled correctly', () => {
    component.signupForm.setValue({
      username: 'testuser',
      email: 'test@example.com',
      password: 'Test@1234',
      acceptTerms:true
    });
    expect(component.signupForm.valid).toBeTrue();
  });

  it('should call signUp method and handle successful registration', async () => {
    mockAuthService.doRegister.and.returnValue(Promise.resolve());
    spyOn(component, 'presentToast').and.callThrough();

    component.signupForm.setValue({
      username: 'testuser',
      email: 'test@example.com',
      password: 'Test@1234',
      acceptTerms: true,
    });

    await component.signUp();

    expect(mockAuthService.doRegister).toHaveBeenCalledWith(
      'test@example.com',
      'Test@1234',
      'testuser',
      
    );
    expect(component.presentToast).toHaveBeenCalledWith(
      'Registration successful'
    );
  });

  it('should call signUp method and handle registration errors', async () => {
    // Arrange
    const error = new Error('Registration failed');
    mockAuthService.doRegister.and.returnValue(Promise.reject(error));
    spyOn(component, 'presentToast').and.callThrough();

    component.signupForm.setValue({
      username: 'testuser',
      email: 'test@example.com',
      password: 'Test@1234',
      acceptTerms: true,
    });

    await component.signUp();

    expect(mockAuthService.doRegister).toHaveBeenCalledWith(
      'test@example.com',
      'Test@1234',
      'testuser'
    );
    expect(component.presentToast).toHaveBeenCalledWith('Registration failed');
  });

  it('should present toast when form is invalid', async () => {
    spyOn(component, 'presentToast');

    component.signupForm.setValue({
      username: '',
      email: 'invalid',
      password: 'short',
      acceptTerms: false,
    });

    await component.signUp();

    expect(component.presentToast).toHaveBeenCalledWith(
      'Please fill in all required fields.'
    );
  });

  it('should show errors when controls are invalid', () => {
    component.ngOnInit();

    component.signupForm.setValue({
      username: '',
      email: 'invalidEmail',
      password: 'short',
      acceptTerms: false
    });

    const controls = component.errorControl;
    expect(controls['username'].errors?.['required']).toBeTrue();
    expect(controls['email'].errors?.['email']).toBeTrue();
    expect(controls['password'].errors?.['minlength']).toBeTruthy();
  });

  it('should not show errors when controls are valid', () => {
    component.ngOnInit();

    component.signupForm.setValue({
      username: 'validUser',
      email: 'test@example.com',
      password: 'ValidPass123',
      acceptTerms: true,
    });

    const controls = component.errorControl;
    expect(controls['username'].errors).toBeNull();
    expect(controls['email'].errors).toBeNull();
    expect(controls['password'].errors).toBeNull();
  });

  it('should display "An error occurred during registration." when no error message is provided', async () => {
    mockAuthService.doRegister.and.returnValue(Promise.reject({}));
    spyOn(component, 'presentToast').and.callThrough();

    component.signupForm.setValue({
      username: 'testuser',
      email: 'test@example.com',
      password: 'Test@1234',
      acceptTerms: true,
    });

    await component.signUp();

    expect(mockAuthService.doRegister).toHaveBeenCalledWith(
      'test@example.com',
      'Test@1234',
      'testuser'
    );

    expect(component.presentToast).toHaveBeenCalledWith(
      'An error occurred during registration.'
    );
  });
});
