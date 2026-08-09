-- ============================================================================
-- SOCIETY MANAGEMENT SYSTEM - PostgreSQL Database Schema
-- ============================================================================
-- Production-ready schema for comprehensive society management
-- ============================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- PART 1: CORE MASTER TABLES
-- ============================================================================

-- Society Master
CREATE TABLE societies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(50),
    registration_number VARCHAR(100) UNIQUE,
    registration_date DATE,
    pan VARCHAR(15),
    gst VARCHAR(20),
    tan VARCHAR(20),
    registered_address TEXT,
    correspondence_address TEXT,
    official_email VARCHAR(255),
    official_mobile VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    CONSTRAINT society_active CHECK (is_active IN (TRUE, FALSE))
);

-- Building Master
CREATE TABLE buildings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id),
    name VARCHAR(100) NOT NULL,
    block_number VARCHAR(50),
    floors INTEGER,
    units_per_floor INTEGER,
    address TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(society_id, name)
);

-- Unit Master (Flats/Apartments)
CREATE TABLE units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    building_id UUID NOT NULL REFERENCES buildings(id),
    unit_number VARCHAR(50) NOT NULL,
    floor_number INTEGER,
    unit_type VARCHAR(50), -- 1BHK, 2BHK, etc.
    unit_area DECIMAL(10, 2),
    occupancy_status VARCHAR(50) DEFAULT 'Vacant', -- Owned, Rented, Vacant, Under renovation, Locked, Commercial
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(building_id, unit_number)
);

-- ============================================================================
-- PART 2: MEMBER & RESIDENT MANAGEMENT
-- ============================================================================

-- Person (Core identity table)
CREATE TABLE persons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    mobile VARCHAR(20) UNIQUE,
    alternate_mobile VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(20),
    aadhar_number VARCHAR(20),
    pan_number VARCHAR(15),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    identity_verification_status VARCHAR(50) DEFAULT 'Pending', -- Pending, Submitted, Verified, Rejected
    verification_date DATE,
    verified_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID
);

-- Membership (Person's membership in society)
CREATE TABLE memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_id UUID NOT NULL REFERENCES persons(id),
    society_id UUID NOT NULL REFERENCES societies(id),
    membership_status VARCHAR(50) DEFAULT 'Pending', -- Pending, Active, Suspended, Expired, Former, Deceased
    member_type VARCHAR(50), -- Owner, Tenant, Guest, Security, Staff
    join_date DATE NOT NULL,
    expiry_date DATE,
    is_primary BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(person_id, society_id)
);

-- Unit Ownership & Tenancy
CREATE TABLE unit_occupants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unit_id UUID NOT NULL REFERENCES units(id),
    person_id UUID NOT NULL REFERENCES persons(id),
    relationship_type VARCHAR(50) NOT NULL, -- Owner, Co-owner, Tenant
    is_primary BOOLEAN DEFAULT TRUE,
    occupancy_start_date DATE NOT NULL,
    occupancy_end_date DATE,
    ownership_percentage DECIMAL(5, 2), -- For co-owners
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(unit_id, person_id, relationship_type, occupancy_start_date)
);

-- Unit Occupancy History
CREATE TABLE unit_occupancy_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unit_id UUID NOT NULL REFERENCES units(id),
    person_id UUID NOT NULL REFERENCES persons(id),
    relationship_type VARCHAR(50),
    start_date DATE NOT NULL,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tenant Agreement
CREATE TABLE tenant_agreements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unit_id UUID NOT NULL REFERENCES units(id),
    tenant_person_id UUID NOT NULL REFERENCES persons(id),
    owner_person_id UUID NOT NULL REFERENCES persons(id),
    agreement_start_date DATE NOT NULL,
    agreement_end_date DATE NOT NULL,
    renewal_date DATE,
    notice_period_days INTEGER DEFAULT 30,
    agreement_document_url TEXT,
    verification_status VARCHAR(50) DEFAULT 'Pending', -- Pending, Submitted, Verified, Rejected, Expired
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Family Member Relationship
CREATE TABLE family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    primary_person_id UUID NOT NULL REFERENCES persons(id),
    family_person_id UUID NOT NULL REFERENCES persons(id),
    relationship VARCHAR(100), -- Spouse, Child, Parent, Sibling, etc.
    access_level VARCHAR(50) DEFAULT 'Limited', -- Full, Limited, View-only, None
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(primary_person_id, family_person_id)
);

-- ============================================================================
-- PART 3: ROLES & PERMISSIONS
-- ============================================================================

-- Role Master
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID REFERENCES societies(id), -- NULL for system roles
    role_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(society_id, role_name)
);

-- Permission Master
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    permission_code VARCHAR(100) UNIQUE NOT NULL,
    permission_name VARCHAR(255),
    resource VARCHAR(100),
    action VARCHAR(50), -- CREATE, READ, UPDATE, DELETE, APPROVE, etc.
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Role-Permission Mapping
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    scope_level VARCHAR(50) DEFAULT 'SOCIETY', -- SOCIETY, BUILDING, UNIT, PERSON
    scope_value UUID, -- Building ID or Unit ID for scoped permissions
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(role_id, permission_id, scope_level, scope_value)
);

-- Member Role Assignment
CREATE TABLE member_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    membership_id UUID NOT NULL REFERENCES memberships(id),
    role_id UUID NOT NULL REFERENCES roles(id),
    assignment_date DATE NOT NULL,
    expiry_date DATE,
    assigned_by UUID REFERENCES persons(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(membership_id, role_id, assignment_date)
);

-- ============================================================================
-- PART 4: FINANCIAL MANAGEMENT
-- ============================================================================

-- Charge Type Master
CREATE TABLE charge_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id),
    charge_name VARCHAR(100) NOT NULL,
    charge_code VARCHAR(50),
    description TEXT,
    is_recurring BOOLEAN DEFAULT TRUE,
    calculation_method VARCHAR(50), -- Fixed, Per Unit, Percentage, Formula
    gl_account_id VARCHAR(100), -- General Ledger account code
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(society_id, charge_code)
);

-- Charge Configuration (Versioned - effective date based)
CREATE TABLE charge_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    charge_type_id UUID NOT NULL REFERENCES charge_types(id),
    applicable_to VARCHAR(50), -- Owner, Tenant, Both, Specific_Members
    amount DECIMAL(12, 2),
    percentage DECIMAL(5, 2),
    effective_from_date DATE NOT NULL,
    effective_to_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(charge_type_id, applicable_to, effective_from_date)
);

-- Maintenance Bill
CREATE TABLE maintenance_bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id),
    unit_id UUID NOT NULL REFERENCES units(id),
    bill_month DATE NOT NULL,
    bill_year INTEGER NOT NULL,
    bill_date DATE NOT NULL,
    due_date DATE NOT NULL,
    bill_status VARCHAR(50) DEFAULT 'Generated', -- Generated, Finalized, Partial Paid, Fully Paid, Overdue, Waived
    total_amount DECIMAL(12, 2) DEFAULT 0,
    paid_amount DECIMAL(12, 2) DEFAULT 0,
    outstanding_amount DECIMAL(12, 2) DEFAULT 0,
    bill_revision_count INTEGER DEFAULT 0,
    original_bill_id UUID REFERENCES maintenance_bills(id), -- If revised
    is_locked BOOLEAN DEFAULT FALSE,
    locked_by UUID,
    locked_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(society_id, unit_id, bill_month, bill_year)
);

-- Bill Line Items (Individual charges)
CREATE TABLE bill_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_id UUID NOT NULL REFERENCES maintenance_bills(id) ON DELETE CASCADE,
    charge_type_id UUID NOT NULL REFERENCES charge_types(id),
    description VARCHAR(255),
    quantity DECIMAL(10, 2) DEFAULT 1,
    unit_price DECIMAL(12, 2),
    tax_applicable BOOLEAN DEFAULT FALSE,
    tax_rate DECIMAL(5, 2),
    tax_amount DECIMAL(12, 2) DEFAULT 0,
    line_total DECIMAL(12, 2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Payment Master
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id),
    bill_id UUID REFERENCES maintenance_bills(id),
    person_id UUID NOT NULL REFERENCES persons(id),
    payment_date DATE NOT NULL,
    payment_amount DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(50), -- Online, Bank Transfer, Cash, Cheque, UPI, Wallet
    payment_status VARCHAR(50) DEFAULT 'Initiated', -- Initiated, Pending, Captured, Failed, Reconciled, Refunded
    payment_reference VARCHAR(255),
    gateway_transaction_id VARCHAR(255),
    gateway_response_code VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    reconciled_at TIMESTAMP,
    reconciled_by UUID
);

-- Payment Allocation (Payment to multiple bills)
CREATE TABLE payment_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    bill_id UUID NOT NULL REFERENCES maintenance_bills(id),
    allocated_amount DECIMAL(12, 2) NOT NULL,
    allocation_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(payment_id, bill_id)
);

-- Advance Payment
CREATE TABLE advance_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_id UUID NOT NULL REFERENCES persons(id),
    unit_id UUID NOT NULL REFERENCES units(id),
    payment_id UUID NOT NULL REFERENCES payments(id),
    advance_amount DECIMAL(12, 2) NOT NULL,
    advance_for_months INTEGER,
    utilized_amount DECIMAL(12, 2) DEFAULT 0,
    balance_amount DECIMAL(12, 2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Cheque Management
CREATE TABLE cheque_management (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID NOT NULL REFERENCES payments(id),
    cheque_number VARCHAR(20) NOT NULL,
    bank_name VARCHAR(100),
    cheque_date DATE,
    cheque_amount DECIMAL(12, 2),
    cheque_status VARCHAR(50) DEFAULT 'Deposited', -- Issued, Received, Deposited, Cleared, Bounced, Cancelled
    cleared_date DATE,
    bounce_reason VARCHAR(255),
    bank_account_id UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(payment_id, cheque_number)
);

-- Penalty Configuration
CREATE TABLE penalty_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id),
    penalty_type VARCHAR(50), -- Late payment, Rule violation, etc.
    penalty_percentage DECIMAL(5, 2),
    grace_period_days INTEGER,
    apply_after_days INTEGER,
    max_penalty_percentage DECIMAL(5, 2),
    effective_from_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(society_id, penalty_type, effective_from_date)
);

-- Penalty Calculation & Tracking
CREATE TABLE penalties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_id UUID NOT NULL REFERENCES maintenance_bills(id),
    person_id UUID NOT NULL REFERENCES persons(id),
    penalty_type VARCHAR(50),
    penalty_amount DECIMAL(12, 2),
    penalty_reason TEXT,
    waived_amount DECIMAL(12, 2) DEFAULT 0,
    waived_by UUID,
    waived_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Bank Account Master
CREATE TABLE bank_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id),
    account_holder_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(50) UNIQUE NOT NULL,
    ifsc_code VARCHAR(20),
    bank_name VARCHAR(255),
    branch_name VARCHAR(255),
    account_type VARCHAR(50), -- Current, Savings, FD, etc.
    account_purpose VARCHAR(255),
    opening_balance DECIMAL(12, 2) DEFAULT 0,
    current_balance DECIMAL(12, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Active', -- Active, Closed, Dormant
    authorized_signatories TEXT,
    opening_date DATE,
    closing_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Bank Reconciliation
CREATE TABLE bank_reconciliations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bank_account_id UUID NOT NULL REFERENCES bank_accounts(id),
    statement_date DATE NOT NULL,
    statement_balance DECIMAL(12, 2),
    ledger_balance DECIMAL(12, 2),
    reconciliation_status VARCHAR(50) DEFAULT 'Pending', -- Pending, In Progress, Reconciled, Exception
    matched_transactions INTEGER DEFAULT 0,
    unmatched_transactions INTEGER DEFAULT 0,
    reconciled_by UUID,
    reconciliation_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(bank_account_id, statement_date)
);

-- Fund Master
CREATE TABLE funds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id),
    fund_name VARCHAR(100) NOT NULL,
    fund_code VARCHAR(50),
    description TEXT,
    fund_type VARCHAR(50), -- General, Repair, Sinking, Emergency, Celebration, Building-specific, Special
    opening_balance DECIMAL(12, 2) DEFAULT 0,
    current_balance DECIMAL(12, 2) DEFAULT 0,
    restricted_usage BOOLEAN DEFAULT FALSE,
    usage_rules TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(society_id, fund_code)
);

-- Fund Transfer
CREATE TABLE fund_transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_fund_id UUID NOT NULL REFERENCES funds(id),
    destination_fund_id UUID NOT NULL REFERENCES funds(id),
    transfer_amount DECIMAL(12, 2) NOT NULL,
    transfer_date DATE NOT NULL,
    transfer_reason TEXT,
    approval_status VARCHAR(50) DEFAULT 'Pending', -- Pending, Approved, Rejected
    approved_by UUID REFERENCES persons(id),
    approval_date DATE,
    created_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CHECK (source_fund_id != destination_fund_id)
);

-- Investment Master
CREATE TABLE investments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fund_id UUID NOT NULL REFERENCES funds(id),
    investment_type VARCHAR(50), -- FD, Bond, Mutual Fund, etc.
    institution_name VARCHAR(255),
    principal_amount DECIMAL(12, 2) NOT NULL,
    interest_rate DECIMAL(5, 2),
    start_date DATE NOT NULL,
    maturity_date DATE NOT NULL,
    expected_maturity_amount DECIMAL(12, 2),
    actual_maturity_amount DECIMAL(12, 2),
    renewal_date DATE,
    investment_status VARCHAR(50) DEFAULT 'Active', -- Active, Matured, Redeemed, Renewed
    supporting_document_url TEXT,
    created_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Expense Master
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id),
    fund_id UUID REFERENCES funds(id),
    expense_date DATE NOT NULL,
    vendor_id UUID,
    expense_category VARCHAR(100),
    description TEXT,
    amount DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'Pending', -- Pending, Approved, Paid
    approved_by UUID REFERENCES persons(id),
    approval_date DATE,
    supporting_document_url TEXT,
    created_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- PART 5: VENDOR & PROCUREMENT
-- ============================================================================

-- Vendor Master
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id),
    vendor_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    mobile VARCHAR(20),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    pan_number VARCHAR(15),
    gst_number VARCHAR(20),
    bank_account VARCHAR(50),
    bank_ifsc VARCHAR(20),
    bank_name VARCHAR(255),
    vendor_type VARCHAR(50), -- Service, Supply, Contractor, etc.
    category VARCHAR(100),
    rating DECIMAL(3, 2),
    is_approved BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(society_id, vendor_name)
);

-- Quotation Request
CREATE TABLE quotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id),
    project_id UUID,
    description TEXT NOT NULL,
    quotation_date DATE NOT NULL,
    quotation_deadline DATE,
    quotation_status VARCHAR(50) DEFAULT 'Requested', -- Requested, Received, Approved, Rejected, Expired
    created_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Quotation Details
CREATE TABLE quotation_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES vendors(id),
    quoted_amount DECIMAL(12, 2),
    taxes DECIMAL(12, 2) DEFAULT 0,
    total_quoted_amount DECIMAL(12, 2),
    validity_period_days INTEGER,
    delivery_period_days INTEGER,
    terms_and_conditions TEXT,
    status VARCHAR(50) DEFAULT 'Received', -- Received, Under Review, Selected, Rejected
    received_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Purchase Order
CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id),
    project_id UUID,
    vendor_id UUID NOT NULL REFERENCES vendors(id),
    po_date DATE NOT NULL,
    po_number VARCHAR(100) UNIQUE NOT NULL,
    quotation_id UUID REFERENCES quotations(id),
    description TEXT,
    amount DECIMAL(12, 2),
    taxes DECIMAL(12, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2),
    delivery_date DATE,
    po_status VARCHAR(50) DEFAULT 'Pending', -- Pending, Confirmed, Received, Completed, Cancelled
    created_by UUID,
    approved_by UUID REFERENCES persons(id),
    approval_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Invoice
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id),
    vendor_id UUID NOT NULL REFERENCES vendors(id),
    po_id UUID REFERENCES purchase_orders(id),
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE,
    description TEXT,
    subtotal DECIMAL(12, 2),
    tax_amount DECIMAL(12, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2),
    paid_amount DECIMAL(12, 2) DEFAULT 0,
    outstanding_amount DECIMAL(12, 2),
    invoice_status VARCHAR(50) DEFAULT 'Received', -- Received, Verified, Approved, Paid, Cancelled
    verified_by UUID REFERENCES persons(id),
    verified_date DATE,
    approved_by UUID REFERENCES persons(id),
    approval_date DATE,
    supporting_document_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tax Configuration
CREATE TABLE tax_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id),
    tax_name VARCHAR(100) NOT NULL,
    tax_rate DECIMAL(5, 2),
    tax_threshold DECIMAL(12, 2),
    applicable_to VARCHAR(50), -- Vendor, Employee, Member, etc.
    effective_from_date DATE NOT NULL,
    effective_to_date DATE,
    tax_deposit_account VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(society_id, tax_name, effective_from_date)
);

-- Tax Deduction Records
CREATE TABLE tax_deductions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    tax_configuration_id UUID NOT NULL REFERENCES tax_configurations(id),
    gross_amount DECIMAL(12, 2),
    tax_rate DECIMAL(5, 2),
    tax_amount DECIMAL(12, 2),
    net_amount DECIMAL(12, 2),
    certificate_issued BOOLEAN DEFAULT FALSE,
    certificate_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- PART 6: COMMITTEE & GOVERNANCE
-- ============================================================================

-- Committee Master
CREATE TABLE committees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id),
    committee_type VARCHAR(50), -- Managing, Election, etc.
    term_start_date DATE NOT NULL,
    term_end_date DATE NOT NULL,
    total_members INTEGER,
    status VARCHAR(50) DEFAULT 'Active', -- Active, Inactive, Completed
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(society_id, committee_type, term_start_date)
);

-- Committee Member
CREATE TABLE committee_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    committee_id UUID NOT NULL REFERENCES committees(id),
    person_id UUID NOT NULL REFERENCES persons(id),
    position VARCHAR(100), -- Chairman, Vice Chairman, Secretary, Treasurer, etc.
    is_primary BOOLEAN DEFAULT FALSE,
    member_status VARCHAR(50) DEFAULT 'Active', -- Active, Resigned, Removed, Completed
    appointment_date DATE NOT NULL,
    removal_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(committee_id, person_id, position)
);

-- Committee Handover Checklist
CREATE TABLE committee_handover_checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    committee_id UUID NOT NULL REFERENCES committees(id),
    outgoing_member_id UUID NOT NULL REFERENCES committee_members(id),
    incoming_member_id UUID NOT NULL REFERENCES committee_members(id),
    handover_date DATE NOT NULL,
    handover_status VARCHAR(50) DEFAULT 'Pending', -- Pending, In Progress, Completed
    completed_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Checklist Items
CREATE TABLE checklist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    checklist_id UUID NOT NULL REFERENCES committee_handover_checklists(id),
    item_description VARCHAR(255) NOT NULL,
    item_status VARCHAR(50) DEFAULT 'Pending', -- Pending, Completed
    evidence_document_url TEXT,
    notes TEXT,
    completed_by UUID REFERENCES persons(id),
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Election Master
CREATE TABLE elections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id),
    election_date DATE NOT NULL,
    election_type VARCHAR(50), -- Committee, Board, etc.
    nomination_start_date DATE,
    nomination_end_date DATE,
    voting_start_date DATE,
    voting_end_date DATE,
    election_status VARCHAR(50) DEFAULT 'Pending', -- Pending, In Progress, Completed, Cancelled
    election_result_status VARCHAR(50) DEFAULT 'Pending', -- Pending, Declared, Disputed
    eligible_voters INTEGER,
    total_votes_cast INTEGER,
    result_declared_date DATE,
    created_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(society_id, election_date, election_type)
);

-- Candidates
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    election_id UUID NOT NULL REFERENCES elections(id),
    person_id UUID NOT NULL REFERENCES persons(id),
    position VARCHAR(100),
    nomination_date DATE,
    candidacy_status VARCHAR(50) DEFAULT 'Nominated', -- Nominated, Approved, Rejected, Withdrawn, Elected, Defeated
    votes_received INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(election_id, person_id, position)
);

-- Voting Records
CREATE TABLE voting_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    election_id UUID NOT NULL REFERENCES elections(id),
    voter_person_id UUID NOT NULL REFERENCES persons(id),
    position VARCHAR(100),
    voted_for_person_id UUID NOT NULL REFERENCES persons(id),
    vote_timestamp TIMESTAMP NOT NULL,
    voting_device VARCHAR(100),
    verification_status VARCHAR(50) DEFAULT 'Verified',
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(election_id, voter_person_id, position)
);

-- Meeting Master
CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id),
    committee_id UUID REFERENCES committees(id),
    meeting_type VARCHAR(50), -- AGM, Regular, Special, Committee
    meeting_date DATE NOT NULL,
    meeting_time TIME,
    venue VARCHAR(255),
    meeting_status VARCHAR(50) DEFAULT 'Scheduled', -- Scheduled, In Progress, Completed, Cancelled
    quorum_requirement INTEGER,
    members_present INTEGER,
    quorum_met BOOLEAN DEFAULT FALSE,
    meeting_minutes TEXT,
    created_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(society_id, meeting_type, meeting_date)
);

-- Meeting Agenda
CREATE TABLE meeting_agendas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES meetings(id),
    agenda_item_number INTEGER,
    agenda_title VARCHAR(255) NOT NULL,
    agenda_description TEXT,
    estimated_time_minutes INTEGER,
    supporting_document_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(meeting_id, agenda_item_number)
);

-- Meeting Attendance
CREATE TABLE meeting_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES meetings(id),
    person_id UUID NOT NULL REFERENCES persons(id),
    attendance_status VARCHAR(50) DEFAULT 'Absent', -- Present, Absent, Excused
    sign_in_time TIMESTAMP,
    sign_out_time TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(meeting_id, person_id)
);

-- Resolution Master
CREATE TABLE resolutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES meetings(id),
    resolution_number VARCHAR(50),
    resolution_title VARCHAR(255) NOT NULL,
    resolution_description TEXT NOT NULL,
    resolution_status VARCHAR(50) DEFAULT 'Proposed', -- Proposed, Seconded, Voted, Passed, Rejected
    votes_for INTEGER DEFAULT 0,
    votes_against INTEGER DEFAULT 0,
    votes_abstain INTEGER DEFAULT 0,
    resolution_passed BOOLEAN DEFAULT FALSE,
    created_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(meeting_id, resolution_number)
);

-- Resolution Voting
CREATE TABLE resolution_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resolution_id UUID NOT NULL REFERENCES resolutions(id),
    person_id UUID NOT NULL REFERENCES persons(id),
    vote_choice VARCHAR(50), -- For, Against, Abstain
    vote_timestamp TIMESTAMP NOT NULL,
    verification_status VARCHAR(50) DEFAULT 'Verified',
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(resolution_id, person_id)
);

-- ============================================================================
-- PART 7: SECURITY & VISITOR MANAGEMENT
-- ============================================================================

-- Visitor Registration
CREATE TABLE visitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id),
    visitor_name VARCHAR(255) NOT NULL,
    visitor_phone VARCHAR(20),
    visitor_email VARCHAR(255),
    id_proof_type VARCHAR(50), -- Aadhar, Passport, DL, etc.
    id_proof_number VARCHAR(50),
    id_proof_document_url TEXT,
    visitor_category VARCHAR(50), -- Personal, Delivery, Service, Professional, Vendor
    is_blacklisted BOOLEAN DEFAULT FALSE,
    blacklist_reason VARCHAR(255),
    blacklist_until_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Visitor Visits
CREATE TABLE visitor_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visitor_id UUID NOT NULL REFERENCES visitors(id),
    unit_id UUID NOT NULL REFERENCES units(id),
    resident_person_id UUID NOT NULL REFERENCES persons(id),
    visit_date DATE NOT NULL,
    visit_start_time TIME NOT NULL,
    visit_end_time TIME,
    approved_until_time TIME,
    visit_purpose VARCHAR(255),
    approval_status VARCHAR(50) DEFAULT 'Pending', -- Pending, Approved, Rejected, Expired
    approved_by UUID REFERENCES persons(id),
    approval_date DATE,
    pass_number VARCHAR(100),
    pass_qr_code TEXT,
    visit_status VARCHAR(50) DEFAULT 'Pending', -- Pending, Entry, In Progress, Exit, Completed, Cancelled
    entry_time TIMESTAMP,
    exit_time TIMESTAMP,
    security_verified_by UUID,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Recurring Visitor Schedule
CREATE TABLE recurring_visitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visitor_id UUID NOT NULL REFERENCES visitors(id),
    unit_id UUID NOT NULL REFERENCES units(id),
    resident_person_id UUID NOT NULL REFERENCES persons(id),
    visit_purpose VARCHAR(255),
    schedule_type VARCHAR(50), -- Daily, Weekly, Monthly, Custom
    schedule_details JSONB, -- Stores schedule data
    schedule_start_date DATE,
    schedule_end_date DATE,
    approval_status VARCHAR(50) DEFAULT 'Pending',
    approved_by UUID REFERENCES persons(id),
    approval_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Vehicle Registration
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id),
    unit_id UUID NOT NULL REFERENCES units(id),
    owner_person_id UUID NOT NULL REFERENCES persons(id),
    vehicle_number VARCHAR(20) UNIQUE NOT NULL,
    vehicle_type VARCHAR(50), -- Car, Bike, Truck, Auto, etc.
    vehicle_brand VARCHAR(100),
    vehicle_model VARCHAR(100),
    vehicle_color VARCHAR(50),
    registration_date DATE,
    rc_number VARCHAR(50),
    rc_document_url TEXT,
    insurance_valid_until DATE,
    insurance_document_url TEXT,
    parking_slot_assigned VARCHAR(50),
    vehicle_status VARCHAR(50) DEFAULT 'Active', -- Active, Inactive, Sold, Exited
    sticker_number VARCHAR(100),
    sticker_status VARCHAR(50) DEFAULT 'Active', -- Active, Expired, Blocked, Lost
    is_blacklisted BOOLEAN DEFAULT FALSE,
    blacklist_reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(society_id, vehicle_number)
);

-- Parking Management
CREATE TABLE parking_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id),
    building_id UUID REFERENCES buildings(id),
    parking_level VARCHAR(50),
    parking_slot_number VARCHAR(50) NOT NULL,
    parking_type VARCHAR(50), -- Covered, Open, Reserved
    vehicle_id UUID REFERENCES vehicles(id),
    assigned_to_unit_id UUID REFERENCES units(id),
    allocated_person_id UUID REFERENCES persons(id),
    allocation_start_date DATE,
    allocation_end_date DATE,
    monthly_charge DECIMAL(12, 2),
    parking_status VARCHAR(50) DEFAULT 'Available', -- Available, Allocated, Blocked, Reserved
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(society_id, parking_slot_number)
);

-- Access Card Management
CREATE TABLE access_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id),
    person_id UUID NOT NULL REFERENCES persons(id),
    unit_id UUID REFERENCES units(id),
    card_number VARCHAR(100) UNIQUE NOT NULL,
    card_type VARCHAR(50), -- RFID, Smart Card, Magnetic, etc.
    access_areas TEXT, -- JSON: gate, building, unit level access
    issue_date DATE NOT NULL,
    expiry_date DATE,
    status VARCHAR(50) DEFAULT 'Active', -- Active, Blocked, Expired, Lost, Replaced
    card_status_reason VARCHAR(255),
    replacement_of_card_id UUID REFERENCES access_cards(id),
    replacement_reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Gate Management
CREATE TABLE gates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id),
    gate_name VARCHAR(100) NOT NULL,
    gate_type VARCHAR(50), -- Main, Service, Pedestrian
    gate_location VARCHAR(255),
    shift_requirement BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(society_id, gate_name)
);

-- Security Guard Shift
CREATE TABLE security_shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id),
    gate_id UUID NOT NULL REFERENCES gates(id),
    guard_person_id UUID NOT NULL REFERENCES persons(id),
    shift_date DATE NOT NULL,
    shift_start_time TIME NOT NULL,
    shift_end_time TIME NOT NULL,
    shift_status VARCHAR(50) DEFAULT 'Scheduled', -- Scheduled, In Progress, Completed, No Show, Cancelled
    actual_checkin_time TIMESTAMP,
    actual_checkout_time TIMESTAMP,
    handover_status VARCHAR(50) DEFAULT 'Pending', -- Pending, Completed, Incomplete
    handover_completed_by UUID REFERENCES persons(id),
    handover_time TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(gate_id, shift_date, shift_start_time, guard_person_id)
);

-- Guard Handover Checklist
CREATE TABLE guard_handover_checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shift_id UUID NOT NULL REFERENCES security_shifts(id),
    item_name VARCHAR(255),
    item_status VARCHAR(50) DEFAULT 'Not Checked', -- OK, Damaged, Missing, Handed Over, Retained
    item_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Security Incident
CREATE TABLE security_incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id),
    incident_date DATE NOT NULL,
    incident_time TIME,
    incident_type VARCHAR(100),
    incident_location VARCHAR(255),
    incident_severity VARCHAR(50), -- Low, Medium, High, Critical
    reported_by UUID NOT NULL REFERENCES persons(id),
    description TEXT,
    evidence_document_url TEXT,
    witness_details TEXT,
    assigned_to UUID REFERENCES persons(id),
    action_taken TEXT,
    incident_status VARCHAR(50) DEFAULT 'Open', -- Open, Under Investigation, Resolved, Closed
    resolved_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- PART 8: ASSETS & MAINTENANCE
-- ============================================================================

-- Asset Master
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id),
    building_id UUID REFERENCES buildings(id),
    asset_name VARCHAR(255) NOT NULL,
    asset_type VARCHAR(50), -- Lift, Generator, Tank, Pump, Motor, Electrical, etc.
    asset_code VARCHAR(100),
    location_description VARCHAR(255),
    purchase_date DATE,
    purchase_cost DECIMAL(12, 2),
    warranty_until_date DATE,
    depreciation_rate DECIMAL(5, 2),
    current_asset_value DECIMAL(12, 2),
    asset_status VARCHAR(50) DEFAULT 'Active', -- Active, Maintenance, Non-functional, Scrapped
    manual_document_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(society_id, asset_code)
);

-- Asset Maintenance History
CREATE TABLE asset_maintenance_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID NOT NULL REFERENCES assets(id),
    maintenance_date DATE,
    maintenance_type VARCHAR(50), -- Preventive, Breakdown, Repair, Inspection
    vendor_id UUID REFERENCES vendors(id),
    description TEXT,
    cost DECIMAL(12, 2),
    maintenance_status VARCHAR(50) DEFAULT 'Completed',
    document_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- AMC (Annual Maintenance Contract)
CREATE TABLE amc_contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID NOT NULL REFERENCES assets(id),
    vendor_id UUID NOT NULL REFERENCES vendors(id),
    amc_start_date DATE NOT NULL,
    amc_end_date DATE NOT NULL,
    annual_cost DECIMAL(12, 2),
    contract_terms TEXT,
    visit_frequency VARCHAR(50), -- Monthly, Quarterly, Bi-annual, Annual
    last_visit_date DATE,
    next_visit_due_date DATE,
    amc_status VARCHAR(50) DEFAULT 'Active', -- Active, Expired, Renewed, Cancelled
    contract_document_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(asset_id, amc_start_date)
);

-- Utility Outage Management
CREATE TABLE utility_outages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id),
    utility_type VARCHAR(50), -- Water, Electricity, Gas, Internet, etc.
    affected_buildings TEXT, -- JSON array of building IDs
    affected_units TEXT, -- JSON array of unit IDs
    outage_type VARCHAR(50), -- Planned, Unplanned
    outage_start_datetime TIMESTAMP NOT NULL,
    estimated_restoration_datetime TIMESTAMP,
    actual_restoration_datetime TIMESTAMP,
    outage_reason TEXT,
    responsible_vendor_id UUID REFERENCES vendors(id),
    responsible_authority VARCHAR(255),
    impact_assessment TEXT,
    notification_sent BOOLEAN DEFAULT FALSE,
    notification_method VARCHAR(50),
    member_acknowledgment_required BOOLEAN DEFAULT FALSE,
    acknowledgments_received INTEGER DEFAULT 0,
    expected_members_to_acknowledge INTEGER,
    created_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Outage Acknowledgements
CREATE TABLE outage_acknowledgements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    outage_id UUID NOT NULL REFERENCES utility_outages(id),
    person_id UUID NOT NULL REFERENCES persons(id),
    acknowledged_at TIMESTAMP NOT NULL,
    acknowledgment_method VARCHAR(50), -- App, SMS, Call, In-person
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(outage_id, person_id)
);

-- ============================================================================
-- PART 9: COMPLAINTS & GRIEVANCES
-- ============================================================================

-- Complaint Master
CREATE TABLE complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id),
    complaint_number VARCHAR(50) UNIQUE NOT NULL, -- REQ-2026-000123
    complaint_date DATE NOT NULL,
    complainant_person_id UUID NOT NULL REFERENCES persons(id),
    complaint_category VARCHAR(50), -- Maintenance, Security, Cleanliness, Noise, Parking, etc.
    complaint_severity VARCHAR(50), -- Low, Medium, High, Critical
    complaint_description TEXT NOT NULL,
    complaint_status VARCHAR(50) DEFAULT 'Open', -- Open, In Progress, Resolved, Closed, Reopened
    assigned_to_person_id UUID REFERENCES persons(id),
    sla_due_date DATE,
    resolved_date DATE,
    resolution_description TEXT,
    internal_notes TEXT, -- Not visible to member
    member_visible_notes TEXT,
    supporting_document_url TEXT,
    resolution_feedback_rating INTEGER, -- 1-5
    resolution_feedback_comments TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Complaint Communication History
CREATE TABLE complaint_communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID NOT NULL REFERENCES complaints(id),
    communication_date TIMESTAMP NOT NULL,
    communication_type VARCHAR(50), -- Internal Note, Member Update, Assignment, Resolution
    message_text TEXT,
    message_from_person_id UUID NOT NULL REFERENCES persons(id),
    is_visible_to_member BOOLEAN DEFAULT FALSE,
    attachment_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- PART 10: DOCUMENTS & NOTICES
-- ============================================================================

-- Document Master
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id),
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(50), -- Bylaws, Rules, Certificate, NOC, Contract, Agreement, etc.
    document_category VARCHAR(100),
    document_date DATE,
    expiry_date DATE,
    document_url TEXT,
    version_number INTEGER DEFAULT 1,
    is_latest_version BOOLEAN DEFAULT TRUE,
    digital_signature_applied BOOLEAN DEFAULT FALSE,
    signature_by_person_id UUID REFERENCES persons(id),
    signature_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- NOC (No Objection Certificate) Request
CREATE TABLE noc_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id),
    requested_by_person_id UUID NOT NULL REFERENCES persons(id),
    unit_id UUID REFERENCES units(id),
    noc_type VARCHAR(50), -- Transfer, Sale, Rental, etc.
    requested_date DATE NOT NULL,
    noc_reason TEXT,
    required_documents TEXT, -- JSON array
    verification_status VARCHAR(50) DEFAULT 'Pending', -- Pending, Documents Submitted, Verified, Approved, Rejected
    approval_status VARCHAR(50) DEFAULT 'Pending', -- Pending, Approved, Rejected
    approved_by_person_id UUID REFERENCES persons(id),
    approval_date DATE,
    noc_certificate_number VARCHAR(100),
    noc_certificate_date DATE,
    noc_valid_until_date DATE,
    noc_document_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Notice & Circular
CREATE TABLE notices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id),
    notice_type VARCHAR(50), -- Notice, Circular, Announcement, Alert
    notice_title VARCHAR(255) NOT NULL,
    notice_content TEXT NOT NULL,
    notice_date DATE NOT NULL,
    expiry_date DATE,
    targeted_to VARCHAR(50), -- All, Owners Only, Tenants Only, Committee Only, Security Only, Building, Custom
    target_building_id UUID REFERENCES buildings(id),
    target_person_ids TEXT, -- JSON array for custom targeting
    notice_status VARCHAR(50) DEFAULT 'Active', -- Active, Archived, Withdrawn
    attachment_url TEXT,
    acknowledgment_required BOOLEAN DEFAULT FALSE,
    acknowledgments_received INTEGER DEFAULT 0,
    expected_recipients INTEGER,
    created_by_person_id UUID NOT NULL REFERENCES persons(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Notice Acknowledgement
CREATE TABLE notice_acknowledgements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notice_id UUID NOT NULL REFERENCES notices(id),
    person_id UUID NOT NULL REFERENCES persons(id),
    acknowledged_date TIMESTAMP NOT NULL,
    acknowledgment_method VARCHAR(50), -- App, SMS, Email, In-person
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(notice_id, person_id)
);

-- ============================================================================
-- PART 11: NUMBERING SYSTEM
-- ============================================================================

-- Document Numbering Sequences
CREATE TABLE document_number_sequences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id),
    document_type VARCHAR(50) NOT NULL, -- Invoice, Receipt, Voucher, etc.
    current_year INTEGER NOT NULL,
    next_sequence_number INTEGER DEFAULT 1,
    prefix VARCHAR(50),
    suffix VARCHAR(50),
    sequence_pattern VARCHAR(100), -- Pattern template
    reset_frequency VARCHAR(50), -- Yearly, Monthly, Manual
    last_reset_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(society_id, document_type, current_year)
);

-- ============================================================================
-- PART 12: COMPLIANCE & AUDIT
-- ============================================================================

-- Audit Log (All transactions)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(100), -- Person, Membership, Payment, Meeting, etc.
    entity_id UUID,
    action_type VARCHAR(50), -- CREATE, UPDATE, DELETE, APPROVE, REJECT, etc.
    old_values JSONB,
    new_values JSONB,
    action_by_person_id UUID REFERENCES persons(id),
    action_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    ip_address VARCHAR(50),
    user_agent TEXT,
    changes_summary TEXT
);

-- Compliance Tasks
CREATE TABLE compliance_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id),
    compliance_name VARCHAR(255) NOT NULL,
    compliance_description TEXT,
    frequency VARCHAR(50), -- One-time, Monthly, Quarterly, Annually, Custom
    due_date DATE NOT NULL,
    responsible_person_id UUID REFERENCES persons(id),
    completion_status VARCHAR(50) DEFAULT 'Pending', -- Pending, In Progress, Completed, Overdue, Escalated
    completion_date DATE,
    completion_evidence_url TEXT,
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_sent_date DATE,
    escalation_level INTEGER DEFAULT 0,
    escalated_to_person_id UUID REFERENCES persons(id),
    escalation_date DATE,
    created_by_person_id UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Rule Management
CREATE TABLE society_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id),
    rule_name VARCHAR(255) NOT NULL,
    rule_content TEXT NOT NULL,
    rule_category VARCHAR(100),
    effective_from_date DATE NOT NULL,
    effective_to_date DATE,
    rule_version INTEGER DEFAULT 1,
    parent_rule_id UUID REFERENCES society_rules(id),
    amendment_reason TEXT,
    amendment_proposed_by_person_id UUID REFERENCES persons(id),
    amendment_approval_status VARCHAR(50) DEFAULT 'Pending', -- Pending, Approved, Rejected
    amendment_approved_by_person_id UUID REFERENCES persons(id),
    amendment_approved_date DATE,
    rule_status VARCHAR(50) DEFAULT 'Active', -- Active, Inactive, Superseded
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(society_id, rule_name, effective_from_date)
);

-- Rule Exception
CREATE TABLE rule_exceptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id UUID NOT NULL REFERENCES society_rules(id),
    person_id UUID REFERENCES persons(id),
    unit_id UUID REFERENCES units(id),
    exception_reason TEXT,
    exception_start_date DATE NOT NULL,
    exception_end_date DATE,
    approved_by_person_id UUID REFERENCES persons(id),
    approval_date DATE,
    exception_status VARCHAR(50) DEFAULT 'Pending', -- Pending, Approved, Rejected, Expired
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- PART 13: SYSTEM OPERATIONS & MONITORING
-- ============================================================================

-- Background Jobs Log
CREATE TABLE background_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_type VARCHAR(100) NOT NULL, -- bill_generation, penalty_calculation, notification_send, etc.
    job_status VARCHAR(50) DEFAULT 'Pending', -- Pending, Running, Success, Failed, Retry
    execution_start_time TIMESTAMP,
    execution_end_time TIMESTAMP,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    error_message TEXT,
    job_parameters JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Payment Gateway Webhook Log
CREATE TABLE webhook_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    webhook_event_type VARCHAR(100), -- payment.authorized, payment.failed, etc.
    webhook_provider VARCHAR(50), -- Razorpay, Twilio, etc.
    webhook_payload JSONB,
    webhook_received_at TIMESTAMP NOT NULL,
    webhook_processed_at TIMESTAMP,
    processing_status VARCHAR(50) DEFAULT 'Pending', -- Pending, Processing, Processed, Failed
    idempotency_key VARCHAR(255),
    retry_count INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(webhook_provider, idempotency_key)
);

-- API Request Log
CREATE TABLE api_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_timestamp TIMESTAMP NOT NULL,
    api_endpoint VARCHAR(255),
    request_method VARCHAR(10),
    request_body JSONB,
    response_status_code INTEGER,
    response_time_ms INTEGER,
    user_person_id UUID REFERENCES persons(id),
    ip_address VARCHAR(50),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- System Health Monitoring
CREATE TABLE system_health_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name VARCHAR(100), -- server_cpu, database_connections, storage_usage, etc.
    metric_value DECIMAL(10, 2),
    metric_unit VARCHAR(50),
    threshold_warning DECIMAL(10, 2),
    threshold_critical DECIMAL(10, 2),
    current_status VARCHAR(50), -- OK, Warning, Critical
    recorded_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_societies_active ON societies(is_active);
CREATE INDEX idx_memberships_society_status ON memberships(society_id, membership_status);
CREATE INDEX idx_unit_occupants_unit_id ON unit_occupants(unit_id);
CREATE INDEX idx_maintenance_bills_society_month ON maintenance_bills(society_id, bill_month);
CREATE INDEX idx_payments_society_status ON payments(society_id, payment_status);
CREATE INDEX idx_payment_allocations_payment_id ON payment_allocations(payment_id);
CREATE INDEX idx_complaints_society_status ON complaints(society_id, complaint_status);
CREATE INDEX idx_visitor_visits_unit_date ON visitor_visits(unit_id, visit_date);
CREATE INDEX idx_security_shifts_gate_date ON security_shifts(gate_id, shift_date);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_background_jobs_status ON background_jobs(job_status, created_at DESC);
CREATE INDEX idx_webhook_logs_status ON webhook_logs(processing_status, webhook_received_at DESC);
CREATE INDEX idx_committee_members_society ON committee_members(committee_id);
CREATE INDEX idx_elections_society_date ON elections(society_id, election_date);
CREATE INDEX idx_meetings_society_date ON meetings(society_id, meeting_date);

-- ============================================================================
-- END OF DATABASE SCHEMA
-- ============================================================================
