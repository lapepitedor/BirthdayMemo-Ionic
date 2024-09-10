import { Injectable } from '@angular/core';
import { User, UserCredential } from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private currentUser!: User;

  constructor(
    public afAuth: AngularFireAuth,
    private db: AngularFirestore,
    private router: Router
  ) {}

  doRegister(email: string, password: string, username: string): Promise<void> {
    return this.afAuth
      .createUserWithEmailAndPassword(email, password)
      .then((result) => {
        const additionalUserData = {
          email: email,
          username: username,
        };
        if (result.user) {
          return this.db
            .collection('users')
            .doc(result.user.uid)
            .set(additionalUserData);
        } else {
          throw new Error('User registration failed');
        }
      })
      .then(() => {
        this.router.navigate(['/home']);
      })
      .catch((error) => {
        console.error('Error registering user:', error);
        throw error;
      });
  }

  async doLogin(email: string, password: string) {
    return await this.afAuth.signInWithEmailAndPassword(email, password);
  }

  async doLogout() {
    return await this.afAuth.signOut();
  }

  async getCurrentUser(): Promise<User> {
    return new Promise<any>((resolve, reject) => {
      this.afAuth.onAuthStateChanged((user) => {
        if (user) {
          resolve(user);
        } else {
          reject('No user logged in');
        }
      });
    });
  }

}
