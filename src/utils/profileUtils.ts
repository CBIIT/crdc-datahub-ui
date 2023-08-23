export const formatIDP = (idp: User["IDP"]) => {
  switch (idp.toLowerCase()) {
    case "nih":
      return "NIH";
    case "login.gov":
      return "Login.gov";
    default:
      return idp;
  }
};
