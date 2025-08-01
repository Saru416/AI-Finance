import React from 'react'
import CreateAccountDrawer from "@/components/create-account-drawer";
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { getAccounts } from '@/actions/dashboard.js';
import AccountCard from './_components/account-card';
import { getCurrentBudget } from '@/actions/budget';
import BudgetProgress from './_components/budget-progress';

const DashboardPage = async () => {

  const accounts = await getAccounts();

  const defaultAccount = accounts?.find((account) => account.isDefault);

  let budgetData = null;
  if (defaultAccount){
    budgetData = await getCurrentBudget(defaultAccount.id);
  }

  return (
    <div className='px-5'>
      {/* Budget Progress */}
      {defaultAccount && <BudgetProgress
        initialBudget = {budgetData?.budget}
        currentExpenses={budgetData?.currentExpenses || 0}
      />}

      {/* Overview */}

      {/* Accounts Grid */}
      <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
        <CreateAccountDrawer>
          <Card className='hover:shodow-md transition-shadow cursor-pointer border-dashed'>
            <CardContent className='flex flex-col items-center justify-center h-full text-muted-foreground pt-5'>
              <Plus className='h-10 w-10 mb-2'/>
              <p className='text-sm font-medium'>Add New Account</p>
            </CardContent>
          </Card>
        </CreateAccountDrawer>

        {accounts.length>0 && accounts?.map((account) => {
          return <AccountCard key={account.id} account = {account}/>
        })}
      </div>
    </div>
  )
}

export default DashboardPage;
