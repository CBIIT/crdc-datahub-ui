import { useQuery } from "@apollo/client";
import { ArrowDropDown } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Checkbox,
  FormControlLabel,
  FormGroup,
  styled,
  Typography,
} from "@mui/material";
import { FC, memo, useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import Grid2 from "@mui/material/Unstable_Grid2";
import {
  EditUserInput,
  RetrievePBACDefaultsResp,
  RetrievePBACDefaultsInput,
  RETRIEVE_PBAC_DEFAULTS,
} from "../../graphql";

const StyledAccordion = styled(Accordion)({
  width: "957px", // TODO: Need to fix the page layout
});

const StyledAccordionSummary = styled(AccordionSummary)({
  borderBottom: "1px solid #6B7294",
  minHeight: "unset !important",
  "& .MuiAccordionSummary-content": {
    margin: "9px 0",
  },
  "& .MuiAccordionSummary-content.Mui-expanded": {
    margin: "9px 0",
  },
  "& .MuiAccordionSummary-expandIcon": {
    color: "#356AAD",
  },
});

const StyledAccordionHeader = styled(Typography)<{ component: React.ElementType }>({
  fontWeight: 700,
  fontSize: "16px",
  lineHeight: "19px",
  color: "#356AAD",
});

const StyledGroupTitle = styled(Typography)({
  fontWeight: 600,
  fontSize: "13px",
  lineHeight: "20px",
  color: "#187A90",
  textTransform: "uppercase",
  marginBottom: "7.5px",
  marginTop: "13.5px",
  userSelect: "none",
});

const StyledFormControlLabel = styled(FormControlLabel)({
  whiteSpace: "nowrap",
  userSelect: "none",
  "& .MuiTypography-root": {
    fontWeight: 400,
    fontSize: "16px",
    color: "#083A50 !important",
  },
  "& .MuiCheckbox-root": {
    paddingTop: "5.5px",
    paddingBottom: "5.5px",
    color: "#005EA2 !important",
  },
  "& .MuiTypography-root.Mui-disabled, & .MuiCheckbox-root.Mui-disabled": {
    opacity: 0.6,
    cursor: "not-allowed !important",
  },
});

type PermissionPanelProps = {
  /**
   * The original/stored role of the user.
   *
   * This is used to determine if the role has changed and to update the default permissions.
   */
  role: UserRole;
};

const mockPerms: PBACDefault<AuthPermissions>[] = [
  {
    _id: "submission_request:view",
    group: "Submission Request",
    name: "View",
    checked: false,
    disabled: false,
  },
  {
    _id: "submission_request:create",
    group: "Submission Request",
    name: "Create",
    checked: false,
    disabled: false,
  },
  {
    _id: "data_submission:view",
    group: "Data Submission",
    name: "View",
    checked: true,
    disabled: true,
  },
  {
    _id: "data_submission:create",
    group: "Data Submission",
    name: "Create",
    checked: false,
    disabled: false,
  },
  {
    _id: "data_submission:confirm",
    group: "Data Submission",
    name: "Confirm",
    checked: false,
    disabled: false,
  },
  {
    _id: "program:manage",
    group: "Admin",
    name: "Manage Programs",
    checked: false,
    disabled: false,
  },
  {
    _id: "study:manage",
    group: "Admin",
    name: "Manage Studies",
    checked: false,
    disabled: false,
  },
  {
    _id: "access:request",
    group: "Miscellaneous",
    name: "Request Access",
    checked: false,
    disabled: true,
  },
];

/**
 * Provides a panel for managing permissions and notifications for a user role.
 *
 * @returns The PermissionPanel component.
 */
const PermissionPanel: FC<PermissionPanelProps> = ({ role }) => {
  const { setValue, watch } = useFormContext<EditUserInput>();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: pbacData, loading } = useQuery<RetrievePBACDefaultsResp, RetrievePBACDefaultsInput>(
    RETRIEVE_PBAC_DEFAULTS,
    {
      variables: { roles: ["All"] },
      context: { clientName: "backend" },
      fetchPolicy: "cache-first",
    }
  );

  const data = mockPerms; // TODO: remove this

  const selectedRole = watch("role");
  const permissionsValue = watch("permissions");
  const notificationsValue = watch("notifications");

  const permissionColumns = useMemo<
    Array<Array<{ name: string; permissions: PBACDefault<AuthPermissions>[] }>>
  >(() => {
    const updatedPermissions: PBACDefault<AuthPermissions>[] = data.map((perm) => ({
      ...perm,
      checked: permissionsValue.includes(perm._id),
    }));

    const groupedPermissions: Record<string, PBACDefault<AuthPermissions>[]> =
      updatedPermissions.reduce((acc, perm) => {
        if (!acc[perm.group]) {
          acc[perm.group] = [];
        }
        acc[perm.group].push(perm);
        return acc;
      }, {});

    const columns: Array<Array<{ name: string; permissions: PBACDefault<AuthPermissions>[] }>> = [
      [],
      [],
      [],
    ];

    Object.entries(groupedPermissions).forEach(([name, permissions], index) => {
      const placement = index > 1 ? 2 : index;
      columns[placement].push({ name, permissions });
    });

    return columns;
  }, [data, permissionsValue]);

  const notificationColumns = useMemo<
    Array<Array<{ name: string; notifications: PBACDefault<AuthNotifications>[] }>>
  >(() => [], []);

  const handlePermissionChange = (_id: AuthPermissions) => {
    if (permissionsValue.includes(_id)) {
      setValue(
        "permissions",
        permissionsValue.filter((p) => p !== _id)
      );
    } else {
      setValue("permissions", [...permissionsValue, _id]);
    }
  };

  const handleNotificationChange = (_id: AuthNotifications) => {
    if (notificationsValue.includes(_id)) {
      setValue(
        "notifications",
        notificationsValue.filter((n) => n !== _id)
      );
    } else {
      setValue("notifications", [...notificationsValue, _id]);
    }
  };

  const handleRoleChange = (selectedRole: UserRole) => {
    if (selectedRole === role) {
      return;
    }

    // TODO: This is a mock implementation. Refactor it to use the actual data based on the role.
    setValue(
      "permissions",
      data.filter((perm) => perm.checked).map((perm) => perm._id)
    );
    setValue("notifications", []); // TODO: Need default notifications
  };

  useEffect(() => {
    handleRoleChange(selectedRole);
  }, [selectedRole]);

  return (
    <>
      <StyledAccordion elevation={0} data-testid="permissions-accordion">
        <StyledAccordionSummary expandIcon={<ArrowDropDown />}>
          <StyledAccordionHeader component="span">Permissions</StyledAccordionHeader>
        </StyledAccordionSummary>
        <AccordionDetails>
          <Grid2 container spacing={2}>
            {permissionColumns.map((column, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <Grid2 xs={4} key={index} data-testid={`permissions-column-${index}`}>
                {column.map(({ name, permissions }) => (
                  <div key={name} data-testid={`permissions-group-${name}`}>
                    <StyledGroupTitle>{name}</StyledGroupTitle>
                    <FormGroup>
                      {permissions.map(({ _id, checked, disabled, name }) => (
                        <StyledFormControlLabel
                          key={_id}
                          label={name}
                          onChange={() => handlePermissionChange(_id)}
                          control={<Checkbox name={_id} checked={checked} disabled={disabled} />}
                          data-testid={`permission-${_id}`}
                        />
                      ))}
                    </FormGroup>
                  </div>
                ))}
              </Grid2>
            ))}
          </Grid2>
        </AccordionDetails>
      </StyledAccordion>
      <StyledAccordion elevation={0} data-testid="notifications-accordion">
        <StyledAccordionSummary expandIcon={<ArrowDropDown />}>
          <StyledAccordionHeader component="span">Email Notifications</StyledAccordionHeader>
        </StyledAccordionSummary>
        <AccordionDetails>
          <Grid2 container spacing={2}>
            {notificationColumns.map((column, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <Grid2 xs={4} key={index} data-testid={`notifications-column-${index}`}>
                {column.map(({ name, notifications }) => (
                  <div key={name} data-testid={`notifications-group-${name}`}>
                    <StyledGroupTitle>{name}</StyledGroupTitle>
                    <FormGroup>
                      {notifications.map(({ _id, checked, disabled, name }) => (
                        <StyledFormControlLabel
                          key={_id}
                          label={name}
                          onChange={() => handleNotificationChange(_id)}
                          control={<Checkbox name={_id} checked={checked} disabled={disabled} />}
                          data-testid={`notification-${_id}`}
                        />
                      ))}
                    </FormGroup>
                  </div>
                ))}
              </Grid2>
            ))}
          </Grid2>
        </AccordionDetails>
      </StyledAccordion>
    </>
  );
};

export default memo(PermissionPanel);
