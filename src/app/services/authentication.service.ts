import { Injectable } from '@angular/core';
import { User } from '@angular/fire/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private currentUser!: User;
  private userId!: string;

  constructor(
    public afAuth: AngularFireAuth,
    private db: AngularFirestore,
    private router: Router
  ) {}

  // doRegister(
  //   username: string,
  //   email: string,
  //   password: string
  // ): Promise<boolean> {
  //   return this.afAuth
  //     .createUserWithEmailAndPassword(email, password)
  //     .then((result) => {
  //       const additionalUserData = {
  //         username: username,
  //         email: email,
  //       };
  //       if (result.user) {
  //         return this.db
  //           .collection('users')
  //           .doc(result.user.uid)
  //           .set(additionalUserData);
  //       } else {
  //         throw new Error('User registration failed');
  //       }
  //     })
  //     .then(() => {
  //       this.router.navigate(['/home']);
  //     })
  //     .catch((error) => {
  //       console.error('Error registering user:', error);
  //       throw error;
  //     });
  // }

  async register(
    email: string,
    password: string,
    username: string
  ): Promise<boolean> {
    try {
      debugger;

      const result = await this.afAuth.createUserWithEmailAndPassword(
        email,
        password
      );

      if (result.user) {
        const additionalUserData = {
          name: username,
          email: email,
        };

        await this.db
          .collection('users')
          .doc(result.user.uid)
          .set(additionalUserData);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error registering user:', error);

      return false;
    }
  }

  async DoRegister(email: string, password: string) {
    return await this.afAuth.createUserWithEmailAndPassword(email, password);
  }

  async doLogin(email: string, password: string) {
    return await this.afAuth.signInWithEmailAndPassword(email, password);
  }

  async doLogout() {
    return await this.afAuth.signOut();
  }

 
 async getCurrentUser(): Promise<User> {
    return new Promise<any>((resolve, reject) => {
      this.afAuth.onAuthStateChanged( (user) => {
        if (user) {
          resolve(user);
        } else {
          reject('No user logged in');
        }
      });
    });
  }

  setUser(data: User) {
    this.currentUser = data;
  }

  getUser(): User | null {
    return this.currentUser;
  }

  setUserId(key: string) {
    this.userId = key;
  }

  getUserId(): string {
    return this.userId;
  }
}
