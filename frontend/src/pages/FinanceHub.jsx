import React from 'react';
import TabbedPage from '../components/TabbedPage';
import FinanceContent from './Finance';
import FinancialStatementsContent from './FinancialStatements';
import InvestmentsContent from './Investments';
import ReportsContent from './Reports';

// Finance, Financial Statements, Investments & Assets, and Reports used to
// be four separate menu items - merged into one, as tabs, since they're all
// facets of the same "society's money" picture and a Secretary/Treasurer/
// Accountant naturally moves between them together.
const FinanceHub = () => (
  <TabbedPage
    title="Finance"
    subtitle="Collections, payments, statements, investments, and reports - all in one place"
    tabs={[
      { label: 'Finance', component: FinanceContent },
      { label: 'Financial Statements', component: FinancialStatementsContent },
      { label: 'Investments & Assets', component: InvestmentsContent },
      { label: 'Reports', component: ReportsContent },
    ]}
  />
);

export default FinanceHub;
