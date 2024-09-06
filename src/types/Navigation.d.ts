type NavBarItem = {
  /**
   * The unique id attribute of the Navigation Item
   *
   * @note This is also used as the React key.
   */
  id: string;
  /**
   * The name to be displayed on the Navigation Item
   */
  name: string;
  /**
   * The link to navigate to when the Navigation Item is clicked
   */
  link: string;
  /**
   * The class name of the Navigation Item
   *
   * Guide:
   * - `navMobileItem` if the item does not have a dropdown
   * - `navMobileItem clickable` if the item has a dropdown
   */
  className: "navMobileItem" | "navMobileItem clickable";
  /**
   * Defines RBAC for the Navigation Item
   *
   * Guide:
   * - If the value is an array, the current user must be in one of the roles to see the item
   */
  roles?: User["role"][];
};

type NavBarSubItem = {
  /**
   * The unique id attribute of the Navigation Sub Item
   *
   * @note This is also used as the React key.
   */
  id: string;
  /**
   * The name to be displayed on the Navigation Sub Item
   */
  name: string;
  /**
   * The className of the Navigation Sub Item
   *
   * Guide:
   * - `navMobileSubItem` if the item is a link
   * - `navMobileSubTitle` if the item is a title
   * - `navMobileSubItem action` if the item is an action with onClick
   */
  className: "navMobileSubItem" | "navMobileSubTitle" | "navMobileSubItem action";
  /**
   * The link to navigate to when the Navigation Sub Item is clicked
   *
   * @note Should not be provided if the item is an action
   */
  link?: string;
  /**
   * The title to display on the Navigation Sub Item
   *
   * @note Only works if the className is `navMobileSubTitle`
   */
  text?: string;
  /**
   * The onClick function to be called when the Navigation Sub Item is clicked
   *
   * @note Only works if the className is `navMobileSubItem action`
   */
  onClick?: () => void;
};
