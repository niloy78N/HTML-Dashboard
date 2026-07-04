import re

with open('agent-dashboard.html', 'r', encoding='utf-8') as f:
    content = f.read()

dashboard_start = content.find('<div id="view-dashboard"')
dashboard_end = content.find('<!-- SMS Test Panel View -->')

if dashboard_start != -1 and dashboard_end != -1:
    new_dashboard = '''<div id="view-dashboard" class="max-w-7xl mx-auto space-y-8 view-section active">
                  <!-- Feature Cards (same as owner for navigation) -->
                  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
                      <button onclick="App.switchView('view-dashboard')" class="glass-card feature-btn p-6 flex flex-col items-center justify-center gap-4 text-center group">
                          <div class="w-14 h-14 rounded-2xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <i data-lucide="monitor" class="w-7 h-7"></i>
                          </div>
                          <span class="font-semibold text-sm text-[var(--text-primary)]">Dashboard</span>
                      </button>
                      <button onclick="App.switchView('view-sms-ranges')" class="glass-card feature-btn p-6 flex flex-col items-center justify-center gap-4 text-center group">
                          <div class="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <i data-lucide="hash" class="w-7 h-7"></i>
                          </div>
                          <span class="font-semibold text-sm text-[var(--text-primary)]">Ranges</span>
                      </button>
                      <button onclick="App.switchView('view-clients')" class="glass-card feature-btn p-6 flex flex-col items-center justify-center gap-4 text-center group">
                          <div class="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <i data-lucide="users" class="w-7 h-7"></i>
                          </div>
                          <span class="font-semibold text-sm text-[var(--text-primary)]">Clients</span>
                      </button>
                      <button onclick="App.switchView('view-sms-cdr')" class="glass-card feature-btn p-6 flex flex-col items-center justify-center gap-4 text-center group">
                          <div class="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-900/20 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <i data-lucide="pie-chart" class="w-7 h-7"></i>
                          </div>
                          <span class="font-semibold text-sm text-[var(--text-primary)]">Statistics</span>
                      </button>
                      <button onclick="App.switchView('view-my-numbers')" class="glass-card feature-btn p-6 flex flex-col items-center justify-center gap-4 text-center group col-span-2 md:col-span-1">
                          <div class="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 text-[var(--text-secondary)] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <i data-lucide="smartphone" class="w-7 h-7"></i>
                          </div>
                          <span class="font-semibold text-sm text-[var(--text-primary)]">My Numbers</span>
                      </button>
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div class="glass-card p-6 flex flex-col justify-center items-center text-center group hover:-translate-y-1 transition-transform duration-300">
                        <div id="agentStatBalance" class="text-3xl font-display font-bold text-[var(--color-primary)] mb-2">$0.00</div>
                        <div class="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Total Balance</div>
                    </div>
                    <div class="glass-card p-6 flex flex-col justify-center items-center text-center group hover:-translate-y-1 transition-transform duration-300">
                        <div id="agentStatActiveNumbers" class="text-3xl font-display font-bold text-[var(--text-primary)] mb-2">0</div>
                        <div class="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Active Numbers</div>
                    </div>
                    <div class="glass-card p-6 flex flex-col justify-center items-center text-center group hover:-translate-y-1 transition-transform duration-300">
                        <div id="statTodaySMS" class="text-3xl font-display font-bold text-[var(--text-primary)] mb-2">0</div>
                        <div class="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">SMS Today</div>
                    </div>
                    <div class="glass-card p-6 flex flex-col justify-center items-center text-center group hover:-translate-y-1 transition-transform duration-300">
                        <div class="text-3xl font-display font-bold text-[var(--text-primary)] mb-2"><span id="statThisWeekSMS">0</span> / <span id="statThisMonthSMS">0</span></div>
                        <div class="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">SMS Wk / Mo</div>
                    </div>
                </div>

                <div class="glass-card overflow-hidden">
                    <div class="p-6 border-b border-[var(--border-color)] flex justify-between items-center">
                        <h3 class="text-lg font-bold text-[var(--text-primary)]">Recent Activity Log</h3>
                    </div>
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="border-b border-[var(--border-color)] bg-[var(--bg-color)]">
                                <th class="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Time</th>
                                <th class="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Action</th>
                                <th class="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">IP</th>
                                <th class="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Device</th>
                            </tr>
                        </thead>
                        <tbody id="agentActivityTableBody" class="divide-y divide-[var(--border-color)]">
                        </tbody>
                    </table>
                </div>
            </div>
            
            '''
    
    content = content[:dashboard_start] + new_dashboard + content[dashboard_end:]
    with open('agent-dashboard.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Updated agent-dashboard.html successfully')
else:
    print('Failed to find markers')
