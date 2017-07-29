/**
 * Created by root on 4/10/16.
 */

exports.ServiceChargeType = {
    FLAT:'Flat',
    PERCENT:'Percent'
};

exports.TicketChannel = {
    WEBSITE:1,
    MOBILEAPP:2,
    HELPDESK:3,
    REGISTRATIONCENTRE:4,
    USERPORTAL:5
};

exports.TicketStatus = {
    OPEN:'Open',
    CLOSED:'Close',
    HOLD:'Hold'
};

exports.EmployeeStatus={
    ACTIVE:1,
    INACTIVE:0,
    BLOCKED:-1
};

exports.StationType={
    MAJOR:"Major",
    MINOR:"Minor"
};

exports.EmployeeShift={
    MORNING:1,
    AFTERNOON:2,
    REGULAR:3
};

exports.DepositStatus = {
    NOT_DEPOSITED:"Not Deposited",
    PARTIAL:"Partially Deposited",
    DEPOSITED:"Deposited",
    EXCESS:"Excess Deposited"
};

exports.PayDescription={
    SECURITY_DEPOSIT:"Security Deposit",
    PROCESSING_FEE:"Processing Fee",
    SMART_CARD_FEE:"Smart Card Fee",
    REGISTRATION:"Registration",
    REPLENISHMENT:"Replenishment",
    REFUND:"Refund",
    UNUSED_AMOUNT:"Unused Balance",
    //USAGE_FEE:"Usage Fee",
    DEBIT_NOTE:"Debit note",
    CREDIT_NOTE:"Credit note",
    TOPUP:"Topup",
    TRANSFER:"Transfer",
    FROMSECURITY:"From Security Deposit",
    SERVICE_CHARGE:"Online Payment Service Charge"
};

exports.PayMode={
    CASH:"Cash",
    CREDIT_CARD:"Credit Card",
    DEBIT_CARD:"Debit Card",
    NET_BANKING:"Net Banking",
    TRANSFER:"Transfer",
    OTHERS:"Others"
};

    exports.PayThrough={
    POS:"POS",
    PAYMENT_GATEWAY:"Payment Gateway",
        CASH:"Cash",
        OTHERS:"Others"
};

exports.Loc={
    REG_CENTRE:"Other Location",
    ONLINE:"Online"
};

exports.Role={
    ADMIN:"admin",
    MEMBER:"member",
    EMPLOYEE:"employee"
};

exports.AvailabilityStatus={
    ERROR:-1,
    FULL:1,
    EMPTY:2,
    NORMAL:3
};

exports.FleetStatus={
    WORKING:0,
    DECOMMISSIONED:-1
};

exports.OperationStatus = {
    OPERATIONAL: 1,
    NON_OPERATIONAL: 2,
    DECOMMISSIONED: -1
};

exports.Zones={
    ZONE1:1,
    ZONE2:2,
    ZONE3:3,
    ZONE4:4,
    ZONE5:5
};

exports.StationTemplate={
    T1:1,
    T2:2,
    T3:3,
    T4:4
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
    SUSPENDED: -2,
    EXPIRED:-3
};
exports.MembershipStatus = {
    ACTIVE: 0,
    INACTIVE: -1
};

exports.TopupPlanStatus = {
    ACTIVE: 0,
    INACTIVE: -1
};


exports.VehicleType={
    BICYCLE:1,
    GEARED_BICYCLE:2,
    PEDAL_ASSIST:3
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

exports.ComplaintValidation={
    VALID:1,
    INVALID:2
};

/** Card **/

exports.CardType = {
    REGISTERED_MEMBER: 1,
    EMPLOYEE: 2,
    ONDEMAND:"3"
};

exports.CardLevel = {
    REGULAR_EMPLOYEE_CARD: 0,
    CHECK_OUT_CARD: 1,
    PORT_CLOSE_CARD: 2,
    BICYCLE_LOCK_CARD: 3,
    PORT_READY_CARD: 4
};

exports.CardStatus = {
    AVAILABLE: 1,
    ASSIGNED: 2,
    DAMAGED:3,
    BLOCKED:4
};
/** Fare Plan Status **/

exports.FarePlanStatus = {
    ACTIVE: 0,
    INACTIVE: -1
};