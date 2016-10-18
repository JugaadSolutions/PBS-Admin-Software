/**
 * Created by root on 4/10/16.
 */

exports.Role={
ADMIN:"admin",
    MEMBER:"member",
    EMPLOYEE:"employee"
};

exports.FleetStatus={
    WORKING:0,
    DECOMMISSIONED:-1
};

exports.VehicleStatus = {
    OPERATIONAL: 0,
    NON_OPERATIONAL: 1,
    DECOMMISSIONED: -1
};

exports.Sex = {
    MALE: "Male",
    FEMALE: "Female",
    OTHER: "Other"
};
exports.ProofType = {
    AADHAR: "Aadhar",
    PASSPORT: "Passport",
    DRIVERS_LICENSE: "Driver's License",
    OTHER: "Other"
};
exports.MemberStatus = {
    PROSPECTIVE: 0,
    REGISTERED: 1,
    RENEWED: 2,
    CANCELLED: -1,
    SUSPENDED: -2
};
exports.MembershipStatus = {
    ACTIVE: 0,
    INACTIVE: -1
};

exports.VehicleType={
  BICYCLE:0
};

exports.VehicleLocationStatus={
    WITH_FLEET:0,
    WITH_PORT:1,
    WITH_MEMBER:2
};
exports.DockingStationStatus = {
    OPERATIONAL: 0,
    NON_OPERATIONAL: 1
};
exports.DockingUnitStatus = {
    OPERATIONAL: 0,
    NON_OPERATIONAL: 1
};
exports.DockingPortStatus = {
    BICYCLE_AVAILABLE: 0,
    EMPTY_PORT: 1,
    BICYCLE_LOCKED: 2,
    PORT_LOCKED: 3,
    PORT_ERROR: 4
};
/** Card **/

exports.CardType = {
    REGISTERED_MEMBER: 0,
    EMPLOYEE: 1
};

exports.CardLevel = {
    REGULAR_EMPLOYEE_CARD: 0,
    CHECK_OUT_CARD: 1,
    PORT_CLOSE_CARD: 2,
    BICYCLE_LOCK_CARD: 3,
    PORT_READY_CARD: 4
};

exports.CardStatus = {
    ACTIVE: 0,
    INACTIVE: -1
};
/** Fare Plan Status **/

exports.FarePlanStatus = {
    ACTIVE: 0,
    INACTIVE: -1
};