import { FC, useState } from 'react';
import {
  IconButton,
  TextField,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { WithStyles, withStyles } from '@mui/styles';

type Props = {
  user: User;
  classes: WithStyles<typeof styles>['classes'];
};

const handleEditKeypress = (event, getter, setter) => {
  const validKeys = [
    'Enter',
    ' ',
  ];

  if (validKeys.includes(event.key)) {
    toggleEditability(getter, setter);
  }
};

const toggleEditability = (getter, setter) => {
  setter(!getter);
};

/**
 * User Profile View Component
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const UserProfileView: FC<Props> = ({ user, classes } : Props) => {
  const [canEditFirstName, setCanEditFirstName] = useState(false);
  const [canEditLastName, setCanEditLastName] = useState(false);

  return (
    <>
      {JSON.stringify(user)}
      {user.IDP}
      {user.email}
      <TextField
        id="user-first-name"
        defaultValue={user.firstName}
        InputProps={{
          readOnly: !canEditFirstName,
        }}
        size="small"
      />
      <IconButton
        onClick={() => toggleEditability(canEditFirstName, setCanEditFirstName)}
        onKeyUp={(e) => handleEditKeypress(e, canEditFirstName, setCanEditFirstName)}
      >
        <EditIcon />
      </IconButton>
      <TextField
        id="user-last-name"
        defaultValue={user.lastName}
        InputProps={{
          readOnly: !canEditLastName,
        }}
        size="small"
      />
      <IconButton
        onClick={() => toggleEditability(canEditLastName, setCanEditLastName)}
        onKeyUp={(e) => handleEditKeypress(e, canEditLastName, setCanEditLastName)}
      >
        <EditIcon />
      </IconButton>
      {user.role}
      {user.userStatus}
    </>
  );
};

const styles = () => ({
  header: {
    width: "100%",
    height: "300px",
    background: "#F2F4F8",
  },
  content: {
    width: "100%",
    maxWidth: "980px",
    marginLeft: '41px',
  },
  controls: {
    color: "#FFFFFF",
    marginTop: "15px !important",
    "& button": {
      margin: "0 6px",
      padding: "14px 11px",
      minWidth: "128px",
      fontWeight: 700,
      fontSize: '16px',
      fontFamily: "'Nunito', 'Rubik', sans-serif",
      letterSpacing: "0.32px",
      lineHeight: "20.14px",
      borderRadius: "8px",
      borderColor: "#828282",
      background: "#949494",
      color: "inherit",
      textTransform: "none",
    },
    "& button:disabled": {
      background: "#D9DEE4",
    },
    "& button:hover:not([disabled])": {
      color: "#fff",
      background: "#2A2A2A",
    },
    "& a": {
      color: "inherit",
      textDecoration: "none",
    },
    "& .MuiButton-startIcon": {
      marginRight: "20px",
    },
    "& .MuiButton-endIcon": {
      marginLeft: "20px"
    },
    "& .MuiSvgIcon-root": {
      fontSize: "20px"
    }
  },
  backButton: {
    "&.MuiButton-root": {
      display: "flex",
      justifyContent: "flex-start"
    }
  },
  nextButton: {
    "&.MuiButton-root": {
      display: "flex",
      justifyContent: "flex-end"
    }
  },
  saveButton: {
    "&.MuiButton-root": {
      borderColor: "#26B893",
      background: "#22A584"
    }
  },
  approveButton: {
    "&.MuiButton-root": {
      borderColor: "#26B893",
      background: "#22A584"
    }
  },
  rejectButton: {
    "&.MuiButton-root": {
      borderColor: "#26B893",
      background: "#D54309"
    }
  },
  submitButton: {
    "&.MuiButton-root": {
      display: "flex",
      width: "128px",
      height: "50.593px",
      padding: "11px",
      justifyContent: "center",
      alignItems: "center",
      flexShrink: 0,
      borderRadius: "8px",
      border: "1px solid #828282",
      background: "#0B7F99",
    }
  },
});

export default withStyles(styles)(UserProfileView);
