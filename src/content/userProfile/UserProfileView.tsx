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
      <div className={classes.userField}>
        <span className={classes.userLabel}>Account Type</span>
        {user.IDP.toUpperCase()}
      </div>
      <div className={classes.userField}>
        <span className={classes.userLabel}>Email</span>
        {user.email}
      </div>
      <div className={classes.userField}>
        <span className={classes.userLabel}>First name</span>
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
      </div>
      <div className={classes.userField}>
        <span className={classes.userLabel}>Last name</span>
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
      </div>
      <div className={classes.userField}>
        <span className={classes.userLabel}>Role</span>
        {user.role}
      </div>
      <div className={classes.userField}>
        <span className={classes.userLabel}>Account Status</span>
        {user.userStatus}
      </div>
      <div className={classes.userField}>
        <span className={classes.userLabel}>Organization</span>
        {user.organization}
      </div>
    </>
  );
};

const styles = () => ({
  userField: {
    margin: '0px 0px 31px 0px',
  },
  userLabel: {
    color: '#356AAD',
    fontWeight: '700',
    lineHeight: '19.6px',
    margin: '0px 20px 0px 0px',
    size: '16px',
  },
});

export default withStyles(styles)(UserProfileView);
