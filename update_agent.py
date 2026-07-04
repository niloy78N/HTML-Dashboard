import re

with open('agent-dashboard.html', 'r', encoding='utf-8') as f:
    content = f.read()

agent_dashboard_html = '''
            <!-- Agent Dashboard View -->
            <div id="view-agent-dashboard" class="max-w-7xl mx-auto space-y-8 view-section active">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-display font-bold text-[var(--text-primary)]">Agent Dashboard</h2>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div class="glass-card p-6 flex flex-col justify-center items-center text-center">
                        <div id="agentStatBalance" class="text-3xl font-display font-bold text-[var(--color-primary)] mb-2">$0.00</div>
                        <div class="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Total Balance</div>
                    </div>
                    <div class="glass-card p-6 flex flex-col justify-center items-center text-center">
                        <div id="agentStatActiveNumbers" class="text-3xl font-display font-bold text-[var(--text-primary)] mb-2">0</div>
                        <div class="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Active Numbers</div>
                    </div>
                    <div class="glass-card p-6 flex flex-col justify-center items-center text-center">
                        <div id="agentStatSmsToday" class="text-3xl font-display font-bold text-[var(--text-primary)] mb-2">0</div>
                        <div class="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">SMS Today</div>
                    </div>
                    <div class="glass-card p-6 flex flex-col justify-center items-center text-center">
                        <div class="text-3xl font-display font-bold text-[var(--text-primary)] mb-2"><span id="agentStatSmsWeek">0</span> / <span id="agentStatSmsMonth">0</span></div>
                        <div class="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">SMS Wk / Mo</div>
                    </div>
                </div>

                <div class="glass-card overflow-hidden">
                    <div class="p-6 border-b border-[var(--border-color)]">
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

main_start = content.find('<main')
main_end = content.find('</main>', main_start)

if main_start != -1 and main_end != -1:
    main_content = content[main_start:main_end]
    
    def extract_view(view_id):
        v_start = main_content.find(f'id="{view_id}"')
        if v_start == -1: return ''
        v_start = main_content.rfind('<div', 0, v_start)
        div_count = 0
        for i in range(v_start, len(main_content)):
            if main_content[i:i+4] == '<div':
                div_count += 1
            elif main_content[i:i+5] == '</div':
                div_count -= 1
                if div_count == 0:
                    return main_content[v_start:i+6]
        return ''
        
    view_my_numbers = extract_view('view-my-numbers')
    view_sms_cdr = extract_view('view-sms-cdr')
    view_clients = extract_view('view-clients')
    
    # We must ensure the extracted strings are not empty and we append them.
    # The original main tag has classes we want to keep
    main_tag_end = content.find('>', main_start)
    main_tag = content[main_start:main_tag_end+1]
    
    new_main_content = main_tag + '\n' + agent_dashboard_html + '\n' + view_my_numbers + '\n' + view_sms_cdr + '\n' + view_clients + '\n'
    
    content = content[:main_start] + new_main_content + content[main_end:]
    
    with open('agent-dashboard.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Successfully updated agent-dashboard.html views')
else:
    print('Could not find <main> block')
