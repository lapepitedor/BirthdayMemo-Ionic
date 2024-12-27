import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { DetailsPage } from './details.page';
import { BirthdayService } from '../services/birthday.service';
import { of, throwError } from 'rxjs';
import { Birthday } from '../models/birthday';

// Mock services
class MockBirthdayService {
  getBirthDayById() {
    return of({
      fullname: 'John Doe',
      description: 'Sample Description',
      date: new Date(),
    });
  }
  updateBirthDate() {
    return throwError('Update failed');
  }
  deleteBirthday() {
    return of(null);
  }
}

class MockToastController {
  create() {
    return Promise.resolve({ present: () => {} } as any);
  }
}

class MockModalController {
  dismiss() {}
}

describe('LandingPage', () => {
  let component: DetailsPage;
  let fixture: ComponentFixture<DetailsPage>;
  let birthdayService: BirthdayService;
  let toastctrl: ToastController;
  let modalctrl: ModalController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IonicModule.forRoot()],
      declarations: [DetailsPage],
      providers: [
        { provide: BirthdayService, useClass: MockBirthdayService },
        { provide: ToastController, useClass: MockToastController },
        { provide: ModalController, useClass: MockModalController },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsPage);
    component = fixture.componentInstance;
    birthdayService = TestBed.inject(BirthdayService);
    toastctrl = TestBed.inject(ToastController);
    modalctrl = TestBed.inject(ModalController);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with birthday data', () => {
    expect(component.birthday).toBeTruthy();
    expect(component.originalBirthday).toEqual(component.birthday);
  });

  it('should set isModified to true if birthday data has changes', () => {
    component.birthday = {
      fullname: 'Jane Doe',
      description: 'Updated Description',
      date: new Date(),
    };
    component.isModified = false;
    component.onInputChange();

    expect(component.isModified).toBeTrue();
  });

  it('should correctly identify if there are changes', () => {
    component.birthday = {
      fullname: 'Jane Doe',
      description: 'Updated Description',
      date: new Date(),
    };
    component.originalBirthday = {
      fullname: 'John Doe',
      description: 'Sample Description',
      date: new Date('2000-01-01'),
    };

    expect(component.hasChanges()).toBeTrue();
  });
  it('should call updateBirthDate and show toast on successful update', async () => {
    spyOn(birthdayService, 'updateBirthDate').and.callThrough();
    spyOn(toastctrl, 'create').and.returnValue(
      Promise.resolve({ present: () => {} } as any)
    );
    spyOn(modalctrl, 'dismiss').and.callThrough();

    component.birthday = {
      fullname: 'Jane Doe',
      description: 'Updated Description',
      date: new Date(),
    };
    component.isModified = true;
    await component.updateBirthdate();

    expect(birthdayService.updateBirthDate).toHaveBeenCalledWith(
      component.birthday
    );
    expect(toastctrl.create).toHaveBeenCalled();
    expect(modalctrl.dismiss).toHaveBeenCalled();
  });

  it('should not call updateBirthDate if not modified', async () => {
    spyOn(birthdayService, 'updateBirthDate').and.callThrough();
    spyOn(toastctrl, 'create').and.callThrough();
    spyOn(modalctrl, 'dismiss').and.callThrough();

    component.isModified = false;

    await component.updateBirthdate();

    expect(birthdayService.updateBirthDate).not.toHaveBeenCalled();
    expect(toastctrl.create).not.toHaveBeenCalled();
    expect(modalctrl.dismiss).not.toHaveBeenCalled();
  });

  it('should call deleteBirthday and show toast on successful deletion', async () => {
    spyOn(birthdayService, 'deleteBirthday').and.callThrough();
    spyOn(toastctrl, 'create').and.returnValue(
      Promise.resolve({ present: () => {} } as any)
    );
    spyOn(modalctrl, 'dismiss').and.callThrough();

    await component.deleteBirthdate('test-id');

    expect(birthdayService.deleteBirthday).toHaveBeenCalledWith('test-id');
    expect(toastctrl.create).toHaveBeenCalled();
    expect(modalctrl.dismiss).toHaveBeenCalled();
  });

  it('should call dismiss on cancelUpdate', () => {
    spyOn(modalctrl, 'dismiss').and.callThrough();
    component.cancelUpdate();
    expect(modalctrl.dismiss).toHaveBeenCalled();
  });
  it('should call deleteBirthday and show toast on successful deletion', async () => {
    spyOn(birthdayService, 'deleteBirthday').and.callThrough();
    spyOn(toastctrl, 'create').and.returnValue(
      Promise.resolve({ present: () => {} } as any)
    );
    spyOn(modalctrl, 'dismiss').and.callThrough();

    await component.deleteBirthdate('test-id');

    expect(birthdayService.deleteBirthday).toHaveBeenCalledWith('test-id');
    expect(toastctrl.create).toHaveBeenCalledWith({
      message: 'Birthday deleted!',
      duration: 2500,
    });
    expect(modalctrl.dismiss).toHaveBeenCalled();
  });

  it('should return true if there are changes in fullname', () => {
    component.birthday = {
      fullname: 'Jane Doe',
      description: 'Sample Description',
      date: new Date('2000-01-01'),
    };
    component.originalBirthday = {
      fullname: 'John Doe',
      description: 'Sample Description',
      date: new Date('2000-01-01'),
    };

    expect(component.hasChanges()).toBeTrue();
  });

  it('should return true if there are changes in description', () => {
    component.birthday = {
      fullname: 'John Doe',
      description: 'Updated Description',
      date: new Date('2000-01-01'),
    };
    component.originalBirthday = {
      fullname: 'John Doe',
      description: 'Sample Description',
      date: new Date('2000-01-01'),
    };

    expect(component.hasChanges()).toBeTrue();
  });
  it('should return true if there are changes in date', () => {
    component.birthday = {
      fullname: 'John Doe',
      description: 'Sample Description',
      date: new Date('2024-01-01'),
    };
    component.originalBirthday = {
      fullname: 'John Doe',
      description: 'Sample Description',
      date: new Date('2000-01-01'),
    };

    expect(component.hasChanges()).toBeTrue();
  });

  it('should return true if there are changes in any property', () => {
    component.birthday = {
      fullname: 'Jane Doe',
      description: 'Updated Description',
      date: new Date('2024-01-01'),
    };
    component.originalBirthday = {
      fullname: 'John Doe',
      description: 'Sample Description',
      date: new Date('2000-01-01'),
    };

    expect(component.hasChanges()).toBeTrue();
  });
});
