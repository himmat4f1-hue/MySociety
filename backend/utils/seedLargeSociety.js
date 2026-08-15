// Generates a SECOND, large-scale society ("Sunrise Heights") on top of the
// small hand-authored "Greenfield Residency" demo - 100 flats with a full
// year of historical activity across every module, so relationships between
// tables (who booked what amenity, whose complaint is whose, which invoice
// belongs to which flat, etc.) can be verified at realistic scale and from
// every role's point of view. Greenfield stays small/readable for quick demos;
// this one is deliberately large and randomized for stress-testing.

const bcryptRounds = 10; // unused directly - User model hashes on create via its own hook

const FIRST_NAMES = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Krishna', 'Ishaan', 'Rohan',
  'Ananya', 'Diya', 'Saanvi', 'Aadhya', 'Kiara', 'Myra', 'Pari', 'Anika', 'Riya', 'Ira',
  'Rajesh', 'Suresh', 'Mahesh', 'Ramesh', 'Dinesh', 'Naresh', 'Kavita', 'Sunita', 'Anita', 'Lalita',
  'Vikram', 'Manoj', 'Sanjay', 'Ajay', 'Vijay', 'Deepak', 'Pankaj', 'Rakesh', 'Amit', 'Sumit'];
const LAST_NAMES = ['Sharma', 'Verma', 'Gupta', 'Patel', 'Shah', 'Mehta', 'Joshi', 'Nair', 'Iyer', 'Reddy',
  'Rao', 'Kumar', 'Singh', 'Yadav', 'Malhotra', 'Kapoor', 'Chopra', 'Agarwal', 'Bansal', 'Trivedi'];
const randomName = () => `${FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]}`;
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const daysAgo = (n) => new Date(Date.now() - n * 86400000);
const daysFromNow = (n) => new Date(Date.now() + n * 86400000);
const chunkPhone = (i) => `70${String(10000000 + i).slice(0, 8)}`;

const seedLargeSociety = async (models) => {
  const {
    User, Society, Membership, Unit, Building, Resident, Pet, Vehicle, HomeService, FamilyMember,
    Visitor, Complaint, Maintenance, Invoice, Transaction, Meeting, AgendaItem, MeetingAttendance,
    Amenity, AmenityUsageLog, Lease, GatePass, Task, Supply, Notice, Poll, CommitteeVote, ManagementVote,
    Rule, ServiceProviderContact, ParkingAllotment, RoleChecklist,
    InventoryItem, InsurancePolicy, SupportTicket, Feedback, UtilityReading,
  } = models;

  console.log('\n=== Seeding large-scale test society (Sunrise Heights, 100 flats, 1 year of history) ===');

  const society = await Society.create({
    name: 'Sunrise Heights',
    slug: 'sunrise-heights',
    city: 'Mumbai',
    type: 'Apartment',
    buildingsCount: 5,
    totalFlats: 100,
    status: 'Active',
  });
  const sid = society.id;
  const password = '123456';

  // ---- Management team (fixed, easy to log in as) ----
  const secretary = await User.create({ name: 'Anjali Desai', email: 'secretary@sunriseheights.com', phone: '7000000001', password, role: 'secretary' });
  const chairman = await User.create({ name: 'Ramesh Iyer', email: 'chairman@sunriseheights.com', phone: '7000000002', password, role: 'chairman' });
  const treasurer = await User.create({ name: 'Kavita Rao', email: 'treasurer@sunriseheights.com', phone: '7000000003', password, role: 'treasurer' });
  const accountant = await User.create({ name: 'Sandeep Nair', email: 'accountant@sunriseheights.com', phone: '7000000004', password, role: 'accountant' });
  const security1 = await User.create({ name: 'Bhaskar Yadav', email: 'security1@sunriseheights.com', phone: '7000000005', password, role: 'security' });
  const security2 = await User.create({ name: 'Om Prakash', email: 'security2@sunriseheights.com', phone: '7000000006', password, role: 'security' });
  const housekeeping1 = await User.create({ name: 'Geeta Devi', email: 'housekeeping1@sunriseheights.com', phone: '7000000007', password, role: 'housekeeping' });
  const housekeeping2 = await User.create({ name: 'Ram Lal', email: 'housekeeping2@sunriseheights.com', phone: '7000000008', password, role: 'housekeeping' });

  for (const [user, role] of [[secretary, 'secretary'], [chairman, 'chairman'], [treasurer, 'treasurer'], [accountant, 'accountant'], [security1, 'security'], [security2, 'security'], [housekeeping1, 'housekeeping'], [housekeeping2, 'housekeeping']]) {
    await Membership.create({ user: user.id, society: sid, role });
  }

  // ---- Buildings & Units: 5 towers x 20 flats (4 floors x 5 units) ----
  const towerNames = ['Tower A', 'Tower B', 'Tower C', 'Tower D', 'Tower E'];
  await Building.bulkCreate(towerNames.map((name) => ({ society: sid, name })));

  const unitDocs = [];
  towerNames.forEach((tower, tIdx) => {
    const letter = tower.split(' ')[1];
    for (let floor = 1; floor <= 4; floor++) {
      for (let u = 1; u <= 5; u++) {
        unitDocs.push({
          society: sid,
          flatNo: `${letter}-${floor}0${u}`,
          tower,
          floor: `${floor}${floor === 1 ? 'st' : floor === 2 ? 'nd' : floor === 3 ? 'rd' : 'th'} Floor`,
          type: randomChoice(['1 BHK', '2 BHK', '2 BHK', '3 BHK']),
          areaSqft: randomInt(650, 1600),
          status: 'Vacant', // set properly below
        });
      }
    }
  });
  // unitDocs.length === 100. Assign occupancy: 10 vacant, 15 tenant, 75 owner (1 of the 75 also listed for sale).
  const shuffled = [...unitDocs.keys()].sort(() => Math.random() - 0.5);
  const vacantIdx = new Set(shuffled.slice(0, 10));
  const tenantIdx = new Set(shuffled.slice(10, 25));
  const ownerIdx = shuffled.slice(25); // remaining 75
  const forSaleIdx = ownerIdx[0]; // 1% (1 of 100)

  unitDocs.forEach((u, i) => {
    if (vacantIdx.has(i)) u.status = 'Vacant';
    else u.status = 'Occupied';
  });

  const createdUnits = await Unit.bulkCreate(unitDocs, { returning: true });

  // ---- Owners / Tenants + Memberships + FamilyMembers + Resident profiles ----
  const occupiedUsers = []; // { user, unit, type }
  for (const i of ownerIdx) {
    const unit = createdUnits[i];
    const name = randomName();
    const user = await User.create({ name, email: `owner${i}@sunriseheights.com`, phone: chunkPhone(i), password, role: 'resident', residentType: 'owner', flatNo: unit.flatNo, tower: unit.tower });
    await Membership.create({ user: user.id, society: sid, role: 'resident', flatNo: unit.flatNo, tower: unit.tower, flatId: unit.flatNo });
    await unit.update({ owner: user.id, resident: user.id, forSale: i === forSaleIdx, askingPrice: i === forSaleIdx ? randomInt(6500000, 12000000) : null, ownersCount: 1, managedBy: 'Owner' });
    occupiedUsers.push({ user, unit, type: 'owner' });
  }
  for (const i of tenantIdx) {
    const unit = createdUnits[i];
    const name = randomName();
    const user = await User.create({ name, email: `tenant${i}@sunriseheights.com`, phone: chunkPhone(i), password, role: 'tenant', residentType: 'tenant', flatNo: unit.flatNo, tower: unit.tower });
    await Membership.create({ user: user.id, society: sid, role: 'tenant', flatNo: unit.flatNo, tower: unit.tower, flatId: unit.flatNo });
    await unit.update({ resident: user.id, managedBy: 'Tenant' });
    occupiedUsers.push({ user, unit, type: 'tenant' });

    // Lease for every tenant flat, various statuses
    const leaseStart = daysAgo(randomInt(30, 400));
    const leaseEnd = new Date(leaseStart.getTime() + 365 * 86400000);
    await Lease.create({
      society: sid,
      flatNo: unit.flatNo,
      tower: unit.tower,
      tenantName: name,
      ownerName: 'Absentee Owner',
      leaseStart,
      leaseEnd,
      monthlyRent: randomInt(15000, 45000),
      securityDeposit: randomInt(45000, 135000),
      status: leaseEnd < new Date() ? 'Expired' : leaseEnd < daysFromNow(45) ? 'Expiring Soon' : 'Active',
      policeVerificationStatus: randomChoice(['Not Submitted', 'Submitted', 'Verified', 'Verified', 'Rejected']),
      maintenanceCharges: randomInt(1500, 4000),
    });
  }
  // one pending lease for a not-yet-moved-in flat
  await Lease.create({
    society: sid, flatNo: 'E-401', tower: 'Tower E', tenantName: 'New Tenant (awaiting approval)', ownerName: 'Owner (E-401)',
    leaseStart: daysFromNow(15), leaseEnd: daysFromNow(380), monthlyRent: 28000, securityDeposit: 84000,
    status: 'Pending', policeVerificationStatus: 'Submitted',
  });

  // FamilyMembers for every occupied flat
  const familyDocs = [];
  occupiedUsers.forEach(({ user, unit }) => {
    const [first, ...rest] = user.name.split(' ');
    familyDocs.push({ society: sid, flatId: unit.flatNo, firstName: first, lastName: rest.join(' '), gender: randomChoice(['Male', 'Female']), mobileNumber: user.phone, isAutoAddedOwner: true });
    const extra = randomInt(0, 3);
    for (let k = 0; k < extra; k++) {
      familyDocs.push({ society: sid, flatId: unit.flatNo, firstName: randomChoice(FIRST_NAMES), lastName: rest.join(' '), gender: randomChoice(['Male', 'Female']), birthDate: Math.random() > 0.6 ? daysAgo(randomInt(1000, 6000)) : undefined });
    }
  });
  await FamilyMember.bulkCreate(familyDocs);

  // Resident profiles (used by a few report pages)
  await Resident.bulkCreate(occupiedUsers.map(({ user, unit, type }) => ({
    society: sid, user: user.id, flatNo: unit.flatNo, tower: unit.tower, type: type === 'owner' ? 'Owner' : 'Tenant', status: 'Active',
  })));

  // Pets (~20% of occupied flats), Vehicles (~65%), Home Services (~30%)
  const petDocs = [];
  const vehicleDocs = [];
  const homeServiceDocs = [];
  occupiedUsers.forEach(({ unit }) => {
    if (Math.random() < 0.2) {
      petDocs.push({ society: sid, name: randomChoice(['Bruno', 'Coco', 'Simba', 'Milo', 'Luna', 'Rocky']), type: randomChoice(['Dog', 'Dog', 'Cat', 'Bird', 'Fish']), breed: randomChoice(['Labrador', 'Persian', 'Indie', 'Beagle']), flatId: unit.flatNo, vaccinated: Math.random() > 0.2 });
    }
    if (Math.random() < 0.65) {
      const n = randomInt(1, 2);
      for (let k = 0; k < n; k++) {
        vehicleDocs.push({ society: sid, flatId: unit.flatNo, vehicleType: randomChoice(['Car', 'Bike', 'Scooter', 'Car', 'Bike']), fuelType: randomChoice(['Petrol', 'Petrol', 'CNG', 'Electric']), color: randomChoice(['White', 'Black', 'Silver', 'Red', 'Blue']), registrationNo: `MH${randomInt(10, 14)} ${randomChoice(['AB', 'CD', 'XY', 'PQ'])} ${randomInt(1000, 9999)}` });
      }
    }
    if (Math.random() < 0.3) {
      homeServiceDocs.push({ society: sid, flatId: unit.flatNo, type: randomChoice(['House Maid', 'Milk Supplier', 'News Paper Supplier', 'School Van', 'Personal Housekeeping']), firstName: randomChoice(FIRST_NAMES), lastName: randomChoice(LAST_NAMES), gender: randomChoice(['Male', 'Female']), mobileNumber: chunkPhone(randomInt(200, 999)), inTime: '08:00 AM', outTime: '10:00 AM' });
    }
  });
  await Pet.bulkCreate(petDocs);
  await Vehicle.bulkCreate(vehicleDocs);
  await HomeService.bulkCreate(homeServiceDocs);

  // ---- 1 year of Visitors (~500, spread across 365 days) ----
  const visitorDocs = [];
  for (let i = 0; i < 500; i++) {
    const { unit } = randomChoice(occupiedUsers);
    const daysBack = randomInt(0, 365);
    const inTime = daysAgo(daysBack);
    const isOld = daysBack > 1;
    visitorDocs.push({
      society: sid,
      name: randomName(),
      mobile: chunkPhone(randomInt(1000, 9999)),
      purpose: randomChoice(['Personal Visit', 'Courier Delivery', 'Service Person', 'Cab/Taxi', 'Food Delivery']),
      flatNo: unit.flatNo,
      residentName: '',
      inTime,
      outTime: isOld ? new Date(inTime.getTime() + randomInt(15, 180) * 60000) : null,
      status: isOld ? 'Checked Out' : randomChoice(['Inside', 'Checked Out']),
      createdAt: inTime,
    });
  }
  await Visitor.bulkCreate(visitorDocs);

  // ---- 1 year of Invoices (12 months x 90 occupied flats) + Transactions ----
  const invoiceDocs = [];
  const transactionDocs = [];
  for (let m = 11; m >= 0; m--) {
    const invoiceDate = daysAgo(m * 30);
    occupiedUsers.forEach(({ unit }, idx) => {
      const amount = randomInt(2500, 6000);
      const isPastMonth = m > 0;
      const paid = isPastMonth ? Math.random() > 0.08 : Math.random() > 0.5; // most past months paid, current month ~50/50
      const status = paid ? 'Paid' : (invoiceDate < daysAgo(30) ? 'Overdue' : 'Pending');
      invoiceDocs.push({
        society: sid,
        invoiceNo: `INV-SH-${invoiceDate.getFullYear()}${String(invoiceDate.getMonth() + 1).padStart(2, '0')}-${String(idx + 1).padStart(3, '0')}`,
        flatNo: unit.flatNo,
        residentName: '',
        description: 'Monthly Maintenance Charges',
        amount,
        dueDate: new Date(invoiceDate.getTime() + 10 * 86400000),
        status,
        paidOn: paid ? new Date(invoiceDate.getTime() + randomInt(1, 9) * 86400000) : null,
      });
      if (paid) {
        transactionDocs.push({ society: sid, type: 'Income', category: 'Maintenance', description: `Maintenance - ${unit.flatNo}`, amount, flatNo: unit.flatNo, date: invoiceDate, status: 'Collected' });
      }
    });
    // A few recurring expenses per month
    transactionDocs.push({ society: sid, type: 'Expense', category: 'Utilities', description: 'Electricity Bill - Common Area', amount: randomInt(15000, 35000), date: invoiceDate, status: 'Paid' });
    transactionDocs.push({ society: sid, type: 'Expense', category: 'Housekeeping', description: 'Housekeeping Contractor Payment', amount: randomInt(40000, 60000), date: invoiceDate, status: 'Paid' });
    transactionDocs.push({ society: sid, type: 'Expense', category: 'Security', description: 'Security Agency Payment', amount: randomInt(50000, 80000), date: invoiceDate, status: 'Paid' });
    if (Math.random() > 0.5) {
      transactionDocs.push({ society: sid, type: 'Expense', category: 'Repairs', description: randomChoice(['Lift Servicing', 'Plumbing Repair', 'Painting Touch-up', 'Garden Maintenance']), amount: randomInt(5000, 25000), date: invoiceDate, status: 'Paid' });
    }
  }
  await Invoice.bulkCreate(invoiceDocs);
  await Transaction.bulkCreate(transactionDocs);

  // ---- Complaints (~120) + Maintenance (~80) across the year, all statuses/priorities ----
  const complaintDocs = [];
  const categories = ['Housekeeping', 'Lift', 'Camera', 'Electrical', 'Plumbing', 'Other'];
  for (let i = 0; i < 120; i++) {
    const { unit, user } = randomChoice(occupiedUsers);
    const raisedOn = daysAgo(randomInt(0, 365));
    const isOld = raisedOn < daysAgo(10);
    const status = isOld ? randomChoice(['Resolved', 'Resolved', 'Resolved', 'In Process']) : randomChoice(['Open', 'In Process']);
    complaintDocs.push({
      society: sid,
      title: `${randomChoice(categories)} issue - ${unit.flatNo}`,
      description: 'Auto-generated test complaint for seed data verification.',
      category: randomChoice(categories),
      priority: randomChoice(['High', 'Medium', 'Medium', 'Low']),
      status,
      flatNo: unit.flatNo,
      raisedBy: user.id,
      raisedOn,
      resolvedOn: status === 'Resolved' ? new Date(raisedOn.getTime() + randomInt(1, 7) * 86400000) : null,
      createdAt: raisedOn,
    });
  }
  await Complaint.bulkCreate(complaintDocs);

  const maintenanceDocs = [];
  for (let i = 0; i < 80; i++) {
    const { unit, user } = randomChoice(occupiedUsers);
    const raisedOn = daysAgo(randomInt(0, 365));
    const isOld = raisedOn < daysAgo(10);
    const status = isOld ? randomChoice(['Completed', 'Completed', 'Completed', 'In Progress']) : randomChoice(['Open', 'In Progress', 'Overdue']);
    maintenanceDocs.push({
      society: sid,
      title: `${randomChoice(['AC Repair', 'Water Leakage', 'Electrical Fault', 'Door Lock Issue', 'Paint Peeling'])}`,
      description: 'Auto-generated test maintenance request for seed data verification.',
      category: randomChoice(['Plumbing', 'Electrical', 'Lift', 'AC/HVAC', 'Carpentry']),
      priority: randomChoice(['High', 'Medium', 'Low']),
      status,
      flatNo: unit.flatNo,
      raisedBy: user.id,
      assignedTo: randomChoice(['Ramesh (Plumber)', 'Suresh (Electrician)', 'External Contractor']),
      raisedOn,
      completedOn: status === 'Completed' ? new Date(raisedOn.getTime() + randomInt(1, 10) * 86400000) : null,
      createdAt: raisedOn,
    });
  }
  await Maintenance.bulkCreate(maintenanceDocs);

  // ---- Meetings (12, one per month) + Agenda Items + Attendance ----
  const meetingTypes = ['General', 'Committee', 'Internal', 'Community'];
  const createdMeetings = [];
  for (let m = 0; m < 12; m++) {
    const date = m < 10 ? daysAgo((10 - m) * 30) : daysFromNow((m - 9) * 15);
    const meeting = await Meeting.create({
      society: sid,
      title: `${randomChoice(meetingTypes)} Meeting - ${date.toLocaleString('en-IN', { month: 'long', year: 'numeric' })}`,
      type: randomChoice(meetingTypes),
      date,
      time: randomChoice(['06:00 PM', '06:30 PM', '07:00 PM']),
      location: randomChoice(['Conference Room', 'Community Hall', 'Committee Room']),
      agenda: 'Monthly review of society operations, finances, and pending matters.',
      createdBy: secretary.id,
    });
    createdMeetings.push(meeting);
  }
  const managementUsers = [secretary, chairman, treasurer, accountant];
  const agendaDocs = [];
  const attendanceDocs = [];
  for (const meeting of createdMeetings) {
    const numAgendas = randomInt(1, 4);
    for (let a = 0; a < numAgendas; a++) {
      const isPast = meeting.date < new Date();
      agendaDocs.push({
        society: sid,
        meeting: meeting.id,
        agenda: randomChoice(['Approve annual maintenance budget', 'Discuss lift AMC renewal', 'Review security agency performance', 'Diwali celebration budget approval', 'Painting contractor selection', 'Water tank cleaning schedule']),
        priority: randomChoice(['High', 'Medium', 'Low']),
        agendaStatus: isPast ? randomChoice(['Resolved', 'Resolved', 'Rejected']) : 'Not Started',
        noOfVotes: isPast ? randomInt(2, 4) : 0,
        votingStartAt: meeting.date,
        votingEndAt: new Date(meeting.date.getTime() + 2 * 3600000),
        voteOptions: [{ label: 'Approve', votes: isPast ? randomInt(2, 4) : 0 }, { label: 'Reject', votes: isPast ? randomInt(0, 1) : 0 }],
      });
    }
    if (meeting.date < new Date()) {
      managementUsers.forEach((u) => {
        if (Math.random() > 0.2) attendanceDocs.push({ society: sid, meeting: meeting.id, role: 'management', flatId: null, user: u.id, checkedInAt: meeting.date });
      });
      // a handful of residents attending too
      for (let k = 0; k < randomInt(3, 8); k++) {
        const { unit, user } = randomChoice(occupiedUsers);
        attendanceDocs.push({ society: sid, meeting: meeting.id, role: 'resident', flatId: unit.flatNo, user: user.id, checkedInAt: meeting.date });
      }
    }
  }
  await AgendaItem.bulkCreate(agendaDocs);
  // MeetingAttendance has a unique (meeting,user) constraint - dedupe defensively
  const seenPairs = new Set();
  const dedupedAttendance = attendanceDocs.filter((d) => {
    const key = `${d.meeting}-${d.user}`;
    if (seenPairs.has(key)) return false;
    seenPairs.add(key);
    return true;
  });
  await MeetingAttendance.bulkCreate(dedupedAttendance);

  // ---- Amenities + 1 year of usage logs ----
  const amenityDefs = [
    { name: 'Gym', type: 'Fitness', capacity: 60, used: 45 },
    { name: 'Swimming Pool', type: 'Recreation', capacity: 80, used: 55 },
    { name: 'Club House', type: 'Community', capacity: 150, used: 100 },
    { name: 'Tennis Court', type: 'Sports', capacity: 15, used: 4, status: 'Under Maintenance' },
    { name: 'Children Play Area', type: 'Recreation', capacity: 100, used: 60 },
    { name: 'Party Hall', type: 'Community', capacity: 120, used: 30 },
    { name: 'Power Backup', type: 'Utility', capacity: 0, used: 0, status: 'Out of Service' },
  ];
  const createdAmenities = await Amenity.bulkCreate(amenityDefs.map((a) => ({ society: sid, name: a.name, type: a.type, building: 'All Towers', status: a.status || 'Available', availability: '6:00 AM - 10:00 PM', capacity: a.capacity, used: a.used })), { returning: true });

  const usageDocs = [];
  for (let i = 0; i < 300; i++) {
    const amenity = randomChoice(createdAmenities);
    const { unit, user } = randomChoice(occupiedUsers);
    const date = daysAgo(randomInt(0, 365));
    usageDocs.push({
      society: sid,
      amenity: amenity.id,
      user: user.id,
      flatId: unit.flatNo,
      date: date.toISOString().slice(0, 10),
      fromTime: randomChoice(['06:00 AM', '08:00 AM', '05:00 PM', '07:00 PM']),
      toTime: randomChoice(['07:00 AM', '09:00 AM', '06:00 PM', '08:00 PM']),
      status: date < daysAgo(1) ? randomChoice(['Completed', 'Completed', 'No-show']) : 'Booked',
    });
  }
  await AmenityUsageLog.bulkCreate(usageDocs);

  // ---- Voting: one completed committee election (6mo ago) + one completed management-role election (3mo ago) ----
  const electionDate1 = daysAgo(180);
  const committeeCandidates = occupiedUsers.slice(0, 5);
  const committeeVoteDocs = [];
  occupiedUsers.forEach(({ unit }) => {
    if (Math.random() > 0.35) {
      committeeVoteDocs.push({ society: sid, electionDate: electionDate1, voterFlatId: unit.flatNo, candidateFlatId: randomChoice(committeeCandidates).unit.flatNo });
    }
  });
  await CommitteeVote.bulkCreate(committeeVoteDocs);

  const electionDate2 = daysAgo(90);
  const committeeMembers = committeeCandidates; // the "elected" ones now voting for roles
  const managementVoteDocs = [];
  ['Chairman', 'Secretary', 'Treasurer'].forEach((role) => {
    committeeMembers.forEach(({ unit }) => {
      if (Math.random() > 0.3) {
        managementVoteDocs.push({ society: sid, electionDate: electionDate2, role, voterFlatId: unit.flatNo, candidateFlatId: randomChoice(committeeMembers).unit.flatNo });
      }
    });
  });
  await ManagementVote.bulkCreate(managementVoteDocs);

  // ---- Gate Passes (~60), Tasks (~50), Supplies (~20) across the year ----
  const gatePassDocs = [];
  for (let i = 0; i < 60; i++) {
    const { unit } = randomChoice(occupiedUsers);
    const validFrom = daysAgo(randomInt(0, 365));
    gatePassDocs.push({
      society: sid,
      type: randomChoice(['Visitor', 'Vendor', 'Vehicle', 'Service Staff']),
      name: randomName(),
      mobile: chunkPhone(randomInt(1000, 9999)),
      flatNo: unit.flatNo,
      validFrom,
      validTill: new Date(validFrom.getTime() + randomInt(1, 48) * 3600000),
      status: validFrom < daysAgo(2) ? 'Expired' : 'Active',
    });
  }
  await GatePass.bulkCreate(gatePassDocs);

  const taskDocs = [];
  const taskAreas = ['Main Lobby', 'Garden', 'Tower A', 'Tower B', 'Tower C', 'Tower D', 'Tower E', 'Club House', 'Parking Area'];
  for (let i = 0; i < 50; i++) {
    const dueDate = daysAgo(randomInt(-10, 365));
    taskDocs.push({
      society: sid,
      title: `${randomChoice(['Sweep', 'Clean', 'Sanitize', 'Inspect', 'Water plants at'])} ${randomChoice(taskAreas)}`,
      area: randomChoice(taskAreas),
      assignedTo: randomChoice([housekeeping1.name, housekeeping2.name]),
      frequency: randomChoice(['Daily', 'Weekly', 'One-time']),
      priority: randomChoice(['Low', 'Medium', 'High']),
      status: dueDate < new Date() ? randomChoice(['Completed', 'Completed', 'In Progress']) : 'Pending',
      dueDate,
    });
  }
  await Task.bulkCreate(taskDocs);

  await Supply.bulkCreate([
    { society: sid, itemName: 'Floor Cleaner', category: 'Cleaning', quantity: randomInt(0, 20), unit: 'bottles', status: 'In Stock' },
    { society: sid, itemName: 'Garbage Bags', category: 'Cleaning', quantity: randomInt(0, 10), unit: 'packs', status: 'Low Stock' },
    { society: sid, itemName: 'Hand Gloves', category: 'Safety', quantity: 0, unit: 'boxes', status: 'Out of Stock' },
    { society: sid, itemName: 'Mop Set', category: 'Equipment', quantity: randomInt(2, 12), unit: 'pcs', status: 'In Stock' },
    { society: sid, itemName: 'LED Bulbs', category: 'Equipment', quantity: randomInt(0, 30), unit: 'pcs', status: 'In Stock' },
    { society: sid, itemName: 'First Aid Kit', category: 'Safety', quantity: randomInt(1, 5), unit: 'kits', status: 'In Stock' },
  ]);

  // ---- Notices (spread across the year), Polls, Rules, Service Providers, Parking, Role Checklist ----
  const noticeDocs = [];
  for (let i = 0; i < 30; i++) {
    const publishedOn = daysAgo(randomInt(0, 365));
    noticeDocs.push({
      society: sid,
      title: randomChoice(['Maintenance Charges Due Reminder', 'Water Supply Interruption', 'Diwali Celebration Details', 'Parking Rules Update', 'AGM Announcement', 'Lift Maintenance Schedule', 'Security Drill Notice']),
      description: 'Auto-generated seed notice for testing.',
      category: randomChoice(['Finance', 'Maintenance', 'Community', 'Rules & Regulations', 'General']),
      building: randomChoice(['All Towers', 'Tower A', 'Tower B', 'Tower C']),
      status: 'Published',
      publishedOn,
      createdBy: secretary.id,
      createdAt: publishedOn,
    });
  }
  await Notice.bulkCreate(noticeDocs);

  await Poll.bulkCreate([
    { society: sid, title: 'Should we install solar panels on the terrace?', description: 'Proposal to reduce common area electricity costs.', endDate: daysFromNow(10), votesYes: randomInt(30, 60), votesNo: randomInt(5, 20), totalEligible: 90, createdBy: chairman.id },
    { society: sid, title: 'New gym equipment approval', description: 'Vendor quotation attached in Documents section.', endDate: daysAgo(20), votesYes: 52, votesNo: 18, totalEligible: 90, createdBy: chairman.id },
  ]);

  await Rule.bulkCreate([
    { society: sid, category: 'Parking', title: 'One four-wheeler per flat in covered parking', description: 'Additional vehicles must use open/visitor parking. Unauthorized parking is subject to a fine.' },
    { society: sid, category: 'Noise', title: 'Quiet hours 10 PM - 7 AM', description: 'Loud music, construction work, or renovation noise is not permitted during quiet hours.' },
    { society: sid, category: 'Pets', title: 'Pets must be leashed in common areas', description: 'Pet owners are responsible for cleaning up after their pets in all common areas.' },
    { society: sid, category: 'Common Areas', title: 'No commercial activity in common areas', description: 'Common areas including the clubhouse and lobby may not be used for commercial purposes without prior written approval.' },
    { society: sid, category: 'Renovation', title: 'Renovation work requires prior written approval', description: 'Submit renovation plans to the Secretary at least 7 days in advance. Work is only permitted 9 AM - 6 PM on weekdays.' },
  ]);

  await ServiceProviderContact.bulkCreate([
    { society: sid, serviceType: 'Plumber', name: 'Ganesh Plumbing Works', companyName: 'Ganesh Plumbing Works', phone: '9820011111', email: 'ganesh.plumbing@example.com' },
    { society: sid, serviceType: 'Electrician', name: 'Suresh Electricals', companyName: 'Suresh Electricals', phone: '9820022222' },
    { society: sid, serviceType: 'Lift/Elevator Maintenance', name: 'OTIS Service Team', companyName: 'OTIS India', phone: '9820033333', email: 'service@otis-example.com' },
    { society: sid, serviceType: 'Security Agency', name: 'SecureGuard Services', companyName: 'SecureGuard Pvt Ltd', phone: '9820044444' },
    { society: sid, serviceType: 'Pest Control', name: 'PestFree Solutions', companyName: 'PestFree Solutions', phone: '9820055555' },
    { society: sid, serviceType: 'Gardening/Landscaping', name: 'Green Thumb Gardeners', companyName: 'Green Thumb', phone: '9820066666' },
  ]);

  const parkingDocs = [];
  for (let i = 1; i <= 60; i++) {
    const allotted = i <= 45;
    const occ = allotted ? occupiedUsers[i % occupiedUsers.length] : null;
    parkingDocs.push({
      society: sid,
      spotNumber: `P-${String(i).padStart(3, '0')}`,
      spotType: randomChoice(['Covered', 'Open', 'Stilt', 'Basement']),
      flatId: allotted ? occ.unit.flatNo : null,
      vehicleNumber: allotted ? `MH${randomInt(10, 14)} ${randomChoice(['AB', 'CD'])} ${randomInt(1000, 9999)}` : null,
      status: allotted ? 'Allotted' : 'Vacant',
    });
  }
  await ParkingAllotment.bulkCreate(parkingDocs);

  await RoleChecklist.bulkCreate([
    {
      society: sid,
      role: 'chairman',
      items: [
        { id: 'c1', text: 'Chair monthly meetings', done: true },
        { id: 'c2', text: 'Approve annual budget', done: false },
        { id: 'c3', text: 'Review Secretary\'s monthly report', done: true },
      ],
    },
    {
      society: sid,
      role: 'secretary',
      items: [
        { id: 's1', text: 'Publish meeting minutes within 3 days', done: true },
        { id: 's2', text: 'Respond to member complaints within 48 hours', done: true },
        { id: 's3', text: 'Renew society insurance policy', done: false },
        { id: 's4', text: 'Coordinate with vendors for AMC renewals', done: false },
      ],
    },
    {
      society: sid,
      role: 'treasurer',
      items: [
        { id: 't1', text: 'Reconcile bank statements monthly', done: true },
        { id: 't2', text: 'Present financial statements at AGM', done: false },
        { id: 't3', text: 'Follow up on overdue maintenance dues', done: false },
      ],
    },
    {
      society: sid,
      role: 'committee_member',
      items: [
        { id: 'cm1', text: 'Attend at least 75% of meetings', done: true },
        { id: 'cm2', text: 'Represent resident concerns to management', done: false },
      ],
    },
    {
      society: sid,
      role: 'housekeeping',
      items: [
        { id: 'h1', text: 'Open windows to ventilate common areas', done: true },
        { id: 'h2', text: 'Clean and wipe all common-area furniture', done: true },
        { id: 'h3', text: 'Vacuum the lobby floor', done: false },
        { id: 'h4', text: 'Clean mirrors and glass surfaces', done: false },
        { id: 'h5', text: 'Replace used toiletries and supplies', done: false },
      ],
    },
    {
      society: sid,
      role: 'security',
      items: [
        { id: 'sec1', text: 'Log all visitor entries and exits', done: true },
        { id: 'sec2', text: 'Check CCTV footage at shift start', done: true },
        { id: 'sec3', text: 'Conduct perimeter round every 2 hours', done: false },
      ],
    },
  ]);

  console.log('Creating inventory, insurance, support tickets, feedback, utility readings...');
  await InventoryItem.bulkCreate([
    { society: sid, itemName: 'Fire Extinguisher - Tower A', category: 'Fire Safety', location: 'Tower A Lobby', status: 'Working', installationDate: daysAgo(400), nextServiceDue: daysFromNow(60) },
    { society: sid, itemName: 'CCTV Camera - Main Gate', category: 'Security', location: 'Main Gate', status: 'Working', installationDate: daysAgo(300) },
    { society: sid, itemName: 'Diesel Generator', category: 'Electrical', location: 'Basement', status: 'Needs Service', installationDate: daysAgo(600), nextServiceDue: daysAgo(-5) },
    { society: sid, itemName: 'Water Pump - Tower B', category: 'Plumbing', location: 'Tower B Terrace', status: 'Working' },
    { society: sid, itemName: 'CCTV Camera - Parking', category: 'Security', location: 'Parking Area', status: 'Out of Order', installationDate: daysAgo(500) },
  ]);
  await InsurancePolicy.bulkCreate([
    { society: sid, policyType: 'Fire', provider: 'HDFC Ergo', policyNumber: `FIRE-${randomInt(1000, 9999)}`, coverageAmount: 15000000, premiumAmount: 95000, policyStart: daysAgo(200), policyEnd: daysFromNow(165), status: 'Active' },
    { society: sid, policyType: 'Public Liability', provider: 'ICICI Lombard', policyNumber: `PL-${randomInt(1000, 9999)}`, coverageAmount: 5000000, premiumAmount: 32000, policyStart: daysAgo(200), policyEnd: daysFromNow(165), status: 'Active' },
    { society: sid, policyType: 'Burglary', provider: 'New India Assurance', policyNumber: `BUR-${randomInt(1000, 9999)}`, coverageAmount: 2000000, premiumAmount: 12000, policyStart: daysAgo(500), policyEnd: daysAgo(135), status: 'Expired' },
  ]);
  const ticketUsers = occupiedUsers.slice(0, 6);
  await SupportTicket.bulkCreate(
    ticketUsers.map(({ user, unit }, i) => ({
      society: sid,
      raisedBy: user.id,
      flatId: unit.flatNo,
      subject: randomChoice(['App login issue', 'Cannot view invoices', 'Page not loading', 'OTP not received', 'Profile photo upload failing', 'Payment page error']),
      description: 'Auto-generated seed support ticket for testing.',
      status: i < 3 ? randomChoice(['Resolved', 'Closed']) : randomChoice(['Open', 'In Progress']),
      resolvedOn: i < 3 ? daysAgo(randomInt(1, 10)) : null,
    }))
  );
  const feedbackUsers = occupiedUsers.slice(0, 15);
  await Feedback.bulkCreate(
    feedbackUsers.map(({ user, unit }) => ({
      society: sid,
      submittedBy: user.id,
      flatId: unit.flatNo,
      category: randomChoice(['Management', 'Amenities', 'Meeting', 'Staff', 'Other']),
      targetName: randomChoice(['Gym', 'Swimming Pool', 'Secretary', 'Security Staff', 'Annual General Meeting']),
      rating: randomInt(2, 5),
      comments: randomChoice(['Good overall experience.', 'Could be improved.', 'Very satisfied.', 'Needs attention.', 'Excellent service.']),
    }))
  );
  const utilityDocs = [];
  for (let m = 0; m < 12; m++) {
    const month = new Date(daysAgo(m * 30)).toISOString().slice(0, 8) + '01';
    utilityDocs.push({ society: sid, utilityType: 'Electricity', scope: 'Common Area', month, unitsConsumed: randomInt(3000, 5500), isAbnormal: Math.random() > 0.85 });
    utilityDocs.push({ society: sid, utilityType: 'Water', scope: 'Common Area', month, unitsConsumed: randomInt(200, 400), isAbnormal: Math.random() > 0.9 });
  }
  await UtilityReading.bulkCreate(utilityDocs);

  console.log(`Sunrise Heights seeded: 100 flats (${ownerIdx.length} owner, ${tenantIdx.size} tenant, ${vacantIdx.size} vacant, 1 for-sale), 1 year of history across all modules.`);
  console.log('  Secretary   -> secretary@sunriseheights.com / phone 7000000001');
  console.log('  Chairman    -> chairman@sunriseheights.com / phone 7000000002');
  console.log('  Treasurer   -> treasurer@sunriseheights.com / phone 7000000003');
  console.log('  Accountant  -> accountant@sunriseheights.com / phone 7000000004');
  console.log('  Security    -> security1@sunriseheights.com / phone 7000000005');
  console.log('  Housekeeping-> housekeeping1@sunriseheights.com / phone 7000000007');
  console.log('  Owners/Tenants -> owner{N}@sunriseheights.com / tenant{N}@sunriseheights.com (N = 0..99), all password 123456');

  return { society: society.name, totalFlats: 100 };
};

module.exports = seedLargeSociety;
