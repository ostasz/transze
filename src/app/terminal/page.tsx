
"use client";

import { KpiSnapshotRow } from "@/components/terminal/v2/KpiSnapshotRow";
import { RdnSnapshotCard } from "@/components/terminal/v2/RdnSnapshotCard";
import { FuturesTableV2 } from "@/components/terminal/v2/FuturesTableV2";
import { ProspectCtaCard } from "@/components/terminal/v2/ProspectCtaCard";
import { AccountManagerCard } from "@/components/terminal/v2/AccountManagerCard";
import { NewsWidgetV2 } from "@/components/terminal/v2/NewsWidgetV2";

export default function TerminalV2Page() {
    return (
        <div className="space-y-4 p-4 md:p-0 h-full overflow-y-auto">
            {/* 1. Main Grid Layout - KPIs moved inside left col */}

            {/* 2. Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full min-h-[800px]">

                {/* Left Column (Wide) - Analytics & Quotes */}
                <div className="lg:col-span-3 flex flex-col gap-4">
                    {/* Top KPI Row (Ticker) constrained to this column */}
                    <div className="w-full">
                        <KpiSnapshotRow />
                    </div>

                    {/* RDN Snapshot */}
                    <div className="w-full h-[380px]">
                        <RdnSnapshotCard />
                    </div>

                    {/* Futures Table */}
                    <div className="w-full flex-1 min-h-[500px]">
                        <FuturesTableV2 />
                    </div>
                </div>

                {/* Right Column (Narrow) - CTA & News */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                    {/* Account Manager Card */}
                    <div className="w-full shrink-0">
                        <AccountManagerCard />
                    </div>

                    {/* Prospect CTA (Conditional logic handled inside component, but layout space reserved) */}
                    <div className="w-full shrink-0">
                        <ProspectCtaCard />
                    </div>

                    {/* News Feed */}
                    <div className="w-full flex-1 min-h-[400px]">
                        <NewsWidgetV2 />
                    </div>
                </div>

            </div>
        </div>
    );
}
