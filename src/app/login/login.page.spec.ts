import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginPage } from './login.page';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, LoadingController, ToastController, NavController } from '@ionic/angular';
import { AuthenticationService } from '../services/authentication.service';

// Mock classes
class AuthenticationServiceMock {
  doLogin(email: string, password: string) {
    return Promise.resolve(true);
  }
}

class LoadingControllerMock {
  create() {
    return Promise.resolve({
      present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
      dismiss: jasmine.createSpy('dismiss').and.returnValue(Promise.resolve()),
    } as any);
  }
}

class ToastControllerMock {
  create({ message }: { message: string }) {
    return {
      present: () => Promise.resolve(),
    } as any;
  }
}

class RouterMock {
  navigate(path: string[]) {}
}

class NavControllerMock {
  navigateForward() {}
}

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let authService: AuthenticationServiceMock;
  let loadingCtrl: LoadingControllerMock;
  let toastController: ToastControllerMock;
  let router: RouterMock;
  let navCtrl: NavControllerMock;

  beforeEach(async () => {
await TestBed.configureTestingModule({
  imports: [ReactiveFormsModule, IonicModule.forRoot()],
  declarations: [LoginPage],
  providers: [
    { provide: AuthenticationService, useClass: AuthenticationServiceMock },
    { provide: LoadingController, useClass: LoadingControllerMock },
    { provide: ToastController, useClass: ToastControllerMock },
    { provide: Router, useClass: RouterMock },
    { provide: NavController, useClass: NavControllerMock },
    FormBuilder,
  ],
}).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthenticationService) as any;
    loadingCtrl = TestBed.inject(LoadingController) as any;
    toastController = TestBed.inject(ToastController) as any;
    router = TestBed.inject(Router) as any;
    navCtrl = TestBed.inject(NavController) as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call login method with valid form', async () => {
    const loginSpy = spyOn(authService, 'doLogin').and.returnValue(
      Promise.resolve(true)
    );
    const navigateSpy = spyOn(router, 'navigate');

    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'password123',
    });

    await component.login();

    expect(loginSpy).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(navigateSpy).toHaveBeenCalledWith(['/home']);
  });

  it('should handle login error', async () => {
    const loginSpy = spyOn(authService, 'doLogin').and.returnValue(
      Promise.reject('Error')
    );

    const toastSpy = spyOn(toastController, 'create').and.callFake(
      ({ message }) => {
        expect(message).toBe('Email or Password is wrong.');
        return { present: () => Promise.resolve() } as any;
      }
    );

    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'password123',
    });

    await component.login();

    expect(loginSpy).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(toastSpy).toHaveBeenCalled();
  });

  it('should show toast for invalid form', async () => {
    const toastSpy = spyOn(toastController, 'create').and.callFake(
      ({ message }) => {
        expect(message).toBe('Please fill in the form correctly.');
        return { present: () => Promise.resolve() } as any;
      }
    );

    component.loginForm.setValue({ email: '', password: '' });
    await component.login();

    expect(toastSpy).toHaveBeenCalled();
  });

  it('should return form controls from errorControl getter', () => {
    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'password123',
    });

    const controls = component.errorControl;

    expect(controls).toBeTruthy();
    expect(controls['email']).toBeTruthy();
    expect(controls['password']).toBeTruthy();

    expect(controls['email'].valid).toBeTrue();

    expect(controls['password'].valid).toBeTrue();
  });

  it('should return invalid status for empty email and password', () => {
    component.loginForm.setValue({
      email: '',
      password: '',
    });

    const controls = component.errorControl;

    expect(controls['email'].invalid).toBeTrue();
    expect(controls['password'].invalid).toBeTrue();

    expect(controls['email'].errors?.['required']).toBeTrue();
    expect(controls['password'].errors?.['required']).toBeTrue();
  });
});
