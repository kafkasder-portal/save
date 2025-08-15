import { lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
// import { ProtectedRoute } from './components/ProtectedRoute' // Removed - file deleted
// import {
//   withAidSuspense,
//   withDonationsSuspense,
//   withScholarshipSuspense,
//   withMessagesSuspense,
//   withFundSuspense,
//   withSystemSuspense,
//   withDefinitionsSuspense,
//   withDashboardSuspense,
//   withMeetingsSuspense,
//   withInternalMessagesSuspense,
//   withTasksSuspense
// } from './components/loading/ModuleSuspenseWrapper' // Removed - file deleted

// Login page (no protection needed)
const Login = lazy(() => import('./pages/Login'))
const NotFound = lazy(() => import('./pages/NotFound'))

// Donations
const DonationVault = lazy(() => import('./pages/donations/DonationVault'))
const Institutions = lazy(() => import('./pages/donations/Institutions'))
const CashDonations = lazy(() => import('./pages/donations/CashDonations'))
const BankDonations = lazy(() => import('./pages/donations/BankDonations'))
const CreditCardDonations = lazy(() => import('./pages/donations/CreditCardDonations'))
const DonationNumbers = lazy(() => import('./pages/donations/DonationNumbers'))
const FundingDefinitions = lazy(() => import('./pages/donations/FundingDefinitions'))
const SacrificePeriods = lazy(() => import('./pages/donations/SacrificePeriods'))
const SacrificeShares = lazy(() => import('./pages/donations/SacrificeShares'))
const RamadanPeriods = lazy(() => import('./pages/donations/RamadanPeriods'))
const PiggyBankTracking = lazy(() => import('./pages/donations/PiggyBankTracking'))
const BulkProvisioning = lazy(() => import('./pages/donations/BulkProvisioning'))

// Messages
const SmsDeliveries = lazy(() => import('./pages/messages/SmsDeliveries'))
const EmailDeliveries = lazy(() => import('./pages/messages/EmailDeliveries'))
const Analytics = lazy(() => import('./pages/messages/Analytics'))
const MessageModuleInfo = lazy(() => import('./pages/messages/ModuleInfo'))

// Scholarship
const ScholarshipReports = lazy(() => import('./pages/scholarship/Reports'))

// Dashboard
const DashboardIndex = lazy(() => import('./pages/dashboard/Index'))

// Supabase Test
const SupabaseTest = lazy(() => import('./components/SupabaseTest'))

// Aid
const AidIndex = lazy(() => import('./pages/aid/Index'))
const Beneficiaries = lazy(() => import('./pages/aid/Beneficiaries'))
const BeneficiariesDetail = lazy(() => import('./pages/aid/BeneficiariesDetail'))
const Reports = lazy(() => import('./pages/aid/Reports'))
const Applications = lazy(() => import('./pages/aid/Applications'))
const CashVault = lazy(() => import('./pages/aid/CashVault'))
const BankOrders = lazy(() => import('./pages/aid/BankOrders'))
const CashOperations = lazy(() => import('./pages/aid/CashOperations'))
const InKindOperations = lazy(() => import('./pages/aid/InKindOperations'))
const ServiceTracking = lazy(() => import('./pages/aid/ServiceTracking'))
const HospitalReferrals = lazy(() => import('./pages/aid/HospitalReferrals'))
const Parameters = lazy(() => import('./pages/aid/Parameters'))
const DataControl = lazy(() => import('./pages/aid/DataControl'))
const ModuleInfo = lazy(() => import('./pages/aid/ModuleInfo'))

// Fund
const FundMovements = lazy(() => import('./pages/fund/FundMovements'))
const CompleteReport = lazy(() => import('./pages/fund/CompleteReport'))
const FundRegions = lazy(() => import('./pages/fund/FundRegions'))
const WorkAreas = lazy(() => import('./pages/fund/WorkAreas'))
const FundDefinitions = lazy(() => import('./pages/fund/FundDefinitions'))
const ActivityDefinitions = lazy(() => import('./pages/fund/ActivityDefinitions'))
const SourcesExpenses = lazy(() => import('./pages/fund/SourcesExpenses'))
const AidCategories = lazy(() => import('./pages/fund/AidCategories'))

// System
const WarningMessages = lazy(() => import('./pages/system/WarningMessages'))
const StructuralControls = lazy(() => import('./pages/system/StructuralControls'))
const LocalIPs = lazy(() => import('./pages/system/LocalIPs'))
const IPBlocking = lazy(() => import('./pages/system/IPBlocking'))
const UserManagement = lazy(() => import('./pages/system/UserManagement'))

// Test Pages
const SentryTest = lazy(() => import('./pages/SentryTest'))

// Demo Pages
const RelatedRecordsDemo = lazy(() => import('./pages/demo/RelatedRecordsDemo'))

// Meetings
const MeetingsIndex = lazy(() => import('./pages/meetings/Index'))

// Internal Messages
const InternalMessagesIndex = lazy(() => import('./pages/internal-messages/Index'))

// Tasks
const TasksIndex = lazy(() => import('./pages/tasks/Index'))

// Definitions
const DefinitionsIndex = lazy(() => import('./pages/Definitions'))
const UnitRoles = lazy(() => import('./pages/definitions/UnitRoles'))
const Units = lazy(() => import('./pages/definitions/Units'))
const UserAccounts = lazy(() => import('./pages/definitions/UserAccounts'))
const PermissionGroupsClean = lazy(() => import('./pages/definitions/PermissionGroupsClean'))
const Buildings = lazy(() => import('./pages/definitions/Buildings'))
const InternalLines = lazy(() => import('./pages/definitions/InternalLines'))
const ProcessFlows = lazy(() => import('./pages/definitions/ProcessFlows'))
const PassportFormats = lazy(() => import('./pages/definitions/PassportFormats'))
const CountriesCities = lazy(() => import('./pages/definitions/CountriesCities'))
const InstitutionTypes = lazy(() => import('./pages/definitions/InstitutionTypes'))
const InstitutionStatus = lazy(() => import('./pages/definitions/InstitutionStatus'))
const DonationMethods = lazy(() => import('./pages/definitions/DonationMethods'))
const DeliveryTypes = lazy(() => import('./pages/definitions/DeliveryTypes'))
const MeetingRequests = lazy(() => import('./pages/definitions/MeetingRequests'))
const GSMCodes = lazy(() => import('./pages/definitions/GSMCodes'))
const InterfaceLanguages = lazy(() => import('./pages/definitions/InterfaceLanguages'))
const Translations = lazy(() => import('./pages/definitions/Translations'))
const GeneralSettings = lazy(() => import('./pages/definitions/GeneralSettings'))
const DefinitionsModuleInfo = lazy(() => import('./pages/definitions/ModuleInfo'))

function AppRoutes() {
  return (
    <Routes>
      {/* Login route */}
      <Route path="/login" element={<Login />} />
      
      {/* Dashboard */}
      <Route path="/" element={<DashboardIndex />} />
      
      {/* Donations routes */}
      <Route path="/donations/vault" element={<DonationVault />} />
      <Route path="/donations/institutions" element={<Institutions />} />
      <Route path="/donations/cash" element={<CashDonations />} />
      <Route path="/donations/bank" element={<BankDonations />} />
      <Route path="/donations/credit-card" element={<CreditCardDonations />} />
      <Route path="/donations/numbers" element={<DonationNumbers />} />
      <Route path="/donations/funding-definitions" element={<FundingDefinitions />} />
      <Route path="/donations/sacrifice-periods" element={<SacrificePeriods />} />
      <Route path="/donations/sacrifice-shares" element={<SacrificeShares />} />
      <Route path="/donations/ramadan-periods" element={<RamadanPeriods />} />
      <Route path="/donations/piggy-bank" element={<PiggyBankTracking />} />
      <Route path="/donations/bulk-provisioning" element={<BulkProvisioning />} />
      
      {/* Messages routes */}
      <Route path="/messages/sms-deliveries" element={<SmsDeliveries />} />
      <Route path="/messages/email-deliveries" element={<EmailDeliveries />} />
      <Route path="/messages/analytics" element={<Analytics />} />
      <Route path="/messages/module-info" element={<MessageModuleInfo />} />
      
      {/* Scholarship routes */}
      <Route path="/scholarship/reports" element={<ScholarshipReports />} />
      
      {/* Aid routes */}
      <Route path="/aid" element={<AidIndex />} />
      <Route path="/aid/beneficiaries" element={<Beneficiaries />} />
      <Route path="/aid/beneficiaries/:id" element={<BeneficiariesDetail />} />
      <Route path="/aid/reports" element={<Reports />} />
      <Route path="/aid/applications" element={<Applications />} />
      <Route path="/aid/cash-vault" element={<CashVault />} />
      <Route path="/aid/bank-orders" element={<BankOrders />} />
      <Route path="/aid/cash-operations" element={<CashOperations />} />
      <Route path="/aid/in-kind-operations" element={<InKindOperations />} />
      <Route path="/aid/service-tracking" element={<ServiceTracking />} />
      <Route path="/aid/hospital-referrals" element={<HospitalReferrals />} />
      <Route path="/aid/parameters" element={<Parameters />} />
      <Route path="/aid/data-control" element={<DataControl />} />
      <Route path="/aid/module-info" element={<ModuleInfo />} />
      
      {/* Fund routes */}
      <Route path="/fund/movements" element={<FundMovements />} />
      <Route path="/fund/complete-report" element={<CompleteReport />} />
      <Route path="/fund/regions" element={<FundRegions />} />
      <Route path="/fund/work-areas" element={<WorkAreas />} />
      <Route path="/fund/definitions" element={<FundDefinitions />} />
      <Route path="/fund/activity-definitions" element={<ActivityDefinitions />} />
      <Route path="/fund/sources-expenses" element={<SourcesExpenses />} />
      <Route path="/fund/aid-categories" element={<AidCategories />} />
      
      {/* System routes */}
      <Route path="/system/warning-messages" element={<WarningMessages />} />
      <Route path="/system/structural-controls" element={<StructuralControls />} />
      <Route path="/system/local-ips" element={<LocalIPs />} />
      <Route path="/system/ip-blocking" element={<IPBlocking />} />
      <Route path="/system/user-management" element={<UserManagement />} />
      
      {/* Definitions routes */}
      <Route path="/definitions" element={<DefinitionsIndex />} />
      <Route path="/definitions/unit-roles" element={<UnitRoles />} />
      <Route path="/definitions/units" element={<Units />} />
      <Route path="/definitions/user-accounts" element={<UserAccounts />} />
      <Route path="/definitions/permission-groups" element={<PermissionGroupsClean />} />
      <Route path="/definitions/buildings" element={<Buildings />} />
      <Route path="/definitions/internal-lines" element={<InternalLines />} />
      <Route path="/definitions/process-flows" element={<ProcessFlows />} />
      <Route path="/definitions/passport-formats" element={<PassportFormats />} />
      <Route path="/definitions/countries-cities" element={<CountriesCities />} />
      <Route path="/definitions/institution-types" element={<InstitutionTypes />} />
      <Route path="/definitions/institution-status" element={<InstitutionStatus />} />
      <Route path="/definitions/donation-methods" element={<DonationMethods />} />
      <Route path="/definitions/delivery-types" element={<DeliveryTypes />} />
      <Route path="/definitions/meeting-requests" element={<MeetingRequests />} />
      <Route path="/definitions/gsm-codes" element={<GSMCodes />} />
      <Route path="/definitions/interface-languages" element={<InterfaceLanguages />} />
      <Route path="/definitions/translations" element={<Translations />} />
      <Route path="/definitions/general-settings" element={<GeneralSettings />} />
      <Route path="/definitions/module-info" element={<DefinitionsModuleInfo />} />
      
      {/* Meetings */}
      <Route path="/meetings" element={<MeetingsIndex />} />
      
      {/* Internal Messages */}
      <Route path="/internal-messages" element={<InternalMessagesIndex />} />
      
      {/* Tasks */}
      <Route path="/tasks" element={<TasksIndex />} />
      
      {/* Test routes */}
      <Route path="/sentry-test" element={<SentryTest />} />
      <Route path="/supabase-test" element={<SupabaseTest />} />
      <Route path="/demo/related-records" element={<RelatedRecordsDemo />} />

      
      {/* Catch-all route for 404 errors */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRoutes
