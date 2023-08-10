type User = {
  _id: string;
  firstName: string;
  lastName: string;
  userStatus: 'Active' | 'Inactive' | 'Disabled';
  role: 'Admin' | 'User' | 'Curator' | 'FederalLead' | 'DC_POC';
  organization: OrgInfo;
  IDP: 'nih' | 'login.gov';
  email: string;
  createdAt: string; // YYYY-MM-DDTHH:mm:ssZ
  updateAt: string; // YYYY-MM-DDTHH:mm:ssZ
};

type UserInput = {
  firstName: string;
  lastName: string;
};
