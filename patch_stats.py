import re

with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_update_stats = '''    updateStatsUI(stats) {
        this.setStat('statTodaySMS', stats.todaySMS);
        this.setStat('statYesterdaySMS', stats.yesterdaySMS);
        this.setStat('statThisWeekSMS', stats.thisWeekSMS);
        this.setStat('statThisMonthSMS', stats.thisMonthSMS);
        this.setStat('kpiNewAccounts', stats.newAccounts);
        this.setStat('kpiNewNumbers', stats.newNumbers);
        this.setStat('kpiTodaySMS', stats.todaySMS);
    }'''

new_update_stats = '''    updateStatsUI(stats) {
        this.setStat('statTodaySMS', stats.todaySMS);
        this.setStat('statYesterdaySMS', stats.yesterdaySMS);
        this.setStat('statThisWeekSMS', stats.thisWeekSMS);
        this.setStat('statThisMonthSMS', stats.thisMonthSMS);
        this.setStat('kpiNewAccounts', stats.newAccounts);
        this.setStat('kpiNewNumbers', stats.newNumbers);
        this.setStat('kpiTodaySMS', stats.todaySMS);

        // Update real Agent specific stats
        const username = localStorage.getItem('simless_user');
        const agents = JSON.parse(localStorage.getItem('simless_agents')) || [];
        const agent = agents.find(a => a.username === username);
        
        if (agent) {
            const balanceEl = document.getElementById('agentStatBalance');
            if (balanceEl) balanceEl.innerText = '$' + parseFloat(agent.balance || 0).toFixed(2);
            
            const activeNumbers = (JSON.parse(localStorage.getItem('simless_my_numbers')) || []).length;
            const numbersEl = document.getElementById('agentStatActiveNumbers');
            if (numbersEl) numbersEl.innerText = activeNumbers;

            const activityBody = document.getElementById('agentActivityTableBody');
            if (activityBody) {
                const history = agent.loginHistory || [];
                if (history.length === 0) {
                    activityBody.innerHTML = '<tr><td colspan="4" class="p-8 text-center text-[var(--text-secondary)] font-medium">No activity found.</td></tr>';
                } else {
                    activityBody.innerHTML = history.slice(0,5).map(h => 
                        '<tr class="hover:bg-[var(--color-primary-light)] transition-colors">' +
                            '<td class="p-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary)]">' + h.time + '</td>' +
                            '<td class="p-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">Login</td>' +
                            '<td class="p-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">' + (h.ip || 'Unknown') + '</td>' +
                            '<td class="p-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">' + (h.device || 'Unknown') + '</td>' +
                        '</tr>'
                    ).join('');
                }
            }
        }
    }'''

content = content.replace(old_update_stats, new_update_stats)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated updateStatsUI in app.js')
