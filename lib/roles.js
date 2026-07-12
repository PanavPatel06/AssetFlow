// The four roles in AssetFlow. Signup only ever creates an EMPLOYEE;
// the Admin promotes people to the higher roles in the Employee Directory.
export const ROLES = {
  ADMIN: "ADMIN",
  ASSET_MANAGER: "ASSET_MANAGER",
  DEPARTMENT_HEAD: "DEPARTMENT_HEAD",
  EMPLOYEE: "EMPLOYEE",
};

export const ROLE_LABELS = {
  ADMIN: "Admin",
  ASSET_MANAGER: "Asset Manager",
  DEPARTMENT_HEAD: "Department Head",
  EMPLOYEE: "Employee",
};

// Higher number = more privilege. Handy for simple comparisons.
export const ROLE_RANK = {
  EMPLOYEE: 1,
  DEPARTMENT_HEAD: 2,
  ASSET_MANAGER: 3,
  ADMIN: 4,
};

// Which roles may perform each capability. Used to gate nav items and buttons.
export const CAPABILITIES = {
  orgSetup: ["ADMIN"],
  registerAsset: ["ADMIN", "ASSET_MANAGER"],
  allocateAsset: ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"],
  approveTransfer: ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"],
  approveMaintenance: ["ADMIN", "ASSET_MANAGER"],
  runAudit: ["ADMIN", "ASSET_MANAGER"],
  viewReports: ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"],
  viewOrgAnalytics: ["ADMIN", "ASSET_MANAGER"],
};

// can(user.role, "registerAsset") -> true / false
export function can(role, capability) {
  const allowed = CAPABILITIES[capability] || [];
  return allowed.includes(role);
}
