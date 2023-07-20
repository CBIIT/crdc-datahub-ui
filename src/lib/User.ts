/**
 * Models a user
 *
 * @typedef User
 * @prop {string} email Email address
 * @prop {string} firstName First name
 * @prop {string} IDP Identity provider
 * @prop {string} lastName Last name
 * @prop {string} role User's role
 * @prop {string} userStatus User's status
 * @
 */
class User {
  private _email: string;

  private _firstName: string;

  private _IDP: string;

  private _lastName: string;

  private _role: string;

  private _userStatus: string;

  constructor(userData) {
    this._email = userData.email ?? '';
    this._firstName = userData.firstName ?? '';
    this._IDP = userData.IDP ?? '';
    this._lastName = userData.lastName ?? '';
    this._role = userData.role ?? '';
    this._userStatus = userData.userStatus ?? '';
  }

  /**
   * @returns {string}
   */
  get email() {
    return this._email;
  }

  /**
   * @returns {string}
   */
  get firstName() {
    return this._firstName;
  }

  /**
   * @returns {string}
   */
  get IDP() {
    return this._IDP;
  }

  /**
   * @returns {string}
   */
  get lastName() {
    return this._lastName;
  }

  /**
   * @returns {string}
   */
  get role() {
    return this._role;
  }

  /**
   * @returns {string}
   */
  get userStatus() {
    return this._userStatus;
  }

  /** First name if IDP is NIH; otherwise, email address
   *
   * @returns {string}
   */
  get displayName() {
    if (this._IDP === 'nih') {
      return this._firstName;
    }

    return this._email;
  }

  /**
   * First and last name
   *
   * @returns {string}
   */
  get name() {
    if (this._IDP === 'nih') {
      return `${this._firstName} ${this._lastName}`;
    }

    return this._email;
  }
}

export default User;
