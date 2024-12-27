import { Injectable } from '@angular/core';
import {
  Auth, createUserWithEmailAndPassword, getAuth, onAuthStateChanged,
  sendPasswordResetEmail, signInWithEmailAndPassword, User, UserCredential
} from '@angular/fire/auth';
import { doc, Firestore, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private currentUser: any;
  public _uid = new BehaviorSubject<any>(null);

  constructor(
    private db: Firestore,
    private afAuth: Auth,
    private router: Router
  ) {}

  doRegister(email: string, password: string, username: string): Promise<void> {
    return createUserWithEmailAndPassword(this.afAuth, email, password)
      .then((result) => {
        if (result.user) {
          const additionalUserData = {
            email: email,
            username: username,
          };
          const userDocRef = doc(this.db, `users/${result.user.uid}`); // Crée une référence vers le document utilisateur
          return setDoc(userDocRef, additionalUserData); // Enregistre les données supplémentaires
        } else {
          throw new Error('User registration failed');
        }
      })
      .then(() => {
        this.router.navigate(['/home']); // Redirige après succès
      })
      .catch((error) => {
        console.error('Error registering user:', error);
        throw error;
      });
  }

  async doLogin(email: string, password: string): Promise<any> {
    try {
      console.log(email);
      const response = await signInWithEmailAndPassword(
        this.afAuth,
        email,
        password
      );
      console.log(response);
      if (response?.user) {
        this.setUserData(response.user.uid);
      }
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  // async sendPasswordResetEmail(email: string) {
  //   try {
  //     await this.afAuth.sendPasswordResetEmail(email); // Envoie l'email de réinitialisation
  //     this.showAlert(
  //       'Success',
  //       'A password reset link has been sent to your email.'
  //     );
  //   } catch (error) {
  //     this.showAlert(
  //       'Error',
  //       'Failed to send password reset email. Please try again later.'
  //     );
  //     console.error('Error sending password reset email:', error);
  //   }
  // }

  async doLogout() {
    try {
      await this.afAuth.signOut();
      this._uid.next(null);
      this.currentUser = null;
      return true;
    } catch (e) {
      throw e;
    }
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

  getId() {
    const auth = getAuth();
    console.log('current user auth: ', auth.currentUser);
    this.currentUser = auth.currentUser;
    console.log(this.currentUser);
    return this.currentUser?.uid;
  }

  setUserData(uid: string) {
    this._uid.next(uid);
  }

  async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(this.afAuth, email);
    } catch (e) {
      throw e;
    }
  }

  checkAuth(): Promise<any> {
    return new Promise((resolve, reject) => {
      onAuthStateChanged(this.afAuth, (user) => {
        console.log('auth user: ', user);
        resolve(user);
      });
    });
  }
}
