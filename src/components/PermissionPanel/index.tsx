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
import { Logger } from "../../utils";

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

const StyledNotice = styled(Typography)({
  marginTop: "29.5px",
  textAlign: "center",
  width: "100%",
  color: "#6B7294",
  userSelect: "none",
});

type PermissionPanelProps = {
  /**
   * The original/stored role of the user.
   *
   * This is used to determine if the role has changed and to update the default permissions.
   */
  role: UserRole;
};

/**
 * Provides a panel for managing permissions and notifications for a user role.
 *
 * @returns The PermissionPanel component.
 */
const PermissionPanel: FC<PermissionPanelProps> = ({ role }) => {
  const { setValue, watch } = useFormContext<EditUserInput>();

  const { data, loading } = useQuery<RetrievePBACDefaultsResp, RetrievePBACDefaultsInput>(
    RETRIEVE_PBAC_DEFAULTS,
    {
      variables: { roles: ["All"] },
      context: { clientName: "backend" },
      fetchPolicy: "cache-first",
    }
  );

  const selectedRole = watch("role");
  const permissionsValue = watch("permissions");
  const notificationsValue = watch("notifications");

  const permissionColumns = useMemo<
    Array<Array<{ name: string; permissions: PBACDefault<AuthPermissions>[] }>>
  >(() => {
    if (!data?.retrievePBACDefaults && loading) {
      return [];
    }

    const defaults = data?.retrievePBACDefaults?.find((pbac) => pbac.role === selectedRole);
    if (!defaults || !defaults?.permissions) {
      Logger.error("Role not found in PBAC defaults", { role: selectedRole, data });
      return [];
    }

    const updatedPermissions: PBACDefault<AuthPermissions>[] = defaults?.permissions.map((p) => ({
      ...p,
      checked: permissionsValue.includes(p._id),
    }));

    const groupedPermissions: Record<string, PBACDefault<AuthPermissions>[]> =
      updatedPermissions.reduce((acc, p) => {
        if (!acc[p.group]) {
          acc[p.group] = [];
        }
        acc[p.group].push(p);
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
  >(() => {
    if (!data?.retrievePBACDefaults && loading) {
      return [];
    }

    const defaults = data?.retrievePBACDefaults?.find((pbac) => pbac.role === selectedRole);
    if (!defaults || !defaults?.notifications) {
      Logger.error("Role not found in PBAC defaults", { role: selectedRole, data });
      return [];
    }

    const updatedNotifications: PBACDefault<AuthNotifications>[] = defaults?.notifications.map(
      (n) => ({
        ...n,
        checked: notificationsValue.includes(n._id),
      })
    );

    const groupedNotifications: Record<string, PBACDefault<AuthNotifications>[]> =
      updatedNotifications.reduce((acc, n) => {
        if (!acc[n.group]) {
          acc[n.group] = [];
        }
        acc[n.group].push(n);
        return acc;
      }, {});

    const columns: Array<Array<{ name: string; notifications: PBACDefault<AuthNotifications>[] }>> =
      [[], [], []];

    Object.entries(groupedNotifications).forEach(([name, notifications], index) => {
      const placement = index > 1 ? 2 : index;
      columns[placement].push({ name, notifications });
    });

    return columns;
  }, [data, notificationsValue]);

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

    const defaults = data?.retrievePBACDefaults?.find((pbac) => pbac.role === selectedRole);
    setValue("permissions", defaults?.permissions?.filter((p) => p.checked).map((p) => p._id));
    setValue("notifications", defaults?.notifications?.filter((n) => n.checked).map((n) => n._id));
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
            {permissionColumns.length === 0 && (
              <StyledNotice variant="body1" data-testid="no-permissions-notice">
                No permission options found for this role.
              </StyledNotice>
            )}
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
            {notificationColumns.length === 0 && (
              <StyledNotice variant="body1" data-testid="no-notifications-notice">
                No notification options found for this role.
              </StyledNotice>
            )}
          </Grid2>
        </AccordionDetails>
      </StyledAccordion>
    </>
  );
};

export default memo(PermissionPanel);
