'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, Download, Printer, Banknote, 
  PieChart, TrendingUp, TrendingDown, RefreshCw, School, Scale, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function AccountsProfitLossReportPage() {
  const [fiscalYear, setFiscalYear] = useState('2026');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPL = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/report/accounts/profit-loss?year=${fiscalYear}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (e) {
      console.error('Failed to load profit and loss report:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPL();
  }, [fiscalYear]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!data) return;
    const lines = [
      ['PAK ROYAL COLLEGE SHARAQPUR SHARIF'],
      ['OFFICIAL STATEMENT OF PROFIT & LOSS / OPERATIONAL MARGIN'],
      [`Fiscal Year: ${fiscalYear}`],
      [''],
      ['INCOME / REVENUE RECEIPTS', 'AMOUNT (PKR)', 'SHARE %'],
      ...data.incomeBreakdown.map(i => [`"${i.head}"`, i.amount, `${i.percentage}%`]),
      ['TOTAL REVENUE INFLOW', data.metrics.totalIncome, '100%'],
      [''],
      ['OPERATIONAL EXPENDITURES', 'AMOUNT (PKR)', 'SHARE %'],
      ...data.expenseBreakdown.map(e => [`"${e.head}"`, e.amount, `${e.percentage}%`]),
      ['TOTAL OPERATING EXPENSES', data.metrics.totalExpense, '100%'],
      [''],
      ['NET OPERATING SURPLUS / PROFIT', data.metrics.netSurplus, `${data.metrics.netMarginPercent}%`]
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + lines.map(l => l.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Profit_Loss_Statement_PRC_${fiscalYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Link href="/dashboard" className="hover:text-zinc-600">Dashboard</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/dashboard/report/accounts" className="hover:text-zinc-600">Accounts Report</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-[#084A86] font-bold">Profit &amp; Loss Statement</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-950 mt-1 flex items-center gap-2.5">
            <Scale className="h-6 w-6 text-[#084A86]" />
            Statement of Comprehensive Income, Expenditure &amp; Operating Margin
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Institutional revenue vs operating overheads, net surplus, and fiscal sustainability audit
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            className="text-xs font-semibold h-9 border-zinc-200 hover:bg-zinc-50"
          >
            <Download className="h-3.5 w-3.5 mr-1.5 text-[#084A86]" /> Export Statement CSV
          </Button>
          <Button
            onClick={handlePrint}
            size="sm"
            className="text-xs font-semibold h-9 bg-[#084A86] hover:bg-[#073d6e] text-white"
          >
            <Printer className="h-3.5 w-3.5 mr-1.5" /> Print Official Statement
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs print:hidden flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Label className="text-xs font-bold text-zinc-600 uppercase">Fiscal Year:</Label>
          <select
            value={fiscalYear}
            onChange={(e) => setFiscalYear(e.target.value)}
            className="text-xs font-bold bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#084A86]"
          >
            <option value="2026">Fiscal Year 2025-2026</option>
            <option value="2025">Fiscal Year 2024-2025</option>
          </select>
        </div>
        <Button onClick={fetchPL} variant="outline" size="sm" className="text-xs font-semibold h-8 border-zinc-200">
          <RefreshCw className="h-3.5 w-3.5 mr-1 text-zinc-500" /> Recalculate Ledger
        </Button>
      </div>

      {/* KPI Cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print:hidden">
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-xs">
            <span className="text-[11px] font-bold text-emerald-600 uppercase flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" /> Total Inflows (Revenue)
            </span>
            <p className="text-2xl font-black text-emerald-700 mt-1">
              PKR {data.metrics.totalIncome.toLocaleString()}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Gross institutional collections</p>
          </div>

          <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-xs">
            <span className="text-[11px] font-bold text-rose-600 uppercase flex items-center gap-1">
              <TrendingDown className="h-3.5 w-3.5" /> Total Operating Debits
            </span>
            <p className="text-2xl font-black text-rose-700 mt-1">
              PKR {data.metrics.totalExpense.toLocaleString()}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Salaries, utilities, labs, campus</p>
          </div>

          <div className="bg-white border-2 border-[#084A86]/40 rounded-2xl p-5 shadow-xs bg-blue-50/20">
            <span className="text-[11px] font-bold text-[#084A86] uppercase flex items-center gap-1">
              <Scale className="h-3.5 w-3.5" /> Net Operating Surplus
            </span>
            <p className="text-2xl font-black text-[#084A86] mt-1">
              PKR {data.metrics.netSurplus.toLocaleString()}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Positive retained operating balance</p>
          </div>

          <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-xs">
            <span className="text-[11px] font-bold text-zinc-400 uppercase">Operating Margin</span>
            <p className="text-2xl font-black text-zinc-950 mt-1">
              {data.metrics.netMarginPercent}%
            </p>
            <p className="text-xs text-emerald-600 font-semibold mt-1">Healthy institution ratio</p>
          </div>
        </div>
      )}

      {/* Main Official Statement Layout */}
      {loading ? (
        <div className="p-16 bg-white border border-zinc-200/80 rounded-2xl text-center text-zinc-400">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-[#084A86]" />
          Auditing institutional financial accounts...
        </div>
      ) : data ? (
        <div className="bg-white border-2 border-zinc-300 rounded-2xl shadow-md overflow-hidden max-w-5xl mx-auto print:border print:border-zinc-400 print:shadow-none print:max-w-none">
          {/* Header */}
          <div className="p-6 border-b-2 border-zinc-200 bg-zinc-50/70 print:bg-white text-center space-y-1">
            <div className="flex items-center justify-center gap-2">
              <School className="h-7 w-7 text-[#084A86]" />
              <h2 className="text-2xl font-black text-zinc-950 uppercase tracking-wide">
                Pak Royal College Sharaqpur Sharif
              </h2>
            </div>
            <p className="text-xs font-bold text-[#084A86] uppercase tracking-wider">
              Statutory Statement of Operating Revenues &amp; Expenditures (Profit &amp; Loss)
            </p>
            <p className="text-xs text-zinc-500 font-semibold">For the Fiscal Year Ended 2026 • Currencies Stated in PKR</p>
          </div>

          {/* Two-Column Income vs Expense Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-200">
            {/* Left: Revenue / Inflows */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b-2 border-emerald-600 pb-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-emerald-600" /> A. Institutional Revenues (Inflows)
                </h3>
                <span className="text-xs font-black text-emerald-800">PKR</span>
              </div>
              <table className="w-full text-xs">
                <tbody className="divide-y divide-zinc-100">
                  {data.incomeBreakdown.map((item, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50">
                      <td className="py-2.5 font-medium text-zinc-800">{item.head}</td>
                      <td className="py-2.5 text-right font-mono text-zinc-500">{item.percentage}%</td>
                      <td className="py-2.5 text-right font-bold text-zinc-950">
                        {item.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-zinc-300 font-black text-xs text-emerald-900 bg-emerald-50/60">
                    <td className="py-3 uppercase">Total Revenue (A):</td>
                    <td></td>
                    <td className="py-3 text-right text-sm">
                      PKR {data.metrics.totalIncome.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Right: Operational Expenditures */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b-2 border-rose-600 pb-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                  <TrendingDown className="h-4 w-4 text-rose-600" /> B. Operational Expenditures (Outflows)
                </h3>
                <span className="text-xs font-black text-rose-800">PKR</span>
              </div>
              <table className="w-full text-xs">
                <tbody className="divide-y divide-zinc-100">
                  {data.expenseBreakdown.map((item, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50">
                      <td className="py-2.5 font-medium text-zinc-800">{item.head}</td>
                      <td className="py-2.5 text-right font-mono text-zinc-500">{item.percentage}%</td>
                      <td className="py-2.5 text-right font-bold text-zinc-950">
                        {item.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-zinc-300 font-black text-xs text-rose-900 bg-rose-50/60">
                    <td className="py-3 uppercase">Total Expenses (B):</td>
                    <td></td>
                    <td className="py-3 text-right text-sm">
                      PKR {data.metrics.totalExpense.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Bottom Net Balance Strip */}
          <div className="p-6 border-t-2 border-zinc-300 bg-zinc-100/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Institutional Bottomline</span>
              <h4 className="text-base font-black text-zinc-950">
                Net Operating Balance / Fiscal Surplus (A - B)
              </h4>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-emerald-800 block">
                PKR {data.metrics.netSurplus.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-emerald-700">
                Operating Net Margin: {data.metrics.netMarginPercent}%
              </span>
            </div>
          </div>

          {/* Official Signatures */}
          <div className="grid grid-cols-3 gap-6 p-8 border-t border-zinc-200 text-center text-xs">
            <div className="border-t border-zinc-400 pt-2 font-bold text-zinc-700">
              Chief Accountant
            </div>
            <div className="border-t border-zinc-400 pt-2 font-bold text-zinc-700">
              Internal Audit Committee
            </div>
            <div className="border-t border-zinc-400 pt-2 font-bold text-zinc-700">
              Principal / Board of Governors
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
