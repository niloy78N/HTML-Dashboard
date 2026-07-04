import re

with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove the custom navMenu injection from init()
old_init = '''    init() {
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

        this.loadBranding();'''

new_init = '''    init() {
        this.loadBranding();'''
content = content.replace(old_init, new_init)

# 2. Update agent permissions in fetchData()
old_agent_permissions = '''                permissions: ['agent.view']
            };
        }'''

new_agent_permissions = '''                permissions: ['dashboard.view', 'iprn.view', 'clients.view', 'stats.view', 'billing.view', 'account.view']
            };
        }'''
content = content.replace(old_agent_permissions, new_agent_permissions)

# 3. Update fetchData() routing
old_fetchData_routing = '''        if (role === 'owner') {
            this.switchView('view-dashboard');
            this.renderAgentManagement();
        } else {
            this.switchView('view-agent-dashboard');
            this.renderAgentDashboardStats();
        }'''

new_fetchData_routing = '''        if (role === 'owner') {
            this.switchView('view-dashboard');
            this.renderAgentManagement();
        } else {
            this.switchView('view-dashboard');
        }'''
content = content.replace(old_fetchData_routing, new_fetchData_routing)

# 4. Remove fake numbers from fetchNumbers
old_fetchNumbers = '''    fetchNumbers(grid) {
        try {
            // Mock API Response properly parsed
            const mockResponseJson = JSON.stringify([
                { id: 1, country: 'United States', code: '+1', flag: '🇺🇸', available: 1500, price: 1.50 },
                { id: 2, country: 'United Kingdom', code: '+44', flag: '🇬🇧', available: 800, price: 1.20 },
                { id: 3, country: 'Canada', code: '+1', flag: '🇨🇦', available: 450, price: 1.40 }
            ]);

            const data = JSON.parse(mockResponseJson);'''

new_fetchNumbers = '''    fetchNumbers(grid) {
        try {
            const data = JSON.parse(localStorage.getItem('simless_api_numbers') || '[]');'''
content = content.replace(old_fetchNumbers, new_fetchNumbers)

# 5. Remove renderAgentDashboardStats method entirely, since it's no longer needed and contained demo data
idx_start = content.find('    renderAgentDashboardStats() {')
if idx_start != -1:
    idx_end = content.find('    requestNumbers() {', idx_start)
    if idx_end != -1:
        content = content[:idx_start] + content[idx_end:]


with open('app.js', 'w', encoding='utf-8') as f:
    f.write(content)
print('Cleaned up app.js for generic navigation and real data')
