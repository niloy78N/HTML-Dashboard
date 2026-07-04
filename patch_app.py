import re

with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update App.init
old_init = '''    init() {
        this.loadBranding();
        this.initTheme();
        this.initClock();
        this.initMobileMenu();
        this.initProfileMenu();
        
        const isSettings = window.location.pathname.includes('settings.html');

        if(this.chartCtx && !isSettings) {
            this.initChart();
            this.renderEmptyState();
            this.initAuth(); // Handle Login logic
        } else {
            // We are on settings page
            this.fetchData(); // Skip login for settings page in this demo
        }
    },'''

new_init = '''    init() {
        const isAgentDashboard = window.location.pathname.includes('agent-dashboard.html');
        if (isAgentDashboard) {
            this.navMenu = [
                { title: "Dashboard", icon: "layout-dashboard", permission: "agent.view", url: "view-agent-dashboard", submenus: [] },
                { title: "My Numbers", icon: "hash", permission: "agent.view", url: "view-my-numbers", submenus: [] },
                { title: "SMS CDR", icon: "list", permission: "agent.view", url: "view-sms-cdr", submenus: [] },
                { title: "My Clients", icon: "users", permission: "agent.view", url: "view-clients", submenus: [] },
                { title: "Logout", icon: "log-out", permission: "agent.view", url: "javascript:App.logout()", isExternal: true }
            ];
        }

        this.loadBranding();
        this.initTheme();
        this.initClock();
        this.initMobileMenu();
        this.initProfileMenu();
        
        const isSettings = window.location.pathname.includes('settings.html');

        if(!isSettings) {
            if (this.chartCtx) this.initChart();
            this.renderEmptyState();
            this.initAuth(); // Handle Login logic
        } else {
            // We are on settings page
            this.fetchData(); // Skip login for settings page in this demo
        }
    },'''
content = content.replace(old_init, new_init)


# 2. Update initAuth Check
old_auth_check = '''        // Check Local Storage Session
        if (localStorage.getItem('simless_auth') === 'true') {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.classList.add('hidden'), 500);
            this.fetchData();
        }'''

new_auth_check = '''        // Check Local Storage Session
        if (localStorage.getItem('simless_auth') === 'true') {
            const role = localStorage.getItem('simless_role');
            if (role === 'agent' && !window.location.pathname.includes('agent-dashboard.html')) {
                window.location.href = 'agent-dashboard.html';
                return;
            } else if (role === 'owner' && window.location.pathname.includes('agent-dashboard.html')) {
                window.location.href = 'index.html';
                return;
            }
            if(overlay) {
                overlay.style.opacity = '0';
                setTimeout(() => overlay.classList.add('hidden'), 500);
            }
            this.fetchData();
        } else {
            if (window.location.pathname.includes('agent-dashboard.html')) {
                window.location.href = 'index.html';
                return;
            }
        }'''
content = content.replace(old_auth_check, new_auth_check)

# 3. Update authSuccess in loginForm submit
old_auth_success = '''                if (authSuccess) {
                    localStorage.setItem('simless_auth', 'true');
                    localStorage.setItem('simless_role', role);
                    localStorage.setItem('simless_user', u);
                    overlay.style.opacity = '0';
                    setTimeout(() => overlay.classList.add('hidden'), 500);
                    this.fetchData();
                } else {'''

new_auth_success = '''                if (authSuccess) {
                    localStorage.setItem('simless_auth', 'true');
                    localStorage.setItem('simless_role', role);
                    localStorage.setItem('simless_user', u);
                    if (role === 'agent') {
                        window.location.href = 'agent-dashboard.html';
                        return;
                    }
                    overlay.style.opacity = '0';
                    setTimeout(() => overlay.classList.add('hidden'), 500);
                    this.fetchData();
                } else {'''
content = content.replace(old_auth_success, new_auth_success)

# 4. Update fetchData
old_agent_permissions = '''                permissions: ['iprn.view', 'test.view', 'clients.view', 'stats.view', 'billing.view', 'account.view', 'news.view']
            };
        }'''

new_agent_permissions = '''                permissions: ['agent.view']
            };
        }'''
content = content.replace(old_agent_permissions, new_agent_permissions)

old_fetchData_routing = '''        if(this.chartCtx) {
            this.updateChartUI(apiResponse.chart);
            this.populateViews();
            
            if (role === 'owner') {
                this.switchView('view-dashboard');
                this.renderAgentManagement();
            } else {
                this.switchView('view-sms-ranges');
            }
        }
    },'''

new_fetchData_routing = '''        if(this.chartCtx) {
            this.updateChartUI(apiResponse.chart);
        }
        
        this.populateViews();
        
        if (role === 'owner') {
            this.switchView('view-dashboard');
            this.renderAgentManagement();
        } else {
            this.switchView('view-agent-dashboard');
            this.renderAgentDashboardStats();
        }
    },'''
content = content.replace(old_fetchData_routing, new_fetchData_routing)

# 5. Add renderAgentDashboardStats method
# We'll insert it right after renderAgentManagement
stats_method = '''
    renderAgentDashboardStats() {
        const username = localStorage.getItem('simless_user');
        const agents = JSON.parse(localStorage.getItem('simless_agents')) || [];
        const agent = agents.find(a => a.username === username);
        if (!agent) return;

        const balanceEl = document.getElementById('agentStatBalance');
        if (balanceEl) balanceEl.innerText = `$${parseFloat(agent.balance).toFixed(2)}`;

        let cdrData = JSON.parse(localStorage.getItem('simless_sms_cdr')) || [];
        this.setStat('agentStatSmsToday', 145);
        this.setStat('agentStatSmsWeek', 980);
        this.setStat('agentStatSmsMonth', 4250);

        this.setStat('agentStatActiveNumbers', 12);

        const activityBody = document.getElementById('agentActivityTableBody');
        if (activityBody) {
            const history = agent.loginHistory || [];
            if (history.length === 0) {
                activityBody.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-[var(--text-secondary)] font-medium">No activity found.</td></tr>`;
            } else {
                activityBody.innerHTML = history.slice(0,5).map(h => `
                    <tr class="hover:bg-[var(--color-primary-light)] transition-colors">
                        <td class="p-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary)]">${h.time}</td>
                        <td class="p-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">Login</td>
                        <td class="p-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">${h.ip || 'Unknown'}</td>
                        <td class="p-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">${h.device || 'Unknown'}</td>
                    </tr>
                `).join('');
            }
        }
    },
'''

# Find renderAgentManagement
idx = content.find('    renderAgentManagement() {')
if idx != -1:
    content = content[:idx] + stats_method + content[idx:]

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated app.js")
