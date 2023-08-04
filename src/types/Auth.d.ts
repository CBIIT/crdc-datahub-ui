type User = {
  _id: string;
  firstName: string;
  lastName: string;
  userStatus: 'Active' | 'Inactive' | 'Disabled';
  role: 'Admin' | 'User' | 'Curator' | 'FederalLead' | 'DC_POC';
  IDP: 'nih' | 'login.gov';
  email: string;
  organization: string;
  createdAt: string; // YYYY-MM-DDTHH:mm:ss.sssZ
  updateAt: string; // YYYY-MM-DDTHH:mm:ss.sssZ
};

type UserInput = {
  firstName: string;
  lastName: string;
};
