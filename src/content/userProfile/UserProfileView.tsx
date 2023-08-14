import React, { FC, useState } from 'react';
import {
  Button,
  IconButton,
  TextField,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { WithStyles, withStyles } from '@mui/styles';
import bannerSvg from '../../assets/banner/list_banner.svg';
import PageBanner from '../../components/PageBanner';
import { query as UPDATE_USER, Response as UpdateMyUserResp } from '../../graphql/updateMyUser';

type Props = {
  user: User;
  classes: WithStyles<typeof styles>['classes'];
};

const handleCancel = (setEditability) => {
  setEditability(false);
};

const handleEditKeypress = (event, getter, setter, ref) => {
  const validKeys = [
    'Enter',
    ' ',
  ];

  if (validKeys.includes(event.key)) {
    toggleEditability(getter, setter, ref);
  }
};

const toggleEditability = (getter, setter, ref) => {
  setter(!getter);

  if (!getter) {
    ref.current.focus();
  }
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
  const firstNameRef = React.createRef<HTMLInputElement>();
  const lastNameRef = React.createRef<HTMLInputElement>();

  const handleSave = () => {
    const newFirstName = firstNameRef.current.value;
    const newLastName = lastNameRef.current.value;
  };

  return (
    <>
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
          inputRef={firstNameRef}
          size="small"
        />
        <IconButton
          onClick={() => toggleEditability(canEditFirstName, setCanEditFirstName, firstNameRef)}
          onKeyUp={(e) => handleEditKeypress(e, canEditFirstName, setCanEditFirstName, firstNameRef)}
        >
          <EditIcon />
        </IconButton>
        <Button className={classes.userAction} onClick={() => handleSave()} variant="outlined">
          Save
        </Button>
        <Button className={classes.userAction} onClick={() => handleCancel(setCanEditFirstName)} variant="outlined">
          Cancel
        </Button>
      </div>
      <div className={classes.userField}>
        <span className={classes.userLabel}>Last name</span>
        <TextField
          id="user-last-name"
          defaultValue={user.lastName}
          InputProps={{
            readOnly: !canEditLastName,
          }}
          inputRef={lastNameRef}
          size="small"
        />
        <IconButton
          onClick={() => toggleEditability(canEditLastName, setCanEditLastName, lastNameRef)}
          onKeyUp={(e) => handleEditKeypress(e, canEditLastName, setCanEditLastName, lastNameRef)}
        >
          <EditIcon />
        </IconButton>
        <Button className={classes.userAction} onClick={() => handleSave()} variant="outlined">
          Save
        </Button>
        <Button className={classes.userAction} onClick={() => handleCancel(setCanEditFirstName)} variant="outlined">
          Cancel
        </Button>
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
  banner: {
    height: '146px',
  },
  userAction: {
    height: '51px',
    margin: '0px 10px',
    width: '101px',
  },
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
